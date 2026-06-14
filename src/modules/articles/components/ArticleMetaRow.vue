<script setup lang="ts">
import type { Post } from '@/index.d'
import { computed } from 'vue'
import BaseIcon from '@/core/components/BaseIcon.vue'
import { useSharePage } from '@/modules/articles/composables/useSharePage'
import { estimateReadingTime, formatReadingTime } from '@/modules/articles/utils/estimateReadingTime'
import { formatPostPublishedAt } from '@/modules/articles/utils/formatPostDate'

const props = defineProps<{
  post: Post
}>()

const { shareFeedback, sharePage } = useSharePage()

const readingTimeLabel = computed(() => formatReadingTime(estimateReadingTime(props.post.body)))
const publishedLabel = computed(() => formatPostPublishedAt(props.post.publishedAt))

async function onShare() {
  const url = new URL(props.post.url, window.location.origin).href
  await sharePage(props.post.title, url)
}
</script>

<template>
  <div class="article-meta">
    <span class="article-meta__item">
      <BaseIcon name="clock" size="1em" />
      <span>{{ readingTimeLabel }}</span>
    </span>

    <span v-if="publishedLabel" class="article-meta__sep" aria-hidden="true">·</span>

    <span v-if="publishedLabel" class="article-meta__item">
      <BaseIcon name="calendar" size="1em" />
      <time :datetime="post.publishedAt">{{ publishedLabel }}</time>
    </span>

    <span class="article-meta__sep" aria-hidden="true">·</span>

    <button
      type="button"
      class="article-meta__share"
      aria-label="Поделиться"
      @click="onShare"
    >
      <BaseIcon name="share" size="1em" />
      <span>Поделиться</span>
    </button>

    <span
      v-if="shareFeedback"
      class="article-meta__feedback"
      aria-live="polite"
    >
      {{ shareFeedback }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.article-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  margin-bottom: 1rem;
  font-size: $text-sm;
  color: $color-secondary;
}

.article-meta__item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.article-meta__sep {
  color: $color-gray-400;
  user-select: none;
}

.article-meta__share {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.625rem;
  font-size: inherit;
  font-family: inherit;
  line-height: 1.35;
  color: $color-primary;
  background: $color-primary-alpha-8;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: $color-primary-alpha-12;
    color: $color-primary-hover;
  }

  @include focus-ring;
}

.article-meta__feedback {
  font-size: $text-xs;
  color: $color-primary;
}
</style>
