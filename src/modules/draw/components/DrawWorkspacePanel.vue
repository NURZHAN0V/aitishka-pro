<script setup lang="ts">
import type { SecondaryTab } from '@/modules/draw/types/draw-editor'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import BaseIcon from '@/core/components/BaseIcon.vue'
import BaseTooltip from '@/core/components/BaseTooltip.vue'
import DrawSecondaryPopover from '@/modules/draw/components/DrawSecondaryPopover.vue'

const props = defineProps<{
  showSecondaryPopover: boolean
  secondaryTab: SecondaryTab
  fps: number
  resizeWidth: number
  resizeHeight: number
  maintainAspectRatio: boolean
  spriteTitle: string
  spriteDescription: string
  exportScale: number
  scaledExportWidth: number
  scaledExportHeight: number
  zoomPercent: number
  zoom: number
  canvasScreenWidth: number
  canvasScreenHeight: number
  showGrid: boolean
  onionSkin: boolean
}>()

const emit = defineEmits<{
  'undo': []
  'redo': []
  'clearAnimation': []
  'toggleSecondary': [tab: SecondaryTab]
  'closeSecondary': []
  'openAnimationPreview': []
  'zoomOut': []
  'zoomIn': []
  'zoomFit': []
  'workspaceViewport': [size: { width: number, height: number }]
  'toggleGrid': []
  'toggleOnionSkin': []
  'update:fps': [value: number]
  'flipHorizontal': []
  'flipVertical': []
  'rotateRight': []
  'cropToSelection': []
  'resizeWidthInput': [event: Event]
  'resizeHeightInput': [event: Event]
  'toggleMaintainAspectRatio': []
  'resizeCanvas': []
  'update:spriteTitle': [value: string]
  'update:spriteDescription': [value: string]
  'saveDraft': []
  'exportProject': []
  'update:exportScale': [value: number]
  'exportPNG': []
  'exportGIF': []
  'exportZIP': []
  'restoreDraft': []
  'importProject': []
  'importImage': []
}>()

const zoomHelpText = computed(
  () =>
    `100% — весь холст и сетка помещаются в серую область без прокрутки. Сейчас клетка ≈ ${props.zoom} px (холст ${props.canvasScreenWidth}×${props.canvasScreenHeight} px). Больше 100% — увеличение; меньше 100% нельзя — это уже вписывание по краю. «Вписать» снова ставит 100%.`,
)

const canvasScrollViewport = ref<HTMLElement | null>(null)
const drawWorkspaceToolbarRef = ref<HTMLElement | null>(null)

function isClickInsidePopoverOrToolbar(e: MouseEvent): boolean {
  const toolbarRoot = drawWorkspaceToolbarRef.value
  for (const node of e.composedPath()) {
    if (!(node instanceof Element)) {
      continue
    }
    if (node.closest('[data-draw-secondary-popover]')) {
      return true
    }
    if (toolbarRoot?.contains(node)) {
      return true
    }
  }
  return false
}

function handleDocumentClickOutsideSecondary(e: MouseEvent) {
  if (!props.showSecondaryPopover) {
    return
  }
  if (isClickInsidePopoverOrToolbar(e)) {
    return
  }
  emit('closeSecondary')
}

let detachOutsideClickListener: (() => void) | null = null

watch(
  () => props.showSecondaryPopover,
  (open) => {
    if (typeof window === 'undefined') {
      return
    }
    detachOutsideClickListener?.()
    detachOutsideClickListener = null
    if (!open) {
      return
    }
    document.addEventListener('click', handleDocumentClickOutsideSecondary)
    detachOutsideClickListener = () => {
      document.removeEventListener('click', handleDocumentClickOutsideSecondary)
      detachOutsideClickListener = null
    }
  },
)

function measureViewport() {
  const el = canvasScrollViewport.value
  if (!el) {
    return
  }
  const style = getComputedStyle(el)
  const pl = Number.parseFloat(style.paddingLeft) || 0
  const pr = Number.parseFloat(style.paddingRight) || 0
  const pt = Number.parseFloat(style.paddingTop) || 0
  const pb = Number.parseFloat(style.paddingBottom) || 0
  emit('workspaceViewport', {
    width: Math.max(0, el.clientWidth - pl - pr),
    height: Math.max(0, el.clientHeight - pt - pb),
  })
}

let ro: ResizeObserver | null = null

onMounted(() => {
  void nextTick(() => {
    measureViewport()
    const el = canvasScrollViewport.value
    if (!el || typeof ResizeObserver === 'undefined') {
      return
    }
    ro = new ResizeObserver(() => measureViewport())
    ro.observe(el)
  })
})

onUnmounted(() => {
  ro?.disconnect()
  ro = null
  if (typeof window !== 'undefined') {
    detachOutsideClickListener?.()
  }
})

function secondaryBtnClass(tab: SecondaryTab) {
  return props.secondaryTab === tab && props.showSecondaryPopover
    ? 'draw-btn draw-btn--icon draw-btn--active'
    : 'draw-btn draw-btn--icon'
}
</script>

