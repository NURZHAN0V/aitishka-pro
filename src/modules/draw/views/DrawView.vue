<script setup lang="ts">
import type { DrawFrame, DrawPoint, DrawSelectionRect, DrawTool, SecondaryTab } from '@/modules/draw/types/draw-editor'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { applyPageMeta } from '@/core/composables/usePageMeta'
import { useScreenWidth } from '@/core/composables/useScreenWidth'
import DrawAnimationPreviewModal from '@/modules/draw/components/DrawAnimationPreviewModal.vue'
import DrawEditorHeader from '@/modules/draw/components/DrawEditorHeader.vue'
import DrawFramesPanel from '@/modules/draw/components/DrawFramesPanel.vue'
import DrawLayersPanel from '@/modules/draw/components/DrawLayersPanel.vue'
import DrawPalettePanel from '@/modules/draw/components/DrawPalettePanel.vue'
import DrawLayerNameModal from '@/modules/draw/components/DrawLayerNameModal.vue'
import DrawShortcutsModal from '@/modules/draw/components/DrawShortcutsModal.vue'
import DrawToolsPanel from '@/modules/draw/components/DrawToolsPanel.vue'
import DrawWorkspacePanel from '@/modules/draw/components/DrawWorkspacePanel.vue'
import { useDrawCanvasCoords } from '@/modules/draw/composables/draw/useDrawCanvasCoords'
import { useDrawCanvasRendering } from '@/modules/draw/composables/draw/useDrawCanvasRendering'
import { useDrawDraft } from '@/modules/draw/composables/draw/useDrawDraft'
import { useDrawEditorKeyboard } from '@/modules/draw/composables/draw/useDrawEditorKeyboard'
import { useDrawEditorUi } from '@/modules/draw/composables/draw/useDrawEditorUi'
import { useDrawExport } from '@/modules/draw/composables/draw/useDrawExport'
import { createDrawFrame } from '@/modules/draw/composables/draw/useDrawFrameFactory'
import { useDrawHistory } from '@/modules/draw/composables/draw/useDrawHistory'
import { useDrawIdleAutoClose } from '@/modules/draw/composables/draw/useDrawIdleAutoClose'
import { useDrawPainting } from '@/modules/draw/composables/draw/useDrawPainting'
import { collectUniqueColorsFromFrames } from '@/modules/draw/composables/draw/useDrawProjectPalette'
import { useDrawSpriteDocument } from '@/modules/draw/composables/draw/useDrawSpriteDocument'
import { useDrawViewportGuards } from '@/modules/draw/composables/draw/useDrawViewportGuards'
import { primaryToolIds, toolLabelById, toolOptions } from '@/modules/draw/types/draw-editor'

type MobilePanelTab = 'tools' | 'frames' | 'layers'

const DEFAULT_WIDTH = 32
const DEFAULT_HEIGHT = 32

const { screenClass } = useScreenWidth()
const isMobile = computed(() => screenClass.value === 'mobile')
const mobilePanelTab = ref<MobilePanelTab>('tools')

const primaryToolOptions = computed(() => toolOptions.filter(tool => primaryToolIds.includes(tool.id)))
const secondaryToolOptions = computed(() => toolOptions.filter(tool => !primaryToolIds.includes(tool.id)))

const primaryColor = ref('#1461cd')
const secondaryColor = ref('#0a1628')
const activeTool = ref<DrawTool>('pencil')
const penSize = ref(1)
const zoom = ref(16)
const showGrid = ref(true)
const onionSkin = ref(false)
const showShortcuts = ref(false)
const layerNameModalOpen = ref(false)
const layerNameModalMode = ref<'create' | 'rename'>('create')
const layerNameModalIndex = ref<number | null>(null)
const layerNameModalInitialName = ref('')
const showSecondaryPopover = ref(false)
const showAnimationModal = ref(false)
const isAnimationPlaying = ref(true)
const secondaryTab = ref<SecondaryTab>('settings')
const fps = ref(10)
const exportScale = ref(1)
const maintainAspectRatio = ref(true)
const spriteTitle = ref('Новый спрайт')
const spriteDescription = ref('')
const isReady = ref(false)
const isDirty = ref(false)
const lastSavedAt = ref<Date | null>(null)

