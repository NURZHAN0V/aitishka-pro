import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const siteUrl = 'https://aitishka.pro'

const staticRoutes = ['/', '/articles', '/media', '/news']

function collectVideoSlugs(data) {
  if (Array.isArray(data))
    return data.map(video => video.slug).filter(Boolean)

  const slugs = (data.videos ?? []).map(video => video.slug).filter(Boolean)

  for (const playlist of data.playlists ?? [])
    slugs.push(...playlist.videos.map(video => video.slug).filter(Boolean))

  return slugs
}

let postRoutes = []
let videoRoutes = []
try {
  const index = JSON.parse(readFileSync(join(root, 'content', 'posts', 'index.json'), 'utf8'))
  postRoutes = index.map(p => p.url).filter(Boolean)
}
catch {
  // posts not migrated yet
}

try {
  const videos = JSON.parse(readFileSync(join(root, 'content', 'videos.json'), 'utf8'))
  videoRoutes = collectVideoSlugs(videos).map(slug => `/media/${slug}`)
}
catch {
  // videos not migrated yet
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
console.log(`Generated sitemap.xml with ${urls.length} URLs`)
