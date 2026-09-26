<script setup lang="ts">
import type { ArticleTocSection } from '@/modules/articles/composables/useArticleToc'
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  sections: ArticleTocSection[]
  activeId: string | null
}>()

const emit = defineEmits<{
  navigate: [id: string]
}>()

/** Сколько полосок видно в свёрнутом рейле — остальное через панель. */
const MAX_VISIBLE_STICKS = 8
const CLOSE_DELAY_MS = 220

const expanded = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | null = null

const visibleSections = computed(() => {
  const all = props.sections
  if (all.length <= MAX_VISIBLE_STICKS)
    return all

  const activeIndex = Math.max(0, all.findIndex(s => s.id === props.activeId))
  const half = Math.floor(MAX_VISIBLE_STICKS / 2)
  let start = Math.max(0, activeIndex - half)
  let end = start + MAX_VISIBLE_STICKS
  if (end > all.length) {
    end = all.length
    start = Math.max(0, end - MAX_VISIBLE_STICKS)
  }
  return all.slice(start, end)
})

function clearCloseTimer() {
  if (closeTimer == null)
    return
  clearTimeout(closeTimer)
  closeTimer = null
}

function openPanel() {
  clearCloseTimer()
  expanded.value = true
}

function scheduleClosePanel() {
  clearCloseTimer()
  closeTimer = setTimeout(() => {
    expanded.value = false
    closeTimer = null
  }, CLOSE_DELAY_MS)
}

function handleNavigate(id: string) {
  emit('navigate', id)
  clearCloseTimer()
  expanded.value = false
}

onBeforeUnmount(() => {
  clearCloseTimer()
})
</script>

<template>
  <nav
    v-if="sections.length > 0"
    class="article-toc-sticks"
    :class="{ 'article-toc-sticks--expanded': expanded }"
    aria-label="Содержание статьи"
    @mouseenter="openPanel"
    @mouseleave="scheduleClosePanel"
    @focusin="openPanel"
    @focusout="scheduleClosePanel"
  >
    <div
      v-show="expanded"
      class="article-toc-sticks__panel"
      role="navigation"
      aria-label="Разделы статьи"
    >
      <p class="article-toc-sticks__panel-heading">
        Содержание
      </p>
      <ul class="article-toc-sticks__panel-scroll">
        <li
          v-for="section in sections"
          :key="section.id"
          class="article-toc-sticks__panel-item"
          :class="`article-toc-sticks__panel-item--h${section.level}`"
        >
          <button
            type="button"
            class="article-toc-sticks__panel-link"
            :class="{ 'article-toc-sticks__panel-link--active': activeId === section.id }"
            :aria-current="activeId === section.id ? 'location' : undefined"
            @click="handleNavigate(section.id)"
          >
            {{ section.title }}
          </button>
        </li>
      </ul>
    </div>

    <ol class="article-toc-sticks__list" aria-hidden="true">
      <li
        v-for="section in visibleSections"
        :key="section.id"
        class="article-toc-sticks__item"
        :class="`article-toc-sticks__item--h${section.level}`"
      >
        <span
          class="article-toc-sticks__stick"
          :class="{ 'article-toc-sticks__stick--active': activeId === section.id }"
        >
          <span class="article-toc-sticks__line" />
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped lang="scss">
.article-toc-sticks {
  position: fixed;
  top: 50%;
  right: 1.5rem;
  z-index: 30;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  transform: translateY(-50%);
  pointer-events: auto;

  @media (max-width: $bp-lg) {
    display: none;
  }
}

.article-toc-sticks__list {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  gap: 0.625rem;
  margin: 0;
  padding: 0.25rem 0;
  list-style: none;
}

.article-toc-sticks__item {
  display: flex;
  justify-content: flex-end;

  &--h3 {
    padding-right: 0.375rem;
  }
}

.article-toc-sticks__stick {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 2rem;
  height: 1.25rem;
}

.article-toc-sticks__line {
  display: block;
  width: 1.25rem;
  height: 2px;
  border-radius: 999px;
  background: var(--color-text-muted);
  opacity: 0.45;
  transition:
    width 0.2s ease,
    opacity 0.2s ease,
    background-color 0.2s ease;
}

.article-toc-sticks__item--h3 .article-toc-sticks__line {
  width: 1rem;
}

.article-toc-sticks--expanded .article-toc-sticks__line {
  opacity: 0.7;
}

.article-toc-sticks__stick--active .article-toc-sticks__line {
  width: 1.5rem;
  opacity: 1;
  background: var(--color-primary);
}

.article-toc-sticks__panel {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: min(18rem, calc(100vw - 6rem));
  max-height: min(22rem, 60vh);
  border: 1px solid var(--color-border-subtle);
  border-radius: $radius-sm;
  background: var(--color-surface-elevated);
  box-shadow: $shadow-md;
  overflow: hidden;
}

.article-toc-sticks__panel-heading {
  flex-shrink: 0;
  margin: 0;
  padding: 0.75rem 0.875rem 0.5rem;
  color: var(--color-text-secondary);
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.article-toc-sticks__panel-scroll {
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  padding: 0 0.375rem 0.5rem;
  list-style: none;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--color-gray-400) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: var(--color-gray-400);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.article-toc-sticks__panel-item {
  margin: 0;

  &--h3 .article-toc-sticks__panel-link {
    padding-left: 1.25rem;
    font-size: $text-xs;
  }
}

.article-toc-sticks__panel-link {
  display: block;
  width: 100%;
  padding: 0.4375rem 0.5rem;
  border: none;
  border-radius: $radius-sm;
  background: transparent;
  color: var(--color-text-secondary);
  font: inherit;
  font-size: $text-sm;
  line-height: 1.35;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--color-primary);
    color: var(--color-on-primary);
  }

  &--active {
    color: var(--color-primary);
    font-weight: 600;
  }

  &--active:hover {
    color: var(--color-on-primary);
  }

  @include focus-ring;
}
</style>
