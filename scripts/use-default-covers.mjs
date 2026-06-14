/**
 * Posts without a real cover image → /media/cover.webp (gradient placeholder in UI).
 * Run: node scripts/use-default-covers.mjs
 */
import { readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const POSTS_DIR = join(process.cwd(), 'content', 'posts')
const COVERS_DIR = join(process.cwd(), 'public', 'media', 'posts')
const DEFAULT_COVER = '/media/cover.webp'
const GENERIC_COVER_SIZE = 2674

function isGenericCover(filename) {
  try {
    const size = statSync(join(COVERS_DIR, filename)).size
    return size === GENERIC_COVER_SIZE
  }
  catch {
    return true
  }
}

function main() {
  const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json')
  let reset = 0
  let kept = 0

  for (const file of files) {
    const path = join(POSTS_DIR, file)
    const post = JSON.parse(readFileSync(path, 'utf8'))
    const coverFile = `${post.slug}-cover.webp`

    if (!post.cover?.startsWith('/media/posts/') || !isGenericCover(coverFile)) {
      kept++
      continue
    }

    post.cover = DEFAULT_COVER
    if (post.meta) {
      delete post.meta.ogImage
    }

    const coverPath = join(COVERS_DIR, coverFile)
    try {
      rmSync(coverPath)
    }
    catch { /* already removed */ }

    writeFileSync(path, `${JSON.stringify(post, null, 2)}\n`)
    reset++
  }

  const summaries = JSON.parse(readFileSync(join(POSTS_DIR, 'index.json'), 'utf8'))
  for (const summary of summaries) {
    const post = JSON.parse(readFileSync(join(POSTS_DIR, `${summary.slug}.json`), 'utf8'))
    Object.assign(summary, { ...post, body: undefined })
  }
  writeFileSync(join(POSTS_DIR, 'index.json'), `${JSON.stringify(summaries, null, 2)}\n`)

  console.log(`Default gradient cover: ${reset} posts, real covers kept: ${kept}`)
}

main()
