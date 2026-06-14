/**
 * Download post images, convert to WebP, update JSON paths.
 * Run: node scripts/normalize-media.mjs
 */
import { createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const POSTS_DIR = join(root, 'content', 'posts')
const MEDIA_ROOT = join(root, 'public', 'media')
const POSTS_MEDIA = join(MEDIA_ROOT, 'posts')
const DEFAULT_COVER = join(MEDIA_ROOT, 'default-cover.webp')
const STRAPI_BASE = 'https://cms.pluspixel.ru'

const urlCache = new Map()

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
}

async function downloadBuffer(url) {
  if (urlCache.has(url))
    return urlCache.get(url)

  const res = await fetch(url)
  if (!res.ok)
    throw new Error(`${res.status} ${url}`)

  const buf = Buffer.from(await res.arrayBuffer())
  urlCache.set(url, buf)
  return buf
}

function resolveRemoteUrl(raw) {
  if (!raw || typeof raw !== 'string')
    return null
  if (raw.startsWith('http'))
    return raw.split('?')[0]
  if (raw.startsWith('/uploads/'))
    return `${STRAPI_BASE}${raw}`
  if (raw.startsWith('/media/aHR0')) {
    const ext = extname(raw) || '.png'
    return `${STRAPI_BASE}/uploads/default${ext}`
  }
  return null
}

function extractImageUrls(body) {
  const urls = []
  const re = /!\[[^\]]*\]\(([^)]+)\)/g
  for (const m of body.matchAll(re)) {
    const url = m[1].trim()
    if (url.startsWith('http') || url.startsWith('/'))
      urls.push(url)
  }
  return urls
}

async function saveWebp(buffer, destPath, { maxWidth, quality = 80 }) {
  mkdirSync(dirname(destPath), { recursive: true })
  await sharp(buffer)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toFile(destPath)
}

async function ensureDefaultCover() {
  if (existsSync(DEFAULT_COVER))
    return

  mkdirSync(MEDIA_ROOT, { recursive: true })
  await sharp({
    create: {
      width: 1600,
      height: 900,
      channels: 3,
      background: { r: 30, g: 58, b: 95 },
    },
  })
    .webp({ quality: 80 })
    .toFile(DEFAULT_COVER)
}

async function fetchImageBuffer(url) {
  const resolved = resolveRemoteUrl(url) || url
  if (!resolved.startsWith('http'))
    return null

  try {
    return await downloadBuffer(resolved)
  }
  catch {
    if (resolved.includes('cms.pluspixel.ru')) {
      try {
        return await downloadBuffer(`${STRAPI_BASE}/uploads/default.webp`)
      }
      catch {
        return null
      }
    }
    return null
  }
}

async function fetchCoverFromStrapi(slug) {
  try {
    const res = await fetch(
      `${STRAPI_BASE}/api/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=cover`,
    )
    if (!res.ok)
      return null
    const json = await res.json()
    const item = json?.data?.[0]
    const url = item?.attributes?.cover?.data?.attributes?.url
      || item?.cover?.data?.attributes?.url
    return url ? resolveRemoteUrl(url) : null
  }
  catch {
    return null
  }
}

async function migrateCover(post, bodyUrls) {
  const dest = join(POSTS_MEDIA, `${post.slug}-cover.webp`)
  const publicPath = `/media/posts/${post.slug}-cover.webp`
  const legacyCover = post._legacyCover

  const strapiCover = await fetchCoverFromStrapi(post.slug)
  const candidates = [legacyCover, strapiCover, ...bodyUrls].filter(Boolean)
  for (const candidate of candidates) {
    const buf = await fetchImageBuffer(candidate)
    if (buf) {
      await saveWebp(buf, dest, { maxWidth: 1600 })
      return publicPath
    }
  }

  await ensureDefaultCover()
  await sharp(readFileSync(DEFAULT_COVER)).webp({ quality: 80 }).toFile(dest)
  return publicPath
}

async function migrateInlineImages(post, body) {
  const re = /!\[([^\]]*)\]\(([^)]+)\)/g
  let index = 0
  const replacements = []

  for (const match of body.matchAll(re)) {
    const [full, alt, rawUrl] = match
    if (rawUrl.startsWith('/media/posts/'))
      continue

    index++
    const filename = `${String(index).padStart(2, '0')}-${slugify(alt || 'image')}.webp`
    const dest = join(POSTS_MEDIA, post.slug, filename)
    const publicPath = `/media/posts/${post.slug}/${filename}`

    const buf = await fetchImageBuffer(rawUrl)
    if (buf) {
      await saveWebp(buf, dest, { maxWidth: 1200 })
      replacements.push({ full, alt, publicPath })
    }
  }

  let updated = body
  for (const { full, alt, publicPath } of replacements)
    updated = updated.replace(full, `![${alt}](${publicPath})`)

  return updated
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40) || 'image'
}

async function main() {
  mkdirSync(POSTS_MEDIA, { recursive: true })
  await ensureDefaultCover()

  const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json')
  const summaries = []

  for (const file of files.sort()) {
    const path = join(POSTS_DIR, file)
    const post = JSON.parse(readFileSync(path, 'utf8'))
    post._legacyCover = post.cover

    const bodyUrls = extractImageUrls(post.body || '')
    post.cover = await migrateCover(post, bodyUrls)
    post.body = await migrateInlineImages(post, post.body || '')
    post.meta.ogImage = post.cover
    delete post._legacyCover

    writeJson(path, post)
    const { body: _b, ...summary } = post
    summaries.push(summary)
  }

  summaries.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
  writeJson(join(POSTS_DIR, 'index.json'), summaries)

  // Remove legacy hash media if any were created during dev
  for (const name of readdirSync(MEDIA_ROOT)) {
    if (name.startsWith('aHR0cHM6Ly') || /^cover\.(?:webp|png|jpg)$/i.test(name))
      rmSync(join(MEDIA_ROOT, name), { force: true })
  }

  console.log(`Migrated media for ${summaries.length} posts`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
