import { ref } from 'vue'

export type DrawNotifyType = 'success' | 'warning' | 'error' | 'info'

export interface DrawNotifyPayload {
  type: DrawNotifyType
  title: string
  message?: string
  duration?: number
}

interface DrawNotifyItem extends DrawNotifyPayload {
  id: number
}

const notifications = ref<DrawNotifyItem[]>([])
let nextId = 0

export function useDrawNotify() {
  function showNotification(payload: DrawNotifyPayload) {
    const id = ++nextId
    const duration = payload.duration ?? 4000
    notifications.value.push({ ...payload, id })
    if (duration > 0) {
      window.setTimeout(() => {
        notifications.value = notifications.value.filter(n => n.id !== id)
      }, duration)
    }
  }

  function dismissNotification(id: number) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    notifications,
    showNotification,
    dismissNotification,
  }
}
