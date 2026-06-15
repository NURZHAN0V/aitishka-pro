<script setup lang="ts">
import type { DrawTool, ToolOption } from '@/modules/draw/types/draw-editor'
import BaseIcon from '@/core/components/BaseIcon.vue'
import { toolIconById } from '@/modules/draw/types/draw-editor'

defineProps<{
  primaryToolOptions: ToolOption[]
  secondaryToolOptions: ToolOption[]
  activeTool: DrawTool
  penSize: number
}>()

const emit = defineEmits<{
  'setTool': [tool: DrawTool]
  'openShortcuts': []
  'update:penSize': [value: number]
}>()

function penGradient(penSize: number) {
  const pct = ((penSize - 1) / 7) * 100
  return {
    background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${pct}%, var(--color-surface-muted) ${pct}%, var(--color-surface-muted) 100%)`,
  }
}
</script>

<template>
  <div class="draw-panel">
    <button
      type="button"
      class="draw-btn draw-tools-shortcuts"
      @click="emit('openShortcuts')"
    >
      <BaseIcon name="draw-question" size="1rem" />
      <span>Горячие клавиши</span>
    </button>
    <div class="draw-tool-grid">
      <button
        v-for="tool in primaryToolOptions"
        :key="tool.id"
        type="button"
        class="draw-tool-btn"
        :class="{ 'draw-tool-btn--active': activeTool === tool.id }"
        :aria-label="`${tool.label} (${tool.hotkey})`"
        @click="emit('setTool', tool.id)"
      >
        <BaseTooltip :text="`${tool.label} (${tool.hotkey})`" position="bottom">
          <BaseIcon :name="toolIconById[tool.id]" size="1rem" />
        </BaseTooltip>
      </button>
      <button
        v-for="tool in secondaryToolOptions"
        :key="`secondary-${tool.id}`"
        type="button"
        class="draw-tool-btn"
        :class="{ 'draw-tool-btn--active': activeTool === tool.id }"
        :aria-label="`${tool.label} (${tool.hotkey})`"
        @click="emit('setTool', tool.id)"
      >
        <BaseTooltip :text="`${tool.label} (${tool.hotkey})`" position="bottom">
          <BaseIcon :name="toolIconById[tool.id]" size="1rem" />
        </BaseTooltip>
      </button>
    </div>
    <div class="draw-range" style="margin-top: 0.625rem">
      <label class="draw-sr-only">Размер пера</label>
      <p class="draw-panel__hint" style="margin-top: 0; margin-bottom: 0.25rem">
        Размер пера
      </p>
      <div class="draw-range__labels">
        <span>1 px</span>
        <span class="draw-range__value">{{ penSize }} px</span>
        <span>8 px</span>
      </div>
      <input
        :value="penSize"
        type="range"
        min="1"
        max="8"
        step="1"
        aria-label="Размер пера"
        class="draw-range__input"
        :style="penGradient(penSize)"
        @input="emit('update:penSize', Number(($event.target as HTMLInputElement).value))"
      >
      <div class="draw-range__hint">
        <span>Точность</span>
        <span>Покрытие</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/modules/draw/styles/draw';

.draw-tools-shortcuts {
  width: 100%;
  margin-bottom: 0.5rem;
}
</style>