const canvasWidth = ref(DEFAULT_WIDTH)
const canvasHeight = ref(DEFAULT_HEIGHT)
const resizeWidth = ref(DEFAULT_WIDTH)
const resizeHeight = ref(DEFAULT_HEIGHT)

const frames = ref<DrawFrame[]>([createDrawFrame(DEFAULT_WIDTH, DEFAULT_HEIGHT)])
const projectPaletteColors = ref<string[]>([])
watch(
  frames,
  () => {
    projectPaletteColors.value = collectUniqueColorsFromFrames(frames.value)
  },
  { deep: true, immediate: true, flush: 'post' },
)

function setPrimaryColorHex(hex: string) {
  primaryColor.value = hex
}

function setSecondaryColorHex(hex: string) {
  secondaryColor.value = hex
}

const activeFrameIndex = ref(0)
const activeLayerIndex = ref(0)
const selection = ref<DrawSelectionRect | null>(null)

const mouseDown = ref(false)
const isPanning = ref(false)
const hoverPoint = ref<DrawPoint | null>(null)
const pointerStart = ref<DrawPoint | null>(null)
const lassoPath = ref<DrawPoint[]>([])
const moveOffset = ref<DrawPoint>({ x: 0, y: 0 })
const panStartClient = ref<DrawPoint | null>(null)
const panStartScroll = ref<DrawPoint | null>(null)
const panContainer = ref<HTMLElement | null>(null)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const animationPreviewRef = ref<HTMLCanvasElement | null>(null)
const frameThumbRefs = ref<Record<string, HTMLCanvasElement | null>>({})
const animationFrameIndex = ref(0)

const { preventPageZoomWheel, preventGestureZoom } = useDrawViewportGuards()

const activeFrame = computed(() => frames.value[activeFrameIndex.value]!)
const activeLayer = computed(() => activeFrame.value.layers[activeLayerIndex.value]!)
const lastSavedLabel = computed(() => (lastSavedAt.value ? lastSavedAt.value.toLocaleTimeString('ru-RU') : 'ещё не сохранено'))
const scaledExportWidth = computed(() => Math.max(1, Math.round(canvasWidth.value * exportScale.value)))
const scaledExportHeight = computed(() => Math.max(1, Math.round(canvasHeight.value * exportScale.value)))
const workspaceViewport = ref({ width: 800, height: 480 })

const { getCanvasCoords } = useDrawCanvasCoords({
  canvasRef,
  zoom,
  canvasWidth,
  canvasHeight,
})

const {
  renderFrameToContext,
  requestRender,
  requestPreviewRender,
  setFrameThumbRef,
  requestAnimationPreviewRender,
} = useDrawCanvasRendering({
  canvasRef,
  animationPreviewRef,
  frameThumbRefs,
  canvasWidth,
  canvasHeight,
  zoom,
  frames,
  activeFrameIndex,
  activeLayerIndex,
  activeFrame,
  onionSkin,
  showGrid,
  selection,
  hoverPoint,
  penSize,
  animationFrameIndex,
  mouseDown,
  pointerStart,
  activeTool,
  primaryColor,
})

const {
  pushHistory,
  undo,
  redo,
  undoStack,
  baselineSnapshot,
  goToHistoryCheckpoint,
  deleteHistoryCheckpointFrom,
  historySelectedIndex,
  applyHistoryPresentation,
  captureHistoryBaselineFromCurrent,
  clearProjectHistory,
} = useDrawHistory({
  canvasWidth,
  canvasHeight,
  resizeWidth,
  resizeHeight,
  fps,
  frames,
  activeFrameIndex,
  activeLayerIndex,
  activeFrame,
  isDirty,
  requestRender,
})

const { inBounds, onPointerDown, onPointerMove, onPointerUp, onPointerLeave } = useDrawPainting({
  canvasRef,
  canvasWidth,
  canvasHeight,
  activeTool,
  primaryColor,
  secondaryColor,
  penSize,
  activeFrame,
  activeLayer,
  selection,
  mouseDown,
  isPanning,
  hoverPoint,
  pointerStart,
  lassoPath,
  moveOffset,
  panStartClient,
  panStartScroll,
  panContainer,
  getCanvasCoords,
  pushHistory,
  requestRender,
})

