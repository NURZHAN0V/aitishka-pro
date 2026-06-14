<script setup lang="ts">
import type { Video } from '@/index.d'
import { onMounted, ref } from 'vue'
import { api } from '@/core/api'
import { useWhenVisible } from '@/core/composables/useWhenVisible'
import VideoCard from '@/modules/media/components/VideoCard.vue'

const videos = ref<Video[]>([])
const loading = ref(true)
const { target: gridRef, visible: gridVisible } = useWhenVisible()

onMounted(async () => {
  try {
    videos.value = await api.getVideos()
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="media-view">
    <h2 class="page-title">
      Видео
    </h2>
    <p class="page-lead">
      Учебные видео по программированию и смежным темам.
    </p>

    <p v-if="loading" class="media-view__status">
      Загрузка…
    </p>
    <section v-else ref="gridRef" class="media-view__grid">
      <VideoCard v-for="video in videos" v-show="gridVisible" :key="video.id" :video="video" />
    </section>
  </div>
</template>

<style scoped lang="scss">
.media-view__grid {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;

  @include sm {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @include lg {
    grid-template-columns: repeat(3, 1fr);
  }
}

.media-view__status {
  margin-top: 2rem;
  color: $color-secondary;
}
</style>
