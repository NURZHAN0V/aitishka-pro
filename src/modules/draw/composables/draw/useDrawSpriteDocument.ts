import type { ComputedRef, Ref } from 'vue'
import type { DrawFrame, DrawLayer, DrawSelectionRect } from '@/modules/draw/types/draw-editor'
import { createDrawFrame, createDrawLayer, createEmptyPixels, newDrawEntityId } from '@/modules/draw/composables/draw/useDrawFrameFactory'
import { DRAW_HISTORY_DOCUMENT_LABEL } from '@/modules/draw/types/draw-editor'

export function useDrawSpriteDocument(options: {
  canvasWidth: Ref<number>
  canvasHeight: Ref<number>
  resizeWidth: Ref<number>
  resizeHeight: Ref<number>
  frames: Ref<DrawFrame[]>
  activeFrameIndex: Ref<number>
  activeLayerIndex: Ref<number>
  selection: Ref<DrawSelectionRect | null>
  maintainAspectRatio: Ref<boolean>
  activeFrame: ComputedRef<DrawFrame>
  activeLayer: ComputedRef<DrawLayer>
  inBounds: (x: number, y: number) => boolean
  pushHistory: (label: string) => void
  requestRender: () => void
  /** После полной очистки проекта: сброс истории, при необходимости сохранить черновик. */
  onFullDocumentReset?: () => void
}) {
  const addFrame = () => {
    options.frames.value.push(createDrawFrame(options.canvasWidth.value, options.canvasHeight.value))
    options.activeFrameIndex.value = options.frames.value.length - 1
    options.activeLayerIndex.value = 0
    options.requestRender()
    options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.newFrame)
  }

  const duplicateFrameFrom = (index: number) => {
    const frame = options.frames.value[index]
    if (!frame) {
      return
    }
    const payload = JSON.parse(JSON.stringify(frame)) as DrawFrame
    payload.id = newDrawEntityId()
    payload.layers = payload.layers.map(layer => ({ ...layer, id: newDrawEntityId() }))
    options.frames.value.splice(index + 1, 0, payload)
    options.activeFrameIndex.value = index + 1
    options.activeLayerIndex.value = 0
    options.requestRender()
    options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.duplicateFrame)
  }

  const removeFrameAt = (index: number) => {
    if (options.frames.value.length === 1) {
      return
    }
    // eslint-disable-next-line no-alert -- подтверждение удаления кадра
    if (!window.confirm('Удалить этот кадр?')) {
      return
    }
    options.frames.value.splice(index, 1)
    options.activeFrameIndex.value = Math.max(0, Math.min(options.activeFrameIndex.value, options.frames.value.length - 1))
    options.activeLayerIndex.value = 0
    options.requestRender()
    options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.deleteFrame)
  }

  const reorderFrame = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= options.frames.value.length || to >= options.frames.value.length) {
      return
    }
    const [frame] = options.frames.value.splice(from, 1)
    options.frames.value.splice(to, 0, frame!)
    if (options.activeFrameIndex.value === from) {
      options.activeFrameIndex.value = to
    }
    else if (from < options.activeFrameIndex.value && to >= options.activeFrameIndex.value) {
      options.activeFrameIndex.value -= 1
    }
    else if (from > options.activeFrameIndex.value && to <= options.activeFrameIndex.value) {
      options.activeFrameIndex.value += 1
    }
    options.requestRender()
    options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.reorderFrames)
  }

  const addLayer = (name?: string) => {
    const trimmed = name?.trim()
    const layerName = trimmed || `Слой ${options.activeFrame.value.layers.length + 1}`
    options.activeFrame.value.layers.push(
      createDrawLayer(layerName, options.canvasWidth.value, options.canvasHeight.value),
    )
    options.activeLayerIndex.value = options.activeFrame.value.layers.length - 1
    options.requestRender()
    options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.newLayer)
  }

  const duplicateLayerAt = (index: number) => {
    const source = options.activeFrame.value.layers[index]
    if (!source) {
      return
    }
    const copy: DrawLayer = {
      id: newDrawEntityId(),
      name: `${source.name} (копия)`,
      visible: source.visible,
      pixels: source.pixels.map(row => [...row]),
    }
    options.activeFrame.value.layers.splice(index + 1, 0, copy)
    options.activeLayerIndex.value = index + 1
    options.requestRender()
    options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.duplicateLayer)
  }

  const duplicateLayer = () => duplicateLayerAt(options.activeLayerIndex.value)

  const applyLayerRename = (index: number, name: string) => {
    const target = options.activeFrame.value.layers[index]
    if (!target) {
      return
    }
    const trimmed = name.trim()
    if (!trimmed || trimmed === target.name) {
      return
    }
    target.name = trimmed
    options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.renameLayer)
  }

  const removeLayerAt = (index: number) => {
    if (options.activeFrame.value.layers.length === 1) {
      return
    }
    const target = options.activeFrame.value.layers[index]
    if (!target) {
      return
    }
    // eslint-disable-next-line no-alert -- подтверждение удаления слоя
    if (!window.confirm(`Удалить слой «${target.name}»?`)) {
      return
    }
    options.activeFrame.value.layers.splice(index, 1)
    const ai = options.activeLayerIndex.value
    if (ai === index) {
      options.activeLayerIndex.value = Math.max(0, index - 1)
    }
    else if (ai > index) {
      options.activeLayerIndex.value = ai - 1
    }
    options.requestRender()
    options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.deleteLayer)
  }

  const reorderLayer = (from: number, to: number) => {
    const layers = options.activeFrame.value.layers
    const len = layers.length
    if (from === to || from < 0 || to < 0 || from >= len || to >= len) {
      return
    }
    const [layer] = layers.splice(from, 1)
    layers.splice(to, 0, layer!)
    const ai = options.activeLayerIndex.value
    if (ai === from) {
      options.activeLayerIndex.value = to
    }
    else if (from < ai && to >= ai) {
      options.activeLayerIndex.value -= 1
    }
    else if (from > ai && to <= ai) {
      options.activeLayerIndex.value += 1
    }
    options.requestRender()
    options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.reorderLayers)
  }

  const toggleLayerVisibility = (index: number) => {
    const layer = options.activeFrame.value.layers[index]
    if (!layer) {
      return
    }
    layer.visible = !layer.visible
  }

  const mergeLayers = () => {
    const merged = createDrawLayer('Merged', options.canvasWidth.value, options.canvasHeight.value)
    for (const layer of options.activeFrame.value.layers) {
      if (!layer.visible) {
        continue
      }
      for (let y = 0; y < options.canvasHeight.value; y += 1) {
        for (let x = 0; x < options.canvasWidth.value; x += 1) {
          const value = layer.pixels[y]![x]!
          if (value) {
            merged.pixels[y]![x] = value
          }
        }
      }
    }
    options.activeFrame.value.layers = [merged]
    options.activeLayerIndex.value = 0
    options.requestRender()
    options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.mergeLayers)
  }

  const clearAnimation = () => {
    // eslint-disable-next-line no-alert -- подтверждение полной очистки проекта
    if (!window.confirm(
      'Полностью очистить проект? Все кадры будут удалены, останется один пустой кадр; история действий сброшена. Отменить это через Ctrl+Z будет нельзя.',
    )) {
      return
    }
    const w = options.canvasWidth.value
    const h = options.canvasHeight.value
    options.frames.value = [createDrawFrame(w, h)]
    options.activeFrameIndex.value = 0
    options.activeLayerIndex.value = 0
    options.selection.value = null
    options.requestRender()
    options.onFullDocumentReset?.()
  }

  const rotateRight = () => {
    for (const frame of options.frames.value) {
      for (const layer of frame.layers) {
        const src = layer.pixels
        const next = createEmptyPixels(options.canvasHeight.value, options.canvasWidth.value)
        for (let y = 0; y < options.canvasHeight.value; y += 1) {
          for (let x = 0; x < options.canvasWidth.value; x += 1) {
            next[x]![options.canvasHeight.value - 1 - y] = src[y]![x]!
          }
        }
        layer.pixels = next
      }
    }
    const prevWidth = options.canvasWidth.value
    options.canvasWidth.value = options.canvasHeight.value
    options.canvasHeight.value = prevWidth
    options.resizeWidth.value = options.canvasWidth.value
    options.resizeHeight.value = options.canvasHeight.value
    options.requestRender()
    options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.rotateCanvas)
  }

  const flipHorizontal = () => {
    for (const layer of options.activeFrame.value.layers) {
      for (const row of layer.pixels) {
        row.reverse()
      }
    }
    options.requestRender()
    options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.flipHorizontal)
  }

  const flipVertical = () => {
    for (const layer of options.activeFrame.value.layers) {
      layer.pixels.reverse()
    }
    options.requestRender()
    options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.flipVertical)
  }

  const cropToSelection = () => {
    if (!options.selection.value) {
      return
    }
    const { x, y, width, height } = options.selection.value
    for (const frame of options.frames.value) {
      for (const layer of frame.layers) {
        const next = createEmptyPixels(width, height)
        for (let yy = 0; yy < height; yy += 1) {
          for (let xx = 0; xx < width; xx += 1) {
            if (options.inBounds(x + xx, y + yy)) {
              next[yy]![xx] = layer.pixels[y + yy]![x + xx]!
            }
          }
        }
        layer.pixels = next
      }
    }
    options.canvasWidth.value = width
    options.canvasHeight.value = height
    options.resizeWidth.value = width
    options.resizeHeight.value = height
    options.selection.value = null
    options.requestRender()
    options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.cropToSelection)
  }

  const clampResize = (n: number) => Math.max(8, Math.min(256, Math.round(n)))

  const onResizeWidthInput = (event: Event) => {
    const raw = Number((event.target as HTMLInputElement).value)
    if (!Number.isFinite(raw)) {
      return
    }
    const w = clampResize(raw)
    options.resizeWidth.value = w
    if (!options.maintainAspectRatio.value || options.canvasWidth.value <= 0 || options.canvasHeight.value <= 0) {
      return
    }
    const ratio = options.canvasHeight.value / options.canvasWidth.value
    options.resizeHeight.value = clampResize(w * ratio)
  }

  const onResizeHeightInput = (event: Event) => {
    const raw = Number((event.target as HTMLInputElement).value)
    if (!Number.isFinite(raw)) {
      return
    }
    const h = clampResize(raw)
    options.resizeHeight.value = h
    if (!options.maintainAspectRatio.value || options.canvasWidth.value <= 0 || options.canvasHeight.value <= 0) {
      return
    }
    const ratio = options.canvasWidth.value / options.canvasHeight.value
    options.resizeWidth.value = clampResize(h * ratio)
  }

  const resizeCanvas = () => {
    const targetW = Math.max(8, Math.min(256, options.resizeWidth.value))
    const targetH = Math.max(8, Math.min(256, options.resizeHeight.value))
    for (const frame of options.frames.value) {
      for (const layer of frame.layers) {
        const next = createEmptyPixels(targetW, targetH)
        for (let y = 0; y < Math.min(options.canvasHeight.value, targetH); y += 1) {
          for (let x = 0; x < Math.min(options.canvasWidth.value, targetW); x += 1) {
            next[y]![x] = layer.pixels[y]![x]!
          }
        }
        layer.pixels = next
      }
    }
    options.canvasWidth.value = targetW
    options.canvasHeight.value = targetH
    options.requestRender()
    options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.resizeCanvas)
  }

  return {
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
  }
}
