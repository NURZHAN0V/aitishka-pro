import type { Video } from '@/index.d'
import { ref } from 'vue'
import { api } from '@/core/api'

const videos = ref<Video[]>([])
const ready = ref(false)
let loadPromise: Promise<void> | null = null

export function useVideosCatalog() {
  async function ensureLoaded() {
    if (ready.value)
      return

    if (!loadPromise) {
      loadPromise = (async () => {
        videos.value = await api.getVideos()
        ready.value = true
      })()
    }

    await loadPromise
  }

  return { videos, ready, ensureLoaded }
}
