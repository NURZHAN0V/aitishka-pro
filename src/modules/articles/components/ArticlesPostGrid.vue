<script setup lang="ts">
import type { PostSummary } from '@/index.d'
import { toRef } from 'vue'
import ArticleCard from '@/modules/articles/components/ArticleCard.vue'
import { useLazyPostList } from '@/modules/articles/composables/useLazyPostList'

const props = withDefaults(defineProps<{
  posts: PostSummary[]
  loading?: boolean
  emptyMessage?: string
}>(), {
  loading: false,
  emptyMessage: 'Статьи пока не опубликованы.',
})

const { visibleItems, hasMore, loadingMore, sentinel } = useLazyPostList(toRef(props, 'posts'))
</script>

<template>
  <div class="articles-post-grid">
    <p v-if="loading" class="articles-post-grid__status">
      Загрузка…
    </p>
    <p v-else-if="!posts.length" class="articles-post-grid__status">
      {{ emptyMessage }}
    </p>
    <template v-else>
      <TransitionGroup name="articles-grid" tag="div" class="articles-post-grid__cards">
        <ArticleCard v-for="post in visibleItems" :key="post.id" :post="post" />
      </TransitionGroup>
      <p v-if="loadingMore" class="articles-post-grid__loading-more" aria-live="polite">
        Загрузка…
      </p>
      <div
        v-if="hasMore"
        ref="sentinel"
        class="articles-post-grid__sentinel"
        aria-hidden="true"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.articles-post-grid__cards {
  display: grid;
  gap: 1rem;

  @include sm {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @include md {
    grid-template-columns: repeat(3, 1fr);
  }

  @include lg {
    grid-template-columns: repeat(4, 1fr);
  }
}

.articles-post-grid__status {
  color: $color-secondary;
  padding: 2rem 0;
}

.articles-post-grid__loading-more {
  margin-top: 1.5rem;
  text-align: center;
  color: $color-secondary;
}

.articles-post-grid__sentinel {
  width: 100%;
  height: 1px;
}

.articles-grid-move {
  transition: transform 0.2s ease;
}

.articles-grid-enter-active {
  transition: opacity 0.15s ease;
}

.articles-grid-leave-active {
  display: none;
}

.articles-grid-enter-from {
  opacity: 0;
}
</style>
