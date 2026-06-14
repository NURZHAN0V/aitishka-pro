<script setup lang="ts">
import type { ArticleTocSection } from '@/modules/articles/composables/useArticleToc'
import { ref } from 'vue'

defineProps<{
  sections: ArticleTocSection[]
  activeId: string | null
}>()

const emit = defineEmits<{
  navigate: [id: string]
}>()

const hoveredId = ref<string | null>(null)

function showPanel(id: string) {
  hoveredId.value = id
}

function hidePanel() {
  hoveredId.value = null
}

function handleNavigate(id: string) {
  emit('navigate', id)
}
</script>

<template>
  <nav
    v-if="sections.length > 0"
    class="article-toc-sticks"
    aria-label="Содержание статьи"
  >
    <ol class="article-toc-sticks__list">
      <li
        v-for="section in sections"
        :key="section.id"
        class="article-toc-sticks__item"
        :class="`article-toc-sticks__item--h${section.level}`"
        @mouseenter="showPanel(section.id)"
        @mouseleave="hidePanel"
      >
        <button
          type="button"
          class="article-toc-sticks__stick"
          :class="{ 'article-toc-sticks__stick--active': activeId === section.id }"
          :aria-label="section.title"
          :aria-current="activeId === section.id ? 'location' : undefined"
          @focus="showPanel(section.id)"
          @blur="hidePanel"
          @click="handleNavigate(section.id)"
        >
          <span class="article-toc-sticks__line" aria-hidden="true" />
        </button>

        <div
          v-if="hoveredId === section.id"
          class="article-toc-sticks__panel"
          role="tooltip"
        >
          <p class="article-toc-sticks__panel-title">
            {{ section.title }}
          </p>
          <p
            v-if="section.previewText"
            class="article-toc-sticks__panel-preview"
          >
            {{ section.previewText }}
          </p>
        </div>
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
  transform: translateY(-50%);
  pointer-events: none;

  @media (max-width: $bp-lg) {
    display: none;
  }
}

.article-toc-sticks__list {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.625rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.article-toc-sticks__item {
  position: relative;
  display: flex;
  justify-content: flex-end;
  pointer-events: auto;

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
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  @include focus-ring;
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

.article-toc-sticks__stick:hover .article-toc-sticks__line,
.article-toc-sticks__stick:focus-visible .article-toc-sticks__line {
  width: 1.5rem;
  opacity: 0.85;
  background: var(--color-text-secondary);
}

.article-toc-sticks__stick--active .article-toc-sticks__line {
  width: 1.5rem;
  opacity: 1;
  background: var(--color-primary);
}

.article-toc-sticks__panel {
  position: absolute;
  top: 50%;
  right: calc(100% + 0.75rem);
  z-index: 1;
  width: min(17.5rem, calc(100vw - 6rem));
  padding: 0.75rem 0.875rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: $radius-sm;
  background: var(--color-surface-elevated);
  box-shadow: $shadow-md;
  transform: translateY(-50%);
  pointer-events: none;
}

.article-toc-sticks__panel-title {
  margin: 0;
  color: var(--color-text);
  font-family: $font-display;
  font-size: $text-sm;
  font-weight: 600;
  line-height: 1.35;
}

.article-toc-sticks__panel-preview {
  display: -webkit-box;
  margin: 0.375rem 0 0;
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: $text-xs;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}
</style>
