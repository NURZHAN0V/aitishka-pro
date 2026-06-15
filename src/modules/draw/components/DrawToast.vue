<script setup lang="ts">
import type { DrawNotifyType } from '@/modules/draw/composables/useDrawNotify'
import BaseIcon from '@/core/components/BaseIcon.vue'
import { useDrawNotify } from '@/modules/draw/composables/useDrawNotify'

const { notifications, dismissNotification } = useDrawNotify()

const iconByType: Record<DrawNotifyType, string> = {
  success: 'draw-save',
  warning: 'draw-question',
  error: 'draw-delete',
  info: 'draw-question',
}

function toastClass(type: DrawNotifyType) {
  return `draw-toast draw-toast--${type}`
}
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="draw-toast" tag="div" class="draw-toast-stack">
      <article
        v-for="notification in notifications"
        :key="notification.id"
        :class="toastClass(notification.type)"
      >
        <BaseIcon :name="iconByType[notification.type]" size="1.25rem" />
        <div class="draw-toast__body">
          <h4 class="draw-toast__title">
            {{ notification.title }}
          </h4>
          <p v-if="notification.message" class="draw-toast__message">
            {{ notification.message }}
          </p>
        </div>
        <button
          type="button"
          class="draw-toast__close"
          aria-label="Закрыть уведомление"
          @click="dismissNotification(notification.id)"
        >
          <BaseIcon name="close" size="1rem" />
        </button>
      </article>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/modules/draw/styles/draw';
</style>
