<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ListPageBanner from '@/modules/layout/components/ListPageBanner.vue'
import VideoCard from '@/modules/media/components/VideoCard.vue'
import { useVideosCatalog } from '@/modules/media/composables/useVideosCatalog'

const route = useRoute()
const { videos, ready, ensureLoaded } = useVideosCatalog()
const loading = ref(!ready.value)

const sortedVideos = computed(() =>
  [...videos.value].sort((a, b) => {
    const dateA = a.publishedAt ? Date.parse(a.publishedAt) : 0
    const dateB = b.publishedAt ? Date.parse(b.publishedAt) : 0
    return dateB - dateA
  }),
)

const filteredVideos = computed(() => {
  const categorySlug = route.query.category
  if (typeof categorySlug !== 'string' || !categorySlug)
    return sortedVideos.value

  return sortedVideos.value.filter(video => video.category === categorySlug)
})

onMounted(async () => {
  try {
    await ensureLoaded()
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="media-view">
    <ListPageBanner />
    <p v-if="loading" class="media-view__status">
      Загрузка…
    </p>
    <p v-else-if="!filteredVideos.length" class="media-view__status">
      {{ sortedVideos.length ? 'В этой категории пока нет видео.' : 'Видео пока нет — загляните позже.' }}
    </p>
    <section v-else class="media-view__grid">
      <TransitionGroup name="media-grid" tag="div" class="media-view__grid-inner">
        <VideoCard v-for="video in filteredVideos" :key="video.id" :video="video" />
      </TransitionGroup>
    </section>
  </div>
</template>

<style scoped lang="scss">
.media-view__grid {
  margin-top: 1.5rem;
}

.media-view__grid-inner {
  display: grid;
  gap: 1rem;

  @include sm {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  @include md {
    grid-template-columns: repeat(3, 1fr);
  }

  @include lg {
    grid-template-columns: repeat(4, 1fr);
  }
}

.media-grid-move {
  transition: transform 0.2s ease;
}

.media-grid-enter-active {
  transition: opacity 0.15s ease;
}

.media-grid-leave-active {
  display: none;
}

.media-grid-enter-from {
  opacity: 0;
}

.media-view__status {
  margin-top: 2rem;
  color: $color-secondary;
}
</style>
