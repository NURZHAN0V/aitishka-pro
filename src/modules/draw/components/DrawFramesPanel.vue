<script setup lang="ts">
import type { DrawFrame } from '@/modules/draw/types/draw-editor'
import { ref } from 'vue'
import BaseIcon from '@/core/components/BaseIcon.vue'

defineProps<{
  frames: DrawFrame[]
  activeFrameIndex: number
  setThumbRef: (frameId: string, el: HTMLCanvasElement | null) => void
}>()

const emit = defineEmits<{
  'update:activeFrameIndex': [index: number]
  'duplicateFrameFrom': [index: number]
  'removeFrameAt': [index: number]
  'addFrame': []
  'reorderFrame': [from: number, to: number]
}>()

const isDragging = ref(false)
const dragFromIndex = ref<number | null>(null)

function onDragStart(index: number, event: DragEvent) {
  dragFromIndex.value = index
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

function onDragEnter() {
  /* highlight handled via CSS if needed */
}

function onDrop(index: number) {
  if (dragFromIndex.value === null) {
    onDragEnd()
    return
  }
  emit('reorderFrame', dragFromIndex.value, index)
  onDragEnd()
}

function onDragEnd() {
  isDragging.value = false
  dragFromIndex.value = null
}
</script>

<template>
  <div class="draw-panel draw-panel--wide">
    <div class="draw-panel__head">
      <p class="draw-panel__title">
        <span>Кадры</span>
      </p>
    </div>
    <div
      class="draw-frames-drop draw-scrollbar"
      :class="{ 'draw-frames-drop--dragging': isDragging }"
      style="display: flex; flex-direction: column; gap: 0.5rem"
      @dragover.prevent
    >
      <div
        v-for="(frame, frameIndex) in frames"
        :key="frame.id"
        @dragenter.prevent="onDragEnter()"
        @dragover.prevent
      >
        <button
          type="button"
          class="draw-frame-thumb"
          :class="{ 'draw-frame-thumb--active': activeFrameIndex === frameIndex }"
          draggable="true"
          @click="emit('update:activeFrameIndex', frameIndex)"
          @dragstart="onDragStart(frameIndex, $event)"
          @dragend="onDragEnd"
          @drop.prevent="onDrop(frameIndex)"
        >
          <span class="draw-frame-thumb__index">
            {{ frameIndex + 1 }}
          </span>
          <div
            class="draw-frame-thumb__actions"
            :style="{ opacity: activeFrameIndex === frameIndex ? 1 : undefined }"
          >
            <button
              type="button"
              class="draw-btn draw-btn--icon draw-btn--sm"
              title="Дублировать кадр"
              @click.stop="emit('duplicateFrameFrom', frameIndex)"
            >
              <BaseIcon name="draw-copy" size="0.875rem" />
            </button>
            <button
              type="button"
              class="draw-btn draw-btn--icon draw-btn--sm draw-btn--danger"
              title="Удалить кадр"
              @click.stop="emit('removeFrameAt', frameIndex)"
            >
              <BaseIcon name="draw-delete" size="0.875rem" />
            </button>
          </div>
          <canvas
            :ref="(el) => setThumbRef(frame.id, el as HTMLCanvasElement | null)"
            width="88"
            height="88"
            class="draw-frame-thumb__canvas"
          />
        </button>
      </div>
    </div>
    <button
      type="button"
      class="draw-btn draw-btn--dashed"
      style="margin-top: 0.5rem; height: 3rem"
      @click="emit('addFrame')"
    >
      Добавить кадр
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '@/modules/draw/styles/draw';
</style>
