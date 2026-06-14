/**
 * Restore corrupted markdown bodies from git and apply safe normalization.
 * Fixes setextToAtx bug: ``` + --- was converted to ## ```
 *
 * Run: node scripts/repair-markdown-bodies.mjs
 */
import { execSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const POSTS_DIR = join(process.cwd(), 'content', 'posts')

function stripLeadingH1(body) {
  return body.replace(/^#\s+(?:\S.*|[\t\v\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF])\n+/, '')
}

function fixPluspixelLinks(body) {
  return body
    .replace(
      /https:\/\/pluspixel\.ru\/dlya-vzroslyh\/veb-razrabotka\/kak-podklyuchit-domen-k-vps-na-ubuntu-nginx/g,
      'https://aitishka.pro/articles/dlya-vzroslyh/veb-razrabotka/kak-podklyuchit-domen-k-vps-na-ubuntu-nginx-1',
    )
    .replace(/https:\/\/pluspixel\.ru\//g, 'https://aitishka.pro/articles/')
}

function fixBrokenFenceHeadings(body) {
  return body
    .replace(/^## ```\s*$/gm, '```')
    .replace(/\n## ```\n/g, '\n```\n')
}

function demoteNumberedStepHeaders(body) {
  return body.replace(/^## (\d+\.\s*(?:\S.*|[\t\v\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]))$/gm, '**$1**')
}

function demoteAccidentalSetextHeaders(body) {
  // Paragraphs wrongly promoted to h2 by broken setext pass
  return body
    .replace(/^## (Это нужно для .+)$/gm, '$1')
    .replace(/^## (- .+)$/gm, '$1')
}

function normalizeHorizontalRules(body) {
  return body.replace(/\n---\n/g, '\n\n')
}

function normalizeWhitespace(body) {
  return body.replace(/\n{3,}/g, '\n\n').trim()
}

function safeNormalize(body) {
  let result = body
  result = stripLeadingH1(result)
  result = fixPluspixelLinks(result)
  result = fixBrokenFenceHeadings(result)
  result = demoteNumberedStepHeaders(result)
  result = demoteAccidentalSetextHeaders(result)
  result = normalizeHorizontalRules(result)
  return normalizeWhitespace(result)
}

function getGitBody(slug) {
  try {
    const raw = execSync(`git show HEAD:content/posts/${slug}.json`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    const post = JSON.parse(raw.replace(/^\uFEFF/, ''))
    return post.body || ''
  }
  catch {
    return null
  }
}

function needsRepair(body) {
  return (
    body.includes('## ```')
    || /^## \d+\./m.test(body)
    || /^## - /m.test(body)
    || /^## Это нужно/m.test(body)
  )
}

function main() {
  const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json')
  let repaired = 0
  let fixedInPlace = 0

  for (const file of files) {
    const path = join(POSTS_DIR, file)
    const post = JSON.parse(readFileSync(path, 'utf8'))
    const currentBody = post.body || ''

    if (!needsRepair(currentBody))
      continue

    const gitBody = getGitBody(post.slug)
    const source = gitBody && gitBody.length > 100 ? gitBody : currentBody
    const normalized = safeNormalize(source)

    if (normalized !== currentBody) {
      post.body = normalized
      writeFileSync(path, `${JSON.stringify(post, null, 2)}\n`)
      repaired++
      console.log(`✓ ${post.slug} (${gitBody ? 'from git' : 'in-place'})`)
    }
    else {
      fixedInPlace++
    }
  }

  // Second pass: fix any remaining ## ``` in all posts
  for (const file of files) {
    const path = join(POSTS_DIR, file)
    const post = JSON.parse(readFileSync(path, 'utf8'))
    if (!post.body?.includes('## ```'))
      continue

    post.body = safeNormalize(post.body)
    writeFileSync(path, `${JSON.stringify(post, null, 2)}\n`)
    repaired++
    console.log(`✓ fence fix: ${post.slug}`)
  }

  const summaries = JSON.parse(readFileSync(join(POSTS_DIR, 'index.json'), 'utf8'))
  for (const summary of summaries) {
    const path = join(POSTS_DIR, `${summary.slug}.json`)
    const post = JSON.parse(readFileSync(path, 'utf8'))
    Object.assign(summary, { ...post, body: undefined })
  }
  writeFileSync(join(POSTS_DIR, 'index.json'), `${JSON.stringify(summaries, null, 2)}\n`)

  console.log(`\nRepaired ${repaired} posts (${fixedInPlace} unchanged after normalize)`)
}

main()
