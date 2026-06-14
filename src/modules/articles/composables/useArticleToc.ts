import type { Ref } from 'vue'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

export interface ArticleTocSection {
  id: string
  title: string
  level: 2 | 3
  previewText: string
}

const PREVIEW_MAX_LENGTH = 120
const SCROLL_OFFSET = 96
const HEADING_SELECTOR = 'h2, h3'

function getHeadingTitle(heading: HTMLElement): string {
  const clone = heading.cloneNode(true) as HTMLElement
  clone.querySelector('.heading-anchor')?.remove()
  return clone.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

function extractPreviewText(heading: HTMLElement, nextHeading: HTMLElement | null): string {
  const parts: string[] = []
  let node = heading.nextElementSibling

  while (node && node !== nextHeading) {
    if (node.matches(HEADING_SELECTOR))
      break

    if (node.classList.contains('code-block')) {
      node = node.nextElementSibling
      continue
    }

    const text = node.textContent?.replace(/\s+/g, ' ').trim()
    if (text)
      parts.push(text)

    node = node.nextElementSibling
  }

  const combined = parts.join(' ').trim()
  if (!combined)
    return ''

  if (combined.length <= PREVIEW_MAX_LENGTH)
    return combined

  return `${combined.slice(0, PREVIEW_MAX_LENGTH).trimEnd()}…`
}

function collectSections(root: HTMLElement): ArticleTocSection[] {
  const headings = Array.from(root.querySelectorAll<HTMLElement>(HEADING_SELECTOR))

  return headings.map((heading, index) => {
    const id = heading.id || `section-${index}`
    if (!heading.id)
      heading.id = id

    const level = Number(heading.tagName.charAt(1))
    const nextHeading = headings[index + 1] ?? null

    return {
      id,
      title: getHeadingTitle(heading),
      level: level as 2 | 3,
      previewText: extractPreviewText(heading, nextHeading),
    }
  })
}

export function useArticleToc(articleRef: Ref<HTMLElement | null>, contentVersion?: Ref<unknown>) {
  const sections = ref<ArticleTocSection[]>([])
  const activeId = ref<string | null>(null)

  function updateActiveSection() {
    if (sections.value.length === 0) {
      activeId.value = null
      return
    }

    let current = sections.value[0].id

    for (const section of sections.value) {
      const element = document.getElementById(section.id)
      if (element && element.getBoundingClientRect().top <= SCROLL_OFFSET)
        current = section.id
    }

    activeId.value = current
  }

  function refresh() {
    const root = articleRef.value
    if (!root) {
      sections.value = []
      activeId.value = null
      return
    }

    sections.value = collectSections(root)
    updateActiveSection()
  }

  function scrollToSection(id: string) {
    const element = document.getElementById(id)
    if (!element)
      return

    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
  }

  onMounted(() => {
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    void nextTick(refresh)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateActiveSection)
  })

  if (contentVersion) {
    watch(contentVersion, async () => {
      await nextTick()
      refresh()
    })
  }

  watch(articleRef, async () => {
    await nextTick()
    refresh()
  })

  return {
    sections,
    activeId,
    refresh,
    scrollToSection,
  }
}
