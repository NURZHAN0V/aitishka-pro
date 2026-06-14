<script setup lang="ts">
import type { PostSummary } from '@/index.d'
import { RouterLink } from 'vue-router'
import BaseIcon from '@/core/components/BaseIcon.vue'

defineProps<{
  post: PostSummary
}>()

function formatDate(date?: string) {
  if (!date)
    return ''
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}
</script>

<template>
  <article class="article-card card">
    <header class="article-card__header">
      <img
        v-if="post.cover && post.cover !== '/media/cover.webp'"
        :src="post.cover"
        :alt="post.title"
        class="article-card__cover"
        loading="lazy"
      >
      <div v-else class="article-card__cover article-card__cover--placeholder" />
      <div class="article-card__date">
        <BaseIcon name="calendar" size="0.875rem" />
        <span>{{ formatDate(post.publishedAt) || '—' }}</span>
      </div>
    </header>
    <main class="article-card__body">
      <ul class="article-card__tags">
        <li v-if="post.category?.name">
          <RouterLink :to="`/articles/${post.category.slug}`">
            {{ post.category.name }}
          </RouterLink>
        </li>
      </ul>
      <h3>{{ post.title }}</h3>
    </main>
    <footer class="article-card__footer">
      <RouterLink :to="post.url" class="article-card__action article-card__action--read">
        Читать
      </RouterLink>
      <button type="button" class="article-card__action article-card__action--share">
        Поделиться
      </button>
      <div class="article-card__slider" />
    </footer>
  </article>
</template>

<style scoped lang="scss">
.article-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  overflow: hidden;
}

.article-card__header {
  position: relative;
}

.article-card__cover {
  width: 100%;
  height: 7.5rem;
  object-fit: cover;
  border-radius: $radius-sm;

  &--placeholder {
    background: $color-primary;
  }
}

.article-card__date {
  position: absolute;
  bottom: 0.25rem;
  left: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: $color-secondary;
  background: $color-white;
  border-radius: $radius-sm;
}

.article-card__tags {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;

  a {
    color: $color-primary;

    &:hover {
      text-decoration: underline;
    }
  }
}

.article-card__body h3 {
  font-size: 1.125rem;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card__footer {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  padding: 0.25rem;
  background: $color-background;
  border-radius: $radius-lg;
}

.article-card__action {
  position: relative;
  z-index: 1;
  padding: 0.25rem;
  text-align: center;
  font-weight: 400;
  transition: font-weight 0.2s, color 0.2s;

  &--read:hover,
  &--read:focus-within {
    & ~ .article-card__slider {
      transform: translateX(calc(-100% - -4px));
    }
  }

  &--share:hover {
    font-weight: 500;
  }
}

.article-card__footer:has(.article-card__action--read:hover) .article-card__action--read,
.article-card__footer:has(.article-card__action--read:focus-within) .article-card__action--read {
  font-weight: 500;
  color: $color-white;
}

.article-card__footer:has(.article-card__action--share:hover) .article-card__action--share {
  font-weight: 500;
  color: $color-white;
}

.article-card__slider {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: calc((100% - 4px) / 2);
  height: calc(100% - 8px);
  background: $color-primary;
  border-radius: $radius-sm;
  transition: transform 0.3s ease;
  pointer-events: none;
}
</style>
