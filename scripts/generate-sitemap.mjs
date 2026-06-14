import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const siteUrl = 'https://aitishka.pro'

const staticRoutes = ['/', '/articles', '/media', '/about', '/contact', '/news']

let postRoutes = []
try {
  const index = JSON.parse(readFileSync(join(root, 'content', 'posts', 'index.json'), 'utf8'))
  postRoutes = index.map(p => p.url).filter(Boolean)
}
catch {
  // posts not migrated yet
}

const urls = [...staticRoutes, ...postRoutes]
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
