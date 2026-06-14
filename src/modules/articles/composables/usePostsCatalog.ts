import type { PostSummary, Taxonomy } from '@/index.d'
import { ref } from 'vue'
import { api } from '@/core/api'

const posts = ref<PostSummary[]>([])
const taxonomy = ref<Taxonomy | null>(null)
const ready = ref(false)
let loadPromise: Promise<void> | null = null

export function usePostsCatalog() {
  async function ensureLoaded() {
    if (ready.value)
      return

    if (!loadPromise) {
      loadPromise = (async () => {
        const [allPosts, tax] = await Promise.all([
          api.getPosts(),
          api.getTaxonomy(),
        ])
        posts.value = allPosts
        taxonomy.value = tax
        ready.value = true
      })()
    }

    await loadPromise
  }

  return { posts, taxonomy, ready, ensureLoaded }
}
