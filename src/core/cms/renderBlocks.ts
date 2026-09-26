import type { CmsBlock, CmsBlockDocument } from '@/index.d'
import { computed } from 'vue'
import { resolveMediaUrl } from '@/core/api/http'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function youtubeEmbed(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be'))
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`
    const id = parsed.searchParams.get('v')
    if (id)
      return `https://www.youtube.com/embed/${id}`
  }
  catch {
    // keep raw
  }
  return url
}

function rutubeEmbed(url: string): string {
  const match = url.match(/rutube\.ru\/video\/([a-z0-9]+)/i)
  if (match?.[1])
    return `https://rutube.ru/play/embed/${match[1]}`
  return url
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function blockHtml(block: CmsBlock): string {
  const attrs = block.attrs ?? {}
  const text = asString(attrs.text)
  const html = asString(attrs.html)
  const align = asString(attrs.align)
  const cssClass = asString(attrs.cssClass)
  const anchor = asString(attrs.anchor)
  const classAttr = ['cms-block', `cms-block--${block.type}`, cssClass].filter(Boolean).join(' ')
  const idAttr = anchor ? ` id="${escapeHtml(anchor)}"` : ''
  const styleAttr = align ? ` style="text-align:${escapeHtml(align)}"` : ''

  switch (block.type) {
    case 'paragraph': {
      const body = html || (text ? `<p>${escapeHtml(text)}</p>` : '')
      return body ? `<div class="${classAttr}"${idAttr}${styleAttr}>${body}</div>` : ''
    }
    case 'heading': {
      const level = Math.min(6, Math.max(1, asNumber(attrs.level, 2)))
      const body = text || html
      if (!body)
        return ''
      const inner = html && !text ? html : escapeHtml(text)
      return `<h${level} class="${classAttr}"${idAttr}${styleAttr}>${inner}</h${level}>`
    }
    case 'list': {
      const style = asString(attrs.style) === 'ordered' ? 'ol' : 'ul'
      const items = asStringArray(attrs.items)
      if (html)
        return `<div class="${classAttr}"${idAttr}>${html}</div>`
      if (!items.length)
        return ''
      const lis = items.map(item => `<li>${escapeHtml(item)}</li>`).join('')
      return `<${style} class="${classAttr}"${idAttr}>${lis}</${style}>`
    }
    case 'quote': {
      const citation = asString(attrs.citation)
      const variant = asString(attrs.quoteVariant) || 'default'
      const body = html || escapeHtml(text)
      if (!body && !citation)
        return ''
      return `<blockquote class="${classAttr} cms-block--quote-${escapeHtml(variant)}"${idAttr}><div>${body}</div>${citation ? `<cite>${escapeHtml(citation)}</cite>` : ''}</blockquote>`
    }
    case 'code': {
      const code = asString(attrs.code) || text
      const lang = asString(attrs.codeLanguage)
      if (!code)
        return ''
      return `<pre class="${classAttr}"${idAttr}><code class="${lang ? `language-${escapeHtml(lang)}` : ''}">${escapeHtml(code)}</code></pre>`
    }
    case 'image': {
      const url = resolveMediaUrl(asString(attrs.url))
      if (!url)
        return ''
      const alt = escapeHtml(asString(attrs.alt))
      const caption = asString(attrs.caption)
      const link = asString(attrs.linkHref)
      const img = `<img src="${escapeHtml(url)}" alt="${alt}" loading="lazy">`
      const wrapped = link ? `<a href="${escapeHtml(link)}" rel="noopener noreferrer">${img}</a>` : img
      return `<figure class="${classAttr}"${idAttr}${styleAttr}>${wrapped}${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`
    }
    case 'separator':
      return `<hr class="${classAttr}"${idAttr}>`
    case 'spacer': {
      const height = asNumber(attrs.height, 48)
      return `<div class="${classAttr}"${idAttr} style="height:${height}px" aria-hidden="true"></div>`
    }
    case 'buttons': {
      const labels = asStringArray(attrs.labels)
      const url = asString(attrs.url) || asString(attrs.linkHref)
      if (!labels.length && !text)
        return ''
      const label = labels[0] || text || 'Перейти'
      if (!url)
        return `<div class="${classAttr}"${idAttr}${styleAttr}><span class="cms-block__btn cms-block__btn--disabled">${escapeHtml(label)}</span></div>`
      return `<div class="${classAttr}"${idAttr}${styleAttr}><a class="cms-block__btn" href="${escapeHtml(url)}">${escapeHtml(label)}</a></div>`
    }
    case 'accordion': {
      const items = Array.isArray(attrs.accordionItems) ? attrs.accordionItems as { title?: string, body?: string, content?: string }[] : []
      if (!items.length)
        return ''
      const parts = items.map((item, index) => {
        const title = escapeHtml(asString(item.title) || `Пункт ${index + 1}`)
        const body = asString(item.body) || asString(item.content)
        return `<details class="cms-block__accordion-item"><summary>${title}</summary><div>${body}</div></details>`
      }).join('')
      return `<div class="${classAttr}"${idAttr}>${parts}</div>`
    }
    case 'vk-video':
    case 'youtube':
    case 'rutube': {
      let embed = asString(attrs.url)
      if (!embed)
        return ''
      if (block.type === 'youtube')
        embed = youtubeEmbed(embed)
      if (block.type === 'rutube')
        embed = rutubeEmbed(embed)
      return `<div class="${classAttr} cms-block__embed"${idAttr}><iframe src="${escapeHtml(embed)}" title="${escapeHtml(block.type)}" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`
    }
    default:
      return ''
  }
}

export function renderCmsBlocks(doc: CmsBlockDocument | undefined | null): string {
  if (!doc?.blocks?.length)
    return ''
  return doc.blocks.map(block => blockHtml(block)).filter(Boolean).join('\n')
}

export function useCmsBlocks(doc: () => CmsBlockDocument | undefined | null) {
  const html = computed(() => renderCmsBlocks(doc()))
  return { html }
}
