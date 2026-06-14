import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useWhenVisible(rootMargin = '200px'): { target: Ref<HTMLElement | null>, visible: Ref<boolean> } {
  const target = ref<HTMLElement | null>(null)
  const visible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!target.value)
      return
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          visible.value = true
          observer?.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(target.value)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { target, visible }
}
