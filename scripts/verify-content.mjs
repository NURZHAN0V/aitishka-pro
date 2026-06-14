import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = 'content/posts'
const files = readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'index.json')
const index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8'))
const issues = []

for (const f of files) {
  const p = JSON.parse(readFileSync(join(dir, f), 'utf8'))
  if (p.description !== undefined)
    issues.push(`${f}: has description`)
  if (!p.meta?.description)
    issues.push(`${f}: missing meta.description`)
  if (p.cover && !p.cover.startsWith('/media/'))
    issues.push(`${f}: bad cover ${p.cover}`)
  const body = p.body || ''
  if (/<(?:iframe|div|table|script|template|button)\b/i.test(body))
    issues.push(`${f}: raw html`)
  if (/^\|.+?\|/m.test(body))
    issues.push(`${f}: gfm table`)
  if (/^- \[[ x]\]/im.test(body))
    issues.push(`${f}: checklist`)
  if (/!\[[^\]]*\]\(https?:\/\/[^)]+\)/.test(body) || /cms\.pluspixel|static\.dublecode|myjino\.ru/.test(p.cover))
    issues.push(`${f}: external media url`)
  if (!/^\/articles\/[^/]+\/[^/]+\/[^/]+$/.test(p.url))
    issues.push(`${f}: bad url ${p.url}`)
}

const indexed = new Set(index.map(x => x.slug))
for (const f of files) {
  if (!indexed.has(f.replace('.json', '')))
    issues.push(`orphan file ${f}`)
}
for (const s of indexed) {
  if (!files.includes(`${s}.json`))
    issues.push(`missing file ${s}`)
}

console.log(`posts ${files.length}, index ${index.length}, issues ${issues.length}`)
issues.forEach(i => console.log(' ', i))
