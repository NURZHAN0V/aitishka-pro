import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

export function useMarkdown() {
  const render = (source: string): string => md.render(source)

  return { render }
}
