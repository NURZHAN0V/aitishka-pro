const SITE_ORIGIN = 'https://aitishka.pro'

export interface PageMetaOptions {
  title: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  canonical?: string
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  if (!content)
    return

  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function toAbsoluteUrl(path: string) {
  if (path.startsWith('http'))
    return path
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

export function applyPageMeta(options: PageMetaOptions) {
  const title = options.title.trim()
  const description = (options.description || options.ogDescription || '').trim()
  const ogTitle = (options.ogTitle || title).trim()
  const ogDescription = (options.ogDescription || description).trim()
  const ogImage = options.ogImage ? toAbsoluteUrl(options.ogImage) : `${SITE_ORIGIN}/apple-touch-icon.png`

  document.title = `${title} — AITISHKAPRO`

  setMetaTag('name', 'description', description)
  setMetaTag('property', 'og:title', ogTitle)
  setMetaTag('property', 'og:description', ogDescription)
  setMetaTag('property', 'og:image', ogImage)
  setMetaTag('property', 'og:url', options.canonical ? toAbsoluteUrl(options.canonical) : window.location.href)
  setMetaTag('property', 'og:type', options.ogType || 'article')
  setMetaTag('name', 'twitter:card', 'summary_large_image')
  setMetaTag('name', 'twitter:title', ogTitle)
  setMetaTag('name', 'twitter:description', ogDescription)
  setMetaTag('name', 'twitter:image', ogImage)
}
