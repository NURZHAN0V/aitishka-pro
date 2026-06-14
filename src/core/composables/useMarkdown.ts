import type Token from 'markdown-it/lib/token.mjs'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import cpp from 'highlight.js/lib/languages/cpp'
import css from 'highlight.js/lib/languages/css'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import ini from 'highlight.js/lib/languages/ini'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdownLang from 'highlight.js/lib/languages/markdown'
import php from 'highlight.js/lib/languages/php'
import python from 'highlight.js/lib/languages/python'
import shell from 'highlight.js/lib/languages/shell'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import MarkdownItConstructor from 'markdown-it'
import anchor from 'markdown-it-anchor'
import attrs from 'markdown-it-attrs'
import container from 'markdown-it-container'

const COPY_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>'

const CHECK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'

const CALLOUTS = {
  important: { className: 'callout--important', label: 'Важно' },
  warning: { className: 'callout--important', label: 'Важно' },
  info: { className: 'callout--important', label: 'Важно' },
  tip: { className: 'callout--tip', label: 'Совет' },
  совет: { className: 'callout--tip', label: 'Совет' },
  важно: { className: 'callout--important', label: 'Важно' },
} as const

function registerHighlightLanguages() {
  const pairs: Array<[string, Parameters<typeof hljs.registerLanguage>[1]]> = [
    ['javascript', javascript],
    ['js', javascript],
    ['typescript', typescript],
    ['ts', typescript],
    ['python', python],
    ['py', python],
    ['bash', bash],
    ['sh', bash],
    ['shell', shell],
    ['yaml', yaml],
    ['yml', yaml],
    ['json', json],
    ['sql', sql],
    ['css', css],
    ['html', xml],
    ['xml', xml],
    ['cpp', cpp],
    ['c', cpp],
    ['arduino', cpp],
    ['php', php],
    ['ini', ini],
    ['dockerfile', dockerfile],
    ['markdown', markdownLang],
    ['md', markdownLang],
  ]

  for (const [name, lang] of pairs)
    hljs.registerLanguage(name, lang)
}

function slugifyHeading(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function calloutRender(label: string, className: string) {
  return (tokens: Token[], idx: number) => {
    if (tokens[idx].nesting === 1) {
      return `<aside class="callout ${className}" role="note">
<p class="callout__title">${label}</p>
<div class="callout__body">
`
    }

    return '</div></aside>\n'
  }
}

function renderCodeBlock(content: string, lang?: string, escapeHtml = MarkdownItConstructor.prototype.utils.escapeHtml): string {
  const trimmed = content.replace(/\n$/, '')
  const normalizedLang = lang?.toLowerCase()
  const canHighlight = Boolean(normalizedLang && hljs.getLanguage(normalizedLang))

  const codeHtml = canHighlight
    ? hljs.highlight(trimmed, { language: normalizedLang! }).value
    : escapeHtml(trimmed)

  const langAttr = normalizedLang ? ` data-language="${escapeHtml(normalizedLang)}"` : ''
  const codeClass = canHighlight ? 'hljs' : ''

  return `<div class="code-block">
<button type="button" class="code-block__copy" aria-label="Скопировать код" data-tooltip="Скопировать">
<span class="code-block__copy-icon code-block__copy-icon--copy">${COPY_ICON}</span>
<span class="code-block__copy-icon code-block__copy-icon--done">${CHECK_ICON}</span>
</button>
<pre tabindex="0"><code class="${codeClass}"${langAttr}>${codeHtml}</code></pre>
</div>`
}

registerHighlightLanguages()

const md = new MarkdownItConstructor({
  html: false,
  linkify: true,
  typographer: true,
})

for (const [name, config] of Object.entries(CALLOUTS))
  md.use(container, name, { render: calloutRender(config.label, config.className) })

md.use(attrs, {
  allowedAttributes: ['id', 'class'],
})

md.use(anchor, {
  level: [1, 2, 3, 4],
  slugify: slugifyHeading,
  permalink: anchor.permalink.linkInsideHeader({
    symbol: '<span class="heading-anchor__symbol" aria-hidden="true">#</span>',
    placement: 'before',
    class: 'heading-anchor',
    ariaHidden: false,
  }),
})

md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx]
  const info = token.info ? token.info.trim() : ''
  const lang = info.split(/\s+/g)[0] || undefined

  return renderCodeBlock(token.content, lang, md.utils.escapeHtml)
}

md.renderer.rules.code_block = (tokens, idx) => {
  return renderCodeBlock(tokens[idx].content, undefined, md.utils.escapeHtml)
}

export function useMarkdown() {
  const render = (source: string): string => md.render(source)

  return { render }
}
