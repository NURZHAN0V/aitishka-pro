<script setup lang="ts">
import type { Video } from '@/index.d'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseIcon from '@/core/components/BaseIcon.vue'

const props = defineProps<{
  video: Video
}>()

const thumbFailed = ref(false)

const showThumb = computed(() =>
  props.video.thumbnailUrl && !thumbFailed.value,
)
</script>

<template>
  <RouterLink :to="`/media/${video.slug}`" class="video-card">
    <div class="video-card__thumb">
      <img
        v-if="showThumb"
        :src="video.thumbnailUrl"
        :alt="video.title"
        loading="lazy"
        @error="thumbFailed = true"
      >
      <div v-else class="video-card__thumb-placeholder" aria-hidden="true">
        <BaseIcon name="video-off" size="2.5rem" />
      </div>
      <span v-if="video.duration" class="video-card__duration">{{ video.duration }}</span>
    </div>
    <div class="video-card__body">
      <h3>{{ video.title }}</h3>
    </div>
  </RouterLink>
</template>

<style scoped lang="scss">
.video-card {
  display: block;
  color: inherit;
  text-decoration: none;

  &:hover .video-card__body h3 {
    background-size: 100% 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover .video-card__body h3 {
      transition: none;
    }
  }
}

.video-card__thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  background: $color-surface-inverse;
  border-radius: $radius-sm;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.video-card__thumb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: $gradient-cover-placeholder;
  color: rgb(255 255 255 / 75%);
}

.video-card__duration {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  color: $color-on-inverse;
  background: rgb(0 0 0 / 70%);
  border-radius: 0.25rem;
}

.video-card__body {
  padding-block: 0.75rem 0;

  h3 {
    font-size: 1rem;
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 2;
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
}
</style>
