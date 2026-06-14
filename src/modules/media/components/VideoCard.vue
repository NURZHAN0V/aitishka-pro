<script setup lang="ts">
import type { Video } from '@/index.d'
import { inject } from 'vue'

defineProps<{
  video: Video
}>()

const openVideoModal = inject<(url: string) => void>('openVideoModal', () => {})

function play(embedUrl: string) {
  openVideoModal(embedUrl)
}
</script>

<template>
  <article class="video-card card" @click="play(video.embedUrl)">
    <div class="video-card__thumb">
      <img :src="video.thumbnailUrl" :alt="video.title" loading="lazy">
      <span v-if="video.duration" class="video-card__duration">{{ video.duration }}</span>
    </div>
    <div class="video-card__body">
      <span class="video-card__category">{{ video.category }}</span>
      <h3>{{ video.title }}</h3>
      <p>{{ video.excerpt }}</p>
    </div>
  </article>
</template>

<style scoped lang="scss">
.video-card {
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: rgb(209 125 77 / 30%);
    box-shadow: $shadow-md;
  }
}

.video-card__thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  background: $color-default;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.video-card__duration {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  color: $color-white;
  background: rgb(0 0 0 / 70%);
  border-radius: 0.25rem;
}

.video-card__body {
  padding: 1rem;

  h3 {
    margin-top: 0.25rem;
    font-size: 1rem;
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  p {
    margin-top: 0.375rem;
    font-size: 0.875rem;
    color: $color-secondary;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.video-card__category {
  font-size: 0.75rem;
  color: $color-primary;
}
</style>
