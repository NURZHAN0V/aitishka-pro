import type { Ref } from 'vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

export const ARTICLES_INITIAL_BATCH = 12
export const ARTICLES_LOAD_MORE_BATCH = 12
export const ARTICLES_SCROLL_ROOT_MARGIN = '480px'

export function useLazyPostList<T>(items: Ref<T[]>) {
  const visibleCount = ref(ARTICLES_INITIAL_BATCH)
  const loadingMore = ref(false)
  const sentinel = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null

  const visibleItems = computed(() => items.value.slice(0, visibleCount.value))
  const hasMore = computed(() => visibleCount.value < items.value.length)

  function reset() {
    visibleCount.value = ARTICLES_INITIAL_BATCH
    loadingMore.value = false
  }

  function loadMore() {
    if (!hasMore.value || loadingMore.value)
      return

    loadingMore.value = true
    requestAnimationFrame(() => {
      visibleCount.value = Math.min(
        visibleCount.value + ARTICLES_LOAD_MORE_BATCH,
        items.value.length,
      )
      loadingMore.value = false
    })
  }

  function disconnectObserver() {
    observer?.disconnect()
    observer = null
  }

  function connectObserver() {
    disconnectObserver()

    if (!sentinel.value || typeof IntersectionObserver === 'undefined')
      return

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting)
          loadMore()
      },
      { rootMargin: ARTICLES_SCROLL_ROOT_MARGIN },
    )
    observer.observe(sentinel.value)
  }

  watch(items, reset)
  watch(sentinel, (el) => {
    if (el)
      connectObserver()
    else
      disconnectObserver()
  })

  onBeforeUnmount(disconnectObserver)

  return { visibleItems, hasMore, loadingMore, sentinel }
}