const { saveDraft, restoreDraft } = useDrawDraft({
  canvasWidth,
  canvasHeight,
  resizeWidth,
  resizeHeight,
  fps,
  frames,
  activeFrameIndex,
  activeLayerIndex,
  primaryColor,
  secondaryColor,
  spriteTitle,
  spriteDescription,
  exportScale,
  lastSavedAt,
  isDirty,
  requestRender,
  undoStack,
  baselineSnapshot,
  historySelectedIndex,
  applyHistoryPresentation,
  captureHistoryBaselineFromCurrent,
})

function flushDraftBeforeUnload() {
  void saveDraft()
}

function flushDraftOnVisibilityHidden() {
  if (document.visibilityState === 'hidden') {
    void saveDraft()
  }
}

function flushDraftOnPageHide() {
  void saveDraft()
}

const {
  addFrame,
  duplicateFrameFrom,
  removeFrameAt,
  reorderFrame,
  addLayer,
  duplicateLayer,
  duplicateLayerAt,
  applyLayerRename,
  removeLayerAt,
  reorderLayer,
  toggleLayerVisibility,
  mergeLayers,
  clearAnimation,
  rotateRight,
  flipHorizontal,
  flipVertical,
  cropToSelection,
  onResizeWidthInput,
  onResizeHeightInput,
  resizeCanvas,
} = useDrawSpriteDocument({
  canvasWidth,
  canvasHeight,
  resizeWidth,
  resizeHeight,
  frames,
  activeFrameIndex,
  activeLayerIndex,
  selection,
  maintainAspectRatio,
  activeFrame,
  activeLayer,
  inBounds,
  pushHistory,
  requestRender,
  onFullDocumentReset: () => {
    clearProjectHistory()
    void saveDraft()
  },
})

function openCreateLayerModal() {
  layerNameModalMode.value = 'create'
  layerNameModalIndex.value = null
  layerNameModalInitialName.value = `Слой ${activeFrame.value.layers.length + 1}`
  layerNameModalOpen.value = true
}

function openRenameLayerModal(index: number) {
  const layer = activeFrame.value.layers[index]
  if (!layer) {
    return
  }
  layerNameModalMode.value = 'rename'
  layerNameModalIndex.value = index
  layerNameModalInitialName.value = layer.name
  layerNameModalOpen.value = true
}

function closeLayerNameModal() {
  layerNameModalOpen.value = false
}

function submitLayerName(name: string) {
  if (layerNameModalMode.value === 'create') {
    addLayer(name)
  }
  else if (layerNameModalIndex.value !== null) {
    applyLayerRename(layerNameModalIndex.value, name)
  }
  closeLayerNameModal()
}

const {
  exportPNG,
  exportProject,
  exportZIP,
  exportGIF,
  importImage,
  importProject,
} = useDrawExport({
  canvasWidth,
  canvasHeight,
  resizeWidth,
  resizeHeight,
  exportScale,
  fps,
  frames,
  activeFrameIndex,
  activeLayerIndex,
  primaryColor,
  secondaryColor,
  activeFrame,
  activeLayer,
  spriteTitle,
  spriteDescription,
  renderFrameToContext,
  pushHistory,
  requestRender,
  clearProjectHistory,
})

const {
  setTool,
  onCanvasWheel,
  zoomOut,
  zoomIn,
  zoomToFitViewport,
  fitZoom,
  toggleSecondaryPopover,
  openAnimationPreview,
  closeAnimationPreview,
  swapColors,
  resetColors,
  openInNewTab,
} = useDrawEditorUi({
  activeTool,
  zoom,
  canvasWidth,
  canvasHeight,
  secondaryTab,
  showSecondaryPopover,
  showAnimationModal,
  isAnimationPlaying,
  animationFrameIndex,
  primaryColor,
  secondaryColor,
  workspaceViewport,
  requestAnimationPreviewRender,
})

