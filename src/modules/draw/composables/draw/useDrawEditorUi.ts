import type { Ref } from 'vue'
import type { DrawTool, SecondaryTab } from '@/modules/draw/types/draw-editor'
import { computed, nextTick } from 'vue'

/** Отступ внутри серой области (согласовано с zoomToFit). */
export const WORKSPACE_ZOOM_INSET = 20

/** Максимальный целочисленный zoom, чтобы весь холст помещался по ширине и высоте. */
export function computeWorkspaceFitZoom(
  viewport: { width: number, height: number },
  canvasWidth: number,
  canvasHeight: number,
): number {
  const inset = WORKSPACE_ZOOM_INSET
  const vw = Math.max(48, viewport.width - inset)
  const vh = Math.max(48, viewport.height - inset)
  const cw = Math.max(1, canvasWidth)
  const ch = Math.max(1, canvasHeight)
  const fit = Math.min(Math.floor(vw / cw), Math.floor(vh / ch))
  return Math.max(1, Math.min(32, fit || 1))
}

export function useDrawEditorUi(options: {
  activeTool: Ref<DrawTool>
  zoom: Ref<number>
  canvasWidth: Ref<number>
  canvasHeight: Ref<number>
  secondaryTab: Ref<SecondaryTab>
  showSecondaryPopover: Ref<boolean>
  showAnimationModal: Ref<boolean>
  isAnimationPlaying: Ref<boolean>
  animationFrameIndex: Ref<number>
  primaryColor: Ref<string>
  secondaryColor: Ref<string>
  /** Внутренний размер области прокрутки вокруг холста (content box), см. ResizeObserver в WorkspacePanel. */
  workspaceViewport: Ref<{ width: number, height: number }>
  requestAnimationPreviewRender: () => void
}) {
  const fitZoom = computed(() =>
    computeWorkspaceFitZoom(
      options.workspaceViewport.value,
      options.canvasWidth.value,
      options.canvasHeight.value,
    ),
  )

  const setTool = (tool: DrawTool) => {
    options.activeTool.value = tool
  }

  const onCanvasWheel = (event: WheelEvent) => {
    const step = event.deltaY < 0 ? 2 : -2
    const f = fitZoom.value
    options.zoom.value = Math.max(f, Math.min(32, options.zoom.value + step))
  }

  const zoomOut = () => {
    const f = fitZoom.value
    options.zoom.value = Math.max(f, options.zoom.value - 4)
  }

  const zoomIn = () => {
    options.zoom.value = Math.min(32, options.zoom.value + 4)
  }

  /** 100% — весь холст в области просмотра без прокрутки. */
  const zoomToFitViewport = () => {
    options.zoom.value = fitZoom.value
  }

  const toggleSecondaryPopover = (tab: SecondaryTab) => {
    if (options.secondaryTab.value === tab) {
      options.showSecondaryPopover.value = !options.showSecondaryPopover.value
      return
    }
    options.secondaryTab.value = tab
    options.showSecondaryPopover.value = true
  }

  const openAnimationPreview = async () => {
    options.showAnimationModal.value = true
    options.isAnimationPlaying.value = true
    options.animationFrameIndex.value = 0
    await nextTick()
    options.requestAnimationPreviewRender()
  }

  const closeAnimationPreview = () => {
    options.showAnimationModal.value = false
  }

  const swapColors = () => {
    const current = options.primaryColor.value
    options.primaryColor.value = options.secondaryColor.value
    options.secondaryColor.value = current
  }

  const resetColors = () => {
    options.primaryColor.value = '#000000'
    options.secondaryColor.value = '#ffffff'
  }

  const openInNewTab = () => {
    window.open('/draw', '_blank', 'noopener')
  }

  return {
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
  }
}
