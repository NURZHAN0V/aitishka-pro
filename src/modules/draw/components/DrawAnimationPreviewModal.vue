<script setup lang="ts">
import BaseIcon from '@/core/components/BaseIcon.vue'
import DrawModalShell from '@/modules/draw/components/DrawModalShell.vue'

defineProps<{
  visible: boolean
  fps: number
  isAnimationPlaying: boolean
}>()

const emit = defineEmits<{
  'close': []
  'update:fps': [value: number]
  'togglePlay': []
}>()
</script>

<template>
  <DrawModalShell :open="visible" dialog-label="Просмотр анимации" @close="emit('close')">
    <div class="draw-modal-card">
      <div class="draw-modal-card__head" style="padding: 0 0 0.75rem; border: none">
        <p class="draw-popover__title">
          Просмотр анимации
        </p>
        <button
          type="button"
          aria-label="Закрыть просмотр анимации"
          class="draw-btn draw-btn--icon draw-btn--sm"
          @click="emit('close')"
        >
          <BaseIcon name="close" size="1.25rem" />
        </button>
      </div>
      <div class="draw-modal-preview">
        <slot />
      </div>
      <div class="draw-modal-playback">
        <button
          type="button"
          class="draw-btn draw-btn--icon"
          :aria-label="isAnimationPlaying ? 'Пауза' : 'Воспроизведение'"
          @click="emit('togglePlay')"
        >
          <BaseIcon :name="isAnimationPlaying ? 'draw-pause' : 'draw-play'" size="1.25rem" />
        </button>
        <label class="draw-sr-only" for="draw-anim-fps">Скорость кадров в секунду</label>
        <input
          id="draw-anim-fps"
          :value="fps"
          type="range"
          min="1"
          max="24"
          class="draw-range__input"
          style="flex: 1; min-width: 0"
          @input="emit('update:fps', Number(($event.target as HTMLInputElement).value))"
        >
        <span style="width: 3rem; flex-shrink: 0; text-align: right; font-size: 0.75rem; color: var(--color-text-secondary)">{{ fps }} к/с</span>
      </div>
    </div>
  </DrawModalShell>
</template>

<style scoped lang="scss">
@use '@/modules/draw/styles/draw';
</style>