const zoomPercent = computed(() => {
  const f = fitZoom.value
  if (f < 1) {
    return 100
  }
  return Math.round((zoom.value / f) * 100)
})

const didInitialZoomFit = ref(false)
function onWorkspaceViewport(size: { width: number, height: number }) {
  workspaceViewport.value = size
  if (!didInitialZoomFit.value) {
    zoomToFitViewport()
    didInitialZoomFit.value = true
  }
}

watch(fitZoom, (f) => {
  if (zoom.value > f) {
    zoom.value = f
  }
})

const drawOverlayOpen = computed(
  () => showShortcuts.value || showAnimationModal.value || showSecondaryPopover.value || layerNameModalOpen.value,
)

useDrawIdleAutoClose({
  isOpen: drawOverlayOpen,
  idleMs: 120_000,
  onIdle: () => {
    showShortcuts.value = false
    showAnimationModal.value = false
    showSecondaryPopover.value = false
    layerNameModalOpen.value = false
  },
})

const { handleKeyboard } = useDrawEditorKeyboard({
  saveDraft,
  undo,
  redo,
  duplicateLayer,
  showShortcuts,
  showAnimationModal,
  showSecondaryPopover,
  penSize,
  activeTool,
})

let previewTimer: ReturnType<typeof setInterval> | null = null
let animationTimer: ReturnType<typeof setInterval> | null = null
let autosaveTimer: ReturnType<typeof setInterval> | null = null

function msPerFpsTick(): number {
  return Math.max(60, Math.floor(1000 / fps.value))
}

function restartPreviewTimer() {
  if (previewTimer) {
    clearInterval(previewTimer)
    previewTimer = null
  }
  previewTimer = setInterval(() => {
    requestPreviewRender()
  }, msPerFpsTick())
}

function restartAnimationTimer() {
  if (animationTimer) {
    clearInterval(animationTimer)
    animationTimer = null
  }
  animationTimer = setInterval(() => {
    if (!showAnimationModal.value || !isAnimationPlaying.value || frames.value.length === 0) {
      return
    }
    animationFrameIndex.value = (animationFrameIndex.value + 1) % frames.value.length
    requestAnimationPreviewRender()
  }, msPerFpsTick())
}

onMounted(() => {
  applyPageMeta({
    title: 'Рисовалка',
    description: 'Пиксельный редактор: рисуйте по клеточкам, слои, кадры и анимацию. Черновик хранится в IndexedDB вашего браузера.',
    canonical: '/draw',
  })

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isAnimationPlaying.value = false
  }

  frames.value = [createDrawFrame(canvasWidth.value, canvasHeight.value)]
  activeFrameIndex.value = 0
  activeLayerIndex.value = 0
  void restoreDraft({ silent: true })
  requestRender()
  requestPreviewRender()
  isReady.value = true

  window.addEventListener('keydown', handleKeyboard, true)
  window.addEventListener('beforeunload', flushDraftBeforeUnload)
  document.addEventListener('visibilitychange', flushDraftOnVisibilityHidden)
  window.addEventListener('pagehide', flushDraftOnPageHide)
  window.addEventListener('wheel', preventPageZoomWheel, { passive: false })
  window.addEventListener('gesturestart', preventGestureZoom)
  window.addEventListener('gesturechange', preventGestureZoom)
  window.addEventListener('gestureend', preventGestureZoom)

  restartPreviewTimer()
  restartAnimationTimer()

  autosaveTimer = setInterval(() => {
    if (isDirty.value) {
      saveDraft()
    }
  }, 45000)
})

watch(fps, () => {
  restartPreviewTimer()
  restartAnimationTimer()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyboard, true)
  window.removeEventListener('beforeunload', flushDraftBeforeUnload)
  document.removeEventListener('visibilitychange', flushDraftOnVisibilityHidden)
  window.removeEventListener('pagehide', flushDraftOnPageHide)
  window.removeEventListener('wheel', preventPageZoomWheel)
  window.removeEventListener('gesturestart', preventGestureZoom)
  window.removeEventListener('gesturechange', preventGestureZoom)
  window.removeEventListener('gestureend', preventGestureZoom)
  if (previewTimer) {
    clearInterval(previewTimer)
  }
  if (animationTimer) {
    clearInterval(animationTimer)
  }
  if (autosaveTimer) {
    clearInterval(autosaveTimer)
  }
})