<template>
  <div class="draw-workspace">
    <div ref="drawWorkspaceToolbarRef" class="draw-workspace__toolbar">
      <div class="draw-workspace__toolbar-scroll draw-scrollbar">
        <div class="draw-workspace__toolbar-row">
          <BaseTooltip text="Отменить (Ctrl+Z)">
            <button type="button" aria-label="Отменить" class="draw-btn" @click="emit('undo')">
              <BaseIcon name="draw-undo" size="1.25rem" />
            </button>
          </BaseTooltip>
          <BaseTooltip text="Повторить (Ctrl+Y)">
            <button type="button" aria-label="Повторить" class="draw-btn" @click="emit('redo')">
              <BaseIcon name="draw-redo" size="1.25rem" />
            </button>
          </BaseTooltip>
          <BaseTooltip text="Полная очистка: один пустой кадр, сброс истории">
            <button type="button" aria-label="Полная очистка проекта" class="draw-btn" @click="emit('clearAnimation')">
              <BaseIcon name="draw-delete" size="1.25rem" />
            </button>
          </BaseTooltip>
          <BaseTooltip text="Общие настройки">
            <button type="button" :class="secondaryBtnClass('settings')" @click="emit('toggleSecondary', 'settings')">
              <BaseIcon name="draw-settings" size="1.25rem" />
            </button>
          </BaseTooltip>
          <BaseTooltip text="Изменение размера">
            <button type="button" :class="secondaryBtnClass('resize')" @click="emit('toggleSecondary', 'resize')">
              <BaseIcon name="draw-resize" size="1.25rem" />
            </button>
          </BaseTooltip>
          <BaseTooltip text="Сохранение">
            <button type="button" :class="secondaryBtnClass('save')" @click="emit('toggleSecondary', 'save')">
              <BaseIcon name="draw-save" size="1.25rem" />
            </button>
          </BaseTooltip>
          <BaseTooltip text="Экспорт">
            <button type="button" :class="secondaryBtnClass('export')" @click="emit('toggleSecondary', 'export')">
              <BaseIcon name="draw-export" size="1.25rem" />
            </button>
          </BaseTooltip>
          <BaseTooltip text="Загрузка">
            <button type="button" :class="secondaryBtnClass('load')" @click="emit('toggleSecondary', 'load')">
              <BaseIcon name="draw-folder" size="1.25rem" />
            </button>
          </BaseTooltip>
          <div class="draw-workspace__toolbar-divider">
            <BaseTooltip text="Открыть просмотр анимации">
              <button
                type="button"
                aria-label="Открыть просмотр анимации"
                class="draw-btn draw-btn--icon draw-btn--accent"
                @click="emit('openAnimationPreview')"
              >
                <BaseIcon name="draw-play" size="1.25rem" />
              </button>
            </BaseTooltip>
          </div>
        </div>
      </div>
      <div style="position: relative; margin-bottom: 0.5rem">
        <DrawSecondaryPopover
          :visible="showSecondaryPopover"
          :tab="secondaryTab"
          :fps="fps"
          :resize-width="resizeWidth"
          :resize-height="resizeHeight"
          :maintain-aspect-ratio="maintainAspectRatio"
          :sprite-title="spriteTitle"
          :sprite-description="spriteDescription"
          :export-scale="exportScale"
          :scaled-export-width="scaledExportWidth"
          :scaled-export-height="scaledExportHeight"
          @close="emit('closeSecondary')"
          @update:fps="emit('update:fps', $event)"
          @flip-horizontal="emit('flipHorizontal')"
          @flip-vertical="emit('flipVertical')"
          @rotate-right="emit('rotateRight')"
          @crop-to-selection="emit('cropToSelection')"
          @resize-width-input="emit('resizeWidthInput', $event)"
          @resize-height-input="emit('resizeHeightInput', $event)"
          @toggle-maintain-aspect-ratio="emit('toggleMaintainAspectRatio')"
          @resize-canvas="emit('resizeCanvas')"
          @update:sprite-title="emit('update:spriteTitle', $event)"
          @update:sprite-description="emit('update:spriteDescription', $event)"
          @save-draft="emit('saveDraft')"
          @export-project="emit('exportProject')"
          @update:export-scale="emit('update:exportScale', $event)"
          @export-p-n-g="emit('exportPNG')"
          @export-g-i-f="emit('exportGIF')"
          @export-z-i-p="emit('exportZIP')"
          @restore-draft="emit('restoreDraft')"
          @import-project="emit('importProject')"
          @import-image="emit('importImage')"
        />
      </div>
    </div>
    <div ref="canvasScrollViewport" class="draw-workspace__viewport draw-scrollbar">
      <slot />
    </div>
    <div class="draw-workspace__zoom-bar">
      <button type="button" class="draw-btn draw-btn--icon" @click="emit('zoomOut')">
        <BaseIcon name="draw-zoom-out" size="1.25rem" />
      </button>
      <BaseTooltip :text="zoomHelpText" position="bottom">
        <span class="draw-workspace__zoom-label">Масштаб {{ zoomPercent }}%</span>
      </BaseTooltip>
      <button type="button" class="draw-btn draw-btn--icon" @click="emit('zoomIn')">
        <BaseIcon name="draw-zoom-in" size="1.25rem" />
      </button>
      <BaseTooltip text="100% — весь холст в окне без прокрутки" position="bottom">
        <button type="button" class="draw-btn" @click="emit('zoomFit')">
          <BaseIcon name="draw-fit" size="1rem" />
          <span>Вписать</span>
        </button>
      </BaseTooltip>
      <button
        type="button"
        class="draw-btn"
        :class="showGrid ? 'draw-btn--active' : ''"
        aria-label="Переключить сетку"
        @click="emit('toggleGrid')"
      >
        <BaseIcon name="draw-grid" size="1rem" />
        <span>Сетка</span>
      </button>
      <button
        type="button"
        class="draw-btn"
        :class="onionSkin ? 'draw-btn--active' : ''"
        aria-label="Переключить кальку"
        @click="emit('toggleOnionSkin')"
      >
        <BaseIcon name="draw-onion" size="1rem" />
        <span>Калька</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/modules/draw/styles/draw';
</style>
