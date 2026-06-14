/**
 * Retry failed inline image downloads.
 * Run: node scripts/retry-media.mjs
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const POSTS_DIR = join(process.cwd(), 'content', 'posts')
const POSTS_MEDIA = join(process.cwd(), 'public', 'media', 'posts')

async function download(url) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok)
    throw new Error(`${res.status} ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function saveWebp(buffer, dest, maxWidth) {
  mkdirSync(dirname(dest), { recursive: true })
  await sharp(buffer).rotate().resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality: 80 }).toFile(dest)
}

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 40) || 'image'
}

async function migrateImage(post, alt, rawUrl, index) {
  const filename = `${String(index).padStart(2, '0')}-${slugify(alt || 'image')}.webp`
  const dest = join(POSTS_MEDIA, post.slug, filename)
  const publicPath = `/media/posts/${post.slug}/${filename}`

  const buf = await download(rawUrl)
  await saveWebp(buf, dest, 1200)
  return publicPath
}

async function main() {
  const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json')
  let fixed = 0

  for (const file of files) {
    const path = join(POSTS_DIR, file)
    const post = JSON.parse(readFileSync(path, 'utf8'))
    const re = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g
    let index = 0
    let body = post.body || ''

    for (const match of body.matchAll(re)) {
      const [full, alt, url] = match
      if (url.includes('aitishka.pro'))
        continue
      index++
      try {
        const publicPath = await migrateImage(post, alt, url, index)
        body = body.replace(full, `![${alt}](${publicPath})`)
        fixed++
        console.log(`OK ${post.slug}: ${url.slice(0, 60)}…`)
      }
      catch (err) {
        console.warn(`FAIL ${post.slug}: ${url} — ${err.message}`)
      }
    }

    post.body = body
    writeFileSync(path, `${JSON.stringify(post, null, 2)}\n`)
  }

  const summaries = JSON.parse(readFileSync(join(POSTS_DIR, 'index.json'), 'utf8'))
  for (const summary of summaries) {
    const post = JSON.parse(readFileSync(join(POSTS_DIR, `${summary.slug}.json`), 'utf8'))
    Object.assign(summary, { ...post, body: undefined })
  }
  writeFileSync(join(POSTS_DIR, 'index.json'), `${JSON.stringify(summaries, null, 2)}\n`)
  console.log(`Retried media: ${fixed} images migrated`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