watch(
  () => [
    frames.value,
    activeFrameIndex.value,
    activeLayerIndex.value,
    showGrid.value,
    onionSkin.value,
    fps.value,
    showAnimationModal.value,
    animationFrameIndex.value,
  ],
  () => {
    requestRender()
    requestPreviewRender()
    requestAnimationPreviewRender()
  },
  { deep: true },
)

watch(
  () => zoom.value,
  () => {
    requestRender()
  },
)
</script>

<template>
  <div class="draw-view">
    <DrawEditorHeader
      :active-tool="activeTool"
      :active-tool-label="toolLabelById[activeTool]"
      :is-ready="isReady"
      :is-dirty="isDirty"
      :last-saved-label="lastSavedLabel"
      @open-in-new-tab="openInNewTab"
    />

    <nav v-if="isMobile" class="draw-view__mobile-tabs" aria-label="Панели редактора">
      <button
        type="button"
        class="draw-view__mobile-tab"
        :class="{ 'draw-view__mobile-tab--active': mobilePanelTab === 'tools' }"
        @click="mobilePanelTab = 'tools'"
      >
        Инструменты
      </button>
      <button
        type="button"
        class="draw-view__mobile-tab"
        :class="{ 'draw-view__mobile-tab--active': mobilePanelTab === 'frames' }"
        @click="mobilePanelTab = 'frames'"
      >
        Кадры
      </button>
      <button
        type="button"
        class="draw-view__mobile-tab"
        :class="{ 'draw-view__mobile-tab--active': mobilePanelTab === 'layers' }"
        @click="mobilePanelTab = 'layers'"
      >
        Слои
      </button>
    </nav>

    <section class="draw-view__grid">
      <aside
        class="draw-view__col draw-view__col--tools"
        :class="{ 'draw-view__col--hidden-mobile': isMobile && mobilePanelTab !== 'tools' }"
      >
        <DrawToolsPanel
          :primary-tool-options="primaryToolOptions"
          :secondary-tool-options="secondaryToolOptions"
          :active-tool="activeTool"
          :pen-size="penSize"
          @set-tool="setTool"
          @open-shortcuts="showShortcuts = true"
          @update:pen-size="penSize = $event"
        />
        <DrawPalettePanel
          :primary-color="primaryColor"
          :secondary-color="secondaryColor"
          @update:primary-color="setPrimaryColorHex"
          @update:secondary-color="setSecondaryColorHex"
          @swap-colors="swapColors"
          @reset-colors="resetColors"
        />
      </aside>

      <aside
        class="draw-view__col draw-view__col--frames"
        :class="{ 'draw-view__col--hidden-mobile': isMobile && mobilePanelTab !== 'frames' }"
      >
        <DrawFramesPanel
          :frames="frames"
          :active-frame-index="activeFrameIndex"
          :set-thumb-ref="setFrameThumbRef"
          @update:active-frame-index="activeFrameIndex = $event"
          @duplicate-frame-from="duplicateFrameFrom"
          @remove-frame-at="removeFrameAt"
          @add-frame="addFrame"
          @reorder-frame="reorderFrame"
        />
      </aside>

      <main class="draw-view__col draw-view__col--workspace">
        <DrawWorkspacePanel
          :show-secondary-popover="showSecondaryPopover"
          :secondary-tab="secondaryTab"
          :fps="fps"
          :resize-width="resizeWidth"
          :resize-height="resizeHeight"
          :maintain-aspect-ratio="maintainAspectRatio"
          :sprite-title="spriteTitle"
          :sprite-description="spriteDescription"
          :export-scale="exportScale"
          :scaled-export-width="scaledExportWidth"
          :scaled-export-height="scaledExportHeight"
          :zoom-percent="zoomPercent"
          :zoom="zoom"
          :canvas-screen-width="canvasWidth * zoom"
          :canvas-screen-height="canvasHeight * zoom"
          :show-grid="showGrid"
          :onion-skin="onionSkin"
          @undo="undo"
          @redo="redo"
          @clear-animation="clearAnimation"
          @toggle-secondary="toggleSecondaryPopover"
          @close-secondary="showSecondaryPopover = false"
          @open-animation-preview="openAnimationPreview"
          @zoom-out="zoomOut"
          @zoom-in="zoomIn"
          @zoom-fit="zoomToFitViewport"
          @workspace-viewport="onWorkspaceViewport"
          @toggle-grid="showGrid = !showGrid"
          @toggle-onion-skin="onionSkin = !onionSkin"
          @update:fps="fps = $event"
          @flip-horizontal="flipHorizontal"
          @flip-vertical="flipVertical"
          @rotate-right="rotateRight"
          @crop-to-selection="cropToSelection"
          @resize-width-input="onResizeWidthInput"
          @resize-height-input="onResizeHeightInput"
          @toggle-maintain-aspect-ratio="maintainAspectRatio = !maintainAspectRatio"
          @resize-canvas="resizeCanvas"
          @update:sprite-title="spriteTitle = $event"
          @update:sprite-description="spriteDescription = $event"
          @save-draft="saveDraft({ toast: true })"
          @export-project="exportProject"
          @update:export-scale="exportScale = $event"
          @export-p-n-g="exportPNG"
          @export-g-i-f="exportGIF"
          @export-z-i-p="exportZIP"
          @restore-draft="restoreDraft"
          @import-project="importProject"
          @import-image="importImage"
        >
          <canvas
            ref="canvasRef"
            class="draw-view__canvas"
            :width="canvasWidth * zoom"
            :height="canvasHeight * zoom"
            @wheel.ctrl.prevent="onCanvasWheel"
            @contextmenu.prevent
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointerleave="onPointerLeave"
          />
        </DrawWorkspacePanel>
      </main>

      <aside
        class="draw-view__col draw-view__col--layers"
        :class="{ 'draw-view__col--hidden-mobile': isMobile && mobilePanelTab !== 'layers' }"
      >
        <DrawLayersPanel
          :layers="activeFrame.layers"
          :active-layer-index="activeLayerIndex"
          :undo-stack="undoStack"
          :history-selected-index="historySelectedIndex"
          :primary-color="primaryColor"
          :secondary-color="secondaryColor"
          :project-colors="projectPaletteColors"
          @update:active-layer-index="activeLayerIndex = $event"
          @add-layer="openCreateLayerModal"
          @duplicate-layer-at="duplicateLayerAt"
          @remove-layer-at="removeLayerAt"
          @rename-layer="openRenameLayerModal"
          @toggle-layer-visibility="toggleLayerVisibility"
          @reorder-layer="reorderLayer"
          @merge-layers="mergeLayers"
          @history-jump="goToHistoryCheckpoint"
          @history-delete="deleteHistoryCheckpointFrom"
          @update:primary-color="setPrimaryColorHex"
          @update:secondary-color="setSecondaryColorHex"
        />
      </aside>
    </section>

    <DrawAnimationPreviewModal
      :visible="showAnimationModal"
      :fps="fps"
      :is-animation-playing="isAnimationPlaying"
      @close="closeAnimationPreview"
      @update:fps="fps = $event"
      @toggle-play="isAnimationPlaying = !isAnimationPlaying"
    >
      <canvas ref="animationPreviewRef" width="192" height="192" class="draw-image-pixelated draw-preview-canvas" />
    </DrawAnimationPreviewModal>

    <DrawShortcutsModal :visible="showShortcuts" :tool-options="toolOptions" @close="showShortcuts = false" />

    <DrawLayerNameModal
      :visible="layerNameModalOpen"
      :mode="layerNameModalMode"
      :initial-name="layerNameModalInitialName"
      @close="closeLayerNameModal"
      @submit="submitLayerName"
    />
  </div>
</template>

<style scoped lang="scss">
@use '@/modules/draw/styles/draw';

.draw-preview-canvas {
  width: 12rem;
  height: 12rem;
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  background: color-mix(in srgb, var(--color-surface-inverse) 90%, transparent);
}
</style>
