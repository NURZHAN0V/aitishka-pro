<script setup lang="ts">
import type { Video } from '@/index.d'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseIcon from '@/core/components/BaseIcon.vue'

const props = defineProps<{
  video: Video
  active?: boolean
  index?: number
  showOrder?: boolean
  categoryLabel?: string
}>()

const thumbFailed = ref(false)

const showThumb = computed(() =>
  props.video.thumbnailUrl && !thumbFailed.value,
)
</script>

<template>
  <RouterLink
    :to="`/media/${video.slug}`"
    class="playlist-item card"
    :class="{ 'playlist-item--active': active }"
    :aria-current="active ? 'true' : undefined"
  >
    <div class="playlist-item__thumb">
      <span v-if="showOrder && index" class="playlist-item__order">{{ index }}</span>
      <img
        v-if="showThumb"
        :src="video.thumbnailUrl"
        :alt="video.title"
        loading="lazy"
        @error="thumbFailed = true"
      >
      <div v-else class="playlist-item__thumb-placeholder" aria-hidden="true">
        <BaseIcon name="video-off" size="1.5rem" />
      </div>
      <span v-if="video.duration" class="playlist-item__duration">{{ video.duration }}</span>
    </div>
    <div class="playlist-item__body">
      <h4>{{ video.title }}</h4>
      <p v-if="categoryLabel" class="playlist-item__meta">
        {{ categoryLabel }}
      </p>
    </div>
  </RouterLink>
</template>

<style scoped lang="scss">
.playlist-item {
  display: grid;
  grid-template-columns: 7.5rem 1fr;
  gap: 0.75rem;
  padding: 0.625rem;
  color: inherit;
  transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: $color-primary-alpha-35;
    box-shadow: $shadow-sm;
  }

  &--active {
    border-color: $color-primary;
    background: $color-primary-alpha-8;
    box-shadow: $shadow-sm;
  }
}

.playlist-item__thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: $radius-sm;
  overflow: hidden;
  background: $color-surface-inverse;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.playlist-item__thumb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: $gradient-cover-placeholder;
  color: rgb(255 255 255 / 75%);
}

.playlist-item__order {
  position: absolute;
  top: 0.375rem;
  left: 0.375rem;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding-inline: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: $color-on-inverse;
  background: rgb(15 15 15 / 75%);
  border-radius: 0.25rem;
}

.playlist-item__duration {
  position: absolute;
  right: 0.375rem;
  bottom: 0.375rem;
  padding: 0.125rem 0.375rem;
  font-size: 0.6875rem;
  color: $color-on-inverse;
  background: rgb(0 0 0 / 75%);
  border-radius: 0.25rem;
}

.playlist-item__body {
  min-width: 0;
  align-self: center;

  h4 {
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.playlist-item__meta {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: $color-secondary;
}

.playlist-item--active .playlist-item__meta {
  color: $color-primary;
}
</style>
