import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const siteUrl = (process.env.VITE_SITE_URL || 'https://aitishka.pro').replace(/\/$/, '')
const contentSource = (process.env.VITE_CONTENT_SOURCE || 'local').trim().toLowerCase()
const comersApi = (process.env.VITE_COMERS_API_URL || '').replace(/\/$/, '')
const storefrontKey = process.env.VITE_COMERS_STOREFRONT_KEY || ''

const staticRoutes = ['/', '/articles', '/media', '/news', '/draw', '/about', '/contact', '/privacy', '/terms']

function collectVideoSlugs(data) {
  if (Array.isArray(data))
    return data.map(video => video.slug).filter(Boolean)

  const slugs = (data.videos ?? []).map(video => video.slug).filter(Boolean)

  for (const playlist of data.playlists ?? [])
    slugs.push(...playlist.videos.map(video => video.slug).filter(Boolean))

  return slugs
}

async function fetchComersJson(path) {
  const headers = { Accept: 'application/json' }
  if (storefrontKey)
    headers['X-Comers-Storefront-Key'] = storefrontKey

  const response = await fetch(`${comersApi}${path}`, { headers })
  if (!response.ok)
    throw new Error(`Failed ${path}: ${response.status}`)
  return response.json()
}

async function collectComersPostRoutes() {
  if (!comersApi) {
    console.warn('VITE_COMERS_API_URL is empty — sitemap posts skipped')
    return []
  }

  const pageSize = 50
  const first = await fetchComersJson(`/api/cms/articles?page=1&page_size=${pageSize}`)
  const items = [...(first.items ?? [])]
  const total = first.total ?? items.length
  const pages = Math.max(1, Math.ceil(total / (first.page_size || pageSize)))

  for (let page = 2; page <= pages; page++) {
    const next = await fetchComersJson(`/api/cms/articles?page=${page}&page_size=${pageSize}`)
    items.push(...(next.items ?? []))
  }

  const pageList = await fetchComersJson(`/api/cms/pages?page=1&page_size=${pageSize}`)
  const pageRoutes = (pageList.items ?? []).map(item => `/pages/${item.slug}`)

  return [
    ...items.map(item => `/articles/${item.slug}`),
    ...pageRoutes,
  ]
}

function collectLocalPostRoutes() {
  try {
    const index = JSON.parse(readFileSync(join(root, 'content', 'posts', 'index.json'), 'utf8'))
    return index.map(p => p.url).filter(Boolean)
  }
  catch {
    return []
  }
}

function collectLocalVideoRoutes() {
  try {
    const videos = JSON.parse(readFileSync(join(root, 'content', 'videos.json'), 'utf8'))
    return collectVideoSlugs(videos).map(slug => `/media/${slug}`)
  }
  catch {
    return []
  }
}

let postRoutes = []
const videoRoutes = collectLocalVideoRoutes()

if (contentSource === 'comers') {
  postRoutes = await collectComersPostRoutes()
}
else {
  postRoutes = collectLocalPostRoutes()
}

const urls = [...staticRoutes, ...postRoutes, ...videoRoutes]
const lastmod = new Date().toISOString().slice(0, 10)

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${siteUrl}${url === '/' ? '' : url}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>
`

writeFileSync(join(root, 'public', 'sitemap.xml'), xml)
console.log(`Generated sitemap.xml with ${urls.length} URLs (source=${contentSource})`)
