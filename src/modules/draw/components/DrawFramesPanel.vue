<script setup lang="ts">
import type { DrawFrame } from '@/modules/draw/types/draw-editor'
import { ref } from 'vue'
import BaseIcon from '@/core/components/BaseIcon.vue'
import BaseTooltip from '@/core/components/BaseTooltip.vue'

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
  <div class="draw-panel draw-panel--wide draw-panel--frames">
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
            <BaseTooltip text="Дублировать кадр">
              <button
                type="button"
                aria-label="Дублировать кадр"
                class="draw-btn draw-btn--icon draw-btn--sm"
                @click.stop="emit('duplicateFrameFrom', frameIndex)"
              >
                <BaseIcon name="draw-copy" size="0.875rem" />
              </button>
            </BaseTooltip>
            <BaseTooltip text="Удалить кадр">
              <button
                type="button"
                aria-label="Удалить кадр"
                class="draw-btn draw-btn--icon draw-btn--sm draw-btn--danger"
                @click.stop="emit('removeFrameAt', frameIndex)"
              >
                <BaseIcon name="draw-delete" size="0.875rem" />
              </button>
            </BaseTooltip>
          </div>
          <canvas
            :ref="(el) => setThumbRef(frame.id, el as HTMLCanvasElement | null)"
            width="88"
            height="88"
            class="draw-frame-thumb__canvas"
          />
        </button>
      </div>
      <button
        type="button"
        class="draw-btn draw-btn--dashed draw-frame-add"
        @click="emit('addFrame')"
      >
        Добавить кадр
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/modules/draw/styles/draw';

.draw-frame-add {
  width: 100%;
  height: 3rem;
}
</style>
