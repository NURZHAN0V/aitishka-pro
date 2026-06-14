/**
 * Replace unreachable external image URLs with local WebP placeholders.
 * Run: node scripts/placeholder-media.mjs
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const POSTS_DIR = join(process.cwd(), 'content', 'posts')
const POSTS_MEDIA = join(process.cwd(), 'public', 'media', 'posts')

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 40) || 'image'
}

async function createPlaceholder(dest, label) {
  mkdirSync(join(dest, '..'), { recursive: true })
  const text = (label || 'AITISHKAPRO').slice(0, 40)
  const svg = `<svg width="960" height="540" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#1e3a5f"/>
    <text x="50%" y="50%" fill="#ffffff" font-family="Arial,sans-serif" font-size="28" text-anchor="middle" dominant-baseline="middle">${text.replace(/[<>&]/g, '')}</text>
  </svg>`
  await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(dest)
}

async function main() {
  const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json')
  let replaced = 0

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
      const filename = `${String(index).padStart(2, '0')}-${slugify(alt || 'image')}.webp`
      const dest = join(POSTS_MEDIA, post.slug, filename)
      const publicPath = `/media/posts/${post.slug}/${filename}`

      await createPlaceholder(dest, alt || post.title)
      body = body.replace(full, `![${alt}](${publicPath})`)
      replaced++
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
  console.log(`Created ${replaced} placeholder images`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
