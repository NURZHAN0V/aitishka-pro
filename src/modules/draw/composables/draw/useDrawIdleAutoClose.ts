import type { ComputedRef } from 'vue'
import { onBeforeUnmount, onMounted, watch } from 'vue'

/**
 * Закрывает оверлеи редактора после простоя (нет pointer / клавиш / колеса).
 * Сброс таймера на любой заметной активности пользователя.
 */
export function useDrawIdleAutoClose(options: {
  isOpen: ComputedRef<boolean>
  idleMs?: number
  onIdle: () => void
}) {
  const idleMs = options.idleMs ?? 90_000
  let timerId: number | undefined

  function clearTimer() {
    if (timerId !== undefined) {
      clearTimeout(timerId)
      timerId = undefined
    }
  }

  function schedule() {
    clearTimer()
    if (!options.isOpen.value) {
      return
    }
    timerId = window.setTimeout(() => {
      timerId = undefined
      options.onIdle()
    }, idleMs)
  }

  function onActivity() {
    if (options.isOpen.value) {
      schedule()
    }
  }

  const listeners: [string, EventListener][] = [
    ['pointerdown', onActivity],
    ['keydown', onActivity],
    ['wheel', onActivity],
    ['touchstart', onActivity],
  ]

  onMounted(() => {
    for (const [ev, fn] of listeners) {
      window.addEventListener(ev, fn, { capture: true, passive: true })
    }
  })

  watch(
    options.isOpen,
    (open) => {
      if (open) {
        schedule()
      }
      else {
        clearTimer()
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    clearTimer()
    for (const [ev, fn] of listeners) {
      window.removeEventListener(ev, fn, { capture: true })
    }
  })
}
