<script setup lang="ts">
import type { CategoryRef, Video } from '@/index.d'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { api } from '@/core/api'
import { usePageBreadcrumbs } from '@/core/composables/usePageBreadcrumbs'
import VideoPlaylistItem from '@/modules/media/components/VideoPlaylistItem.vue'
import { buildVideoBreadcrumbs } from '@/modules/media/utils/buildVideoBreadcrumbs'
import { resolveVideoCategoryName } from '@/modules/media/utils/buildVideoCategoryChips'
import { formatExcerpt } from '@/modules/media/utils/formatExcerpt'
import { getSidebarVideos, getVideoBySlug } from '@/modules/media/utils/videoHelpers'

const route = useRoute()
const { setPageBreadcrumbs, clearPageBreadcrumbs } = usePageBreadcrumbs()
const videos = ref<Video[]>([])
const videoCategories = ref<CategoryRef[]>([])
const loading = ref(true)
const playerKey = ref(0)

const slug = computed(() => route.params.slug as string)
const video = computed(() => getVideoBySlug(videos.value, slug.value))
const sidebar = computed(() => (video.value ? getSidebarVideos(videos.value, video.value) : null))
const description = computed(() => (video.value ? formatExcerpt(video.value.excerpt, 600) : ''))

async function loadVideos() {
  loading.value = true
  try {
    const [items, taxonomy] = await Promise.all([
      api.getVideos(),
      api.getVideoTaxonomy(),
    ])
    videos.value = items
    videoCategories.value = taxonomy.categories
    syncBreadcrumbs()
  }
  finally {
    loading.value = false
  }
}

function syncBreadcrumbs() {
  if (video.value)
    setPageBreadcrumbs(buildVideoBreadcrumbs(video.value, videoCategories.value))
  else
    clearPageBreadcrumbs()
}

function videoCategoryLabel(categorySlug: string) {
  return resolveVideoCategoryName(categorySlug, videoCategories.value)
}

watch(slug, () => {
  playerKey.value += 1
  syncBreadcrumbs()
  if (video.value)
    document.title = `${video.value.title} — AITISHKAPRO`
})

watch(video, (current) => {
  if (current) {
    setPageBreadcrumbs(buildVideoBreadcrumbs(current, videoCategories.value))
    document.title = `${current.title} — AITISHKAPRO`
  }
})

onMounted(loadVideos)
onUnmounted(clearPageBreadcrumbs)
</script>

<template>
  <div v-if="loading" class="video-view__status">
    Загрузка…
  </div>

  <div v-else-if="video" class="video-view">
    <div class="video-view__layout">
      <section class="video-view__main">
        <div class="video-view__player card">
          <iframe
            :key="playerKey"
            :src="video.embedUrl"
            :title="video.title"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
            allowfullscreen
          />
        </div>

        <article class="video-view__info card">
          <h1 class="video-view__title">
            {{ video.title }}
          </h1>

          <p v-if="description" class="video-view__description">
            {{ description }}
          </p>
        </article>
      </section>

      <aside v-if="sidebar?.videos.length" class="video-view__aside card">
        <header class="video-view__aside-head">
          <h2>{{ sidebar.title }}</h2>
          <span class="video-view__aside-count">{{ sidebar.videos.length }}</span>
        </header>

        <div class="video-view__playlist">
          <VideoPlaylistItem
            v-for="(item, index) in sidebar.videos"
            :key="item.id"
            :video="item"
            :category-label="videoCategoryLabel(item.category)"
            :active="item.id === video.id"
            :index="sidebar.isPlaylist ? index + 1 : undefined"
            :show-order="sidebar.isPlaylist"
          />
        </div>
      </aside>
    </div>
  </div>

  <div v-else class="video-view video-view--empty">
    <h2 class="page-title">
      Видео не найдено
    </h2>
    <p class="page-lead">
      Возможно, ролик был удалён или ссылка устарела.
    </p>
    <RouterLink to="/media" class="btn btn--outline video-view__empty-link">
      Вернуться к списку
    </RouterLink>
  </div>
</template>

<style scoped lang="scss">
.video-view__status {
  padding: 2rem 0;
  color: $color-secondary;
}

.video-view__layout {
  display: grid;
  gap: 1.25rem;

  @include lg {
    grid-template-columns: minmax(0, 1fr) min(22rem, 34%);
    gap: 1.5rem;
    align-items: start;
  }
}

.video-view__main {
  min-width: 0;
}

.video-view__player {
  overflow: hidden;
  padding: 0;
  aspect-ratio: 16 / 9;
  background: $color-surface-inverse;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
}

.video-view__info {
  margin-top: 1rem;
  padding: 1.25rem 1.5rem;
}

.video-view__title {
  font-size: $text-xl;
  font-weight: 600;
  line-height: 1.3;
  color: $color-default;
}

.video-view__description {
  margin-top: 1rem;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: $color-secondary;
  white-space: pre-line;
}

.video-view__aside {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 1rem;

  @include lg {
    position: sticky;
    top: 1rem;
    max-height: calc(100dvh - 2rem);
  }
}

.video-view__aside-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid $color-gray-200;

  h2 {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.35;
  }
}

.video-view__aside-count {
  flex-shrink: 0;
  min-width: 1.5rem;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  color: $color-primary;
  background: $color-primary-alpha-12;
  border-radius: 999px;
}

.video-view__playlist {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  overflow-y: auto;
  padding-right: 0.125rem;

  @include lg {
    flex: 1;
    min-height: 0;
  }
}

.video-view--empty {
  padding-block: 2rem;
  text-align: center;
}

.video-view__empty-link {
  display: inline-flex;
  margin-top: 1.5rem;
}
</style>
