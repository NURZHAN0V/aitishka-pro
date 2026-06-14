<script setup lang="ts">
import type { PostSummary } from '@/index.d'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BaseIcon from '@/core/components/BaseIcon.vue'
import { NEWS_CATEGORY_SLUG } from '@/modules/news/constants'

const props = defineProps<{
  post: PostSummary
}>()

const categoryLink = computed(() =>
  props.post.category?.slug === NEWS_CATEGORY_SLUG
    ? '/news'
    : `/articles/${props.post.category.slug}`,
)

function formatDate(date?: string) {
  if (!date)
    return ''
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}
</script>

<template>
  <RouterLink :to="post.url" class="article-card">
    <header class="article-card__header">
      <img
        v-if="post.cover && post.cover !== '/media/cover.webp'"
        :src="post.cover"
        :alt="post.title"
        class="article-card__cover"
        loading="lazy"
      >
      <div v-else class="article-card__cover article-card__cover--placeholder" aria-hidden="true">
        <BaseIcon name="image-off" size="2.5rem" />
      </div>
      <div class="article-card__date">
        <BaseIcon name="calendar" size="1em" />
        <p>{{ formatDate(post.publishedAt) || '—' }}</p>
      </div>
    </header>
    <main class="article-card__body">
      <ul class="article-card__tags">
        <li v-if="post.category?.name">
          <RouterLink :to="categoryLink" @click.stop>
            {{ post.category.name }}
          </RouterLink>
        </li>
      </ul>
      <h3>{{ post.title }}</h3>
    </main>
  </RouterLink>
</template>

<style scoped lang="scss">
.article-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow: hidden;
  color: inherit;
  text-decoration: none;

  &:hover .article-card__cover {
    transform: scale(1.05);
  }

  &:hover .article-card__body h3 {
    background-size: 100% 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover .article-card__cover {
      transform: none;
    }

    &:hover .article-card__body h3 {
      transition: none;
    }
  }
}

.article-card__header {
  position: relative;
  overflow: hidden;
  border-radius: $radius-sm;
}

.article-card__cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &--placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gradient-cover-placeholder;
    color: rgb(255 255 255 / 75%);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.article-card__date {
  position: absolute;
  bottom: 0.25rem;
  left: 0.25rem;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  color: $color-secondary;
  background: $color-white;
  border-radius: 0.5rem;

  p {
    margin: 0;
  }
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
  background-image: linear-gradient($color-primary, $color-primary);
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0 2px;
  transition: background-size 0.25s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
</style>
