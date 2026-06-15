import type { ComputedRef, Ref } from 'vue'
import type { DrawFrame, DrawPoint, DrawSelectionRect, DrawTool } from '@/modules/draw/types/draw-editor'
import { useDrawColorHelpers } from '@/modules/draw/composables/draw/useDrawColorHelpers'

export function useDrawCanvasRendering(options: {
  canvasRef: Ref<HTMLCanvasElement | null>
  animationPreviewRef: Ref<HTMLCanvasElement | null>
  frameThumbRefs: Ref<Record<string, HTMLCanvasElement | null>>
  canvasWidth: Ref<number>
  canvasHeight: Ref<number>
  zoom: Ref<number>
  frames: Ref<DrawFrame[]>
  activeFrameIndex: Ref<number>
  activeLayerIndex: Ref<number>
  activeFrame: ComputedRef<DrawFrame>
  onionSkin: Ref<boolean>
  showGrid: Ref<boolean>
  selection: Ref<DrawSelectionRect | null>
  hoverPoint: Ref<DrawPoint | null>
  penSize: Ref<number>
  animationFrameIndex: Ref<number>
  mouseDown: Ref<boolean>
  pointerStart: Ref<DrawPoint | null>
  activeTool: Ref<DrawTool>
  primaryColor: Ref<string>
}) {
  const { hexToRgb } = useDrawColorHelpers()

  const rgbaFromHex = (hex: string, alpha: number) => {
    const [r, g, b] = hexToRgb(hex || '#ffffff')
    return `rgba(${r},${g},${b},${alpha})`
  }

  /** Светлая «прозрачность» как в редакторах вроде Piskel. */
  const drawCheckerboardBackground = (
    ctx: CanvasRenderingContext2D,
    cellPxW: number,
    cellPxH: number,
    scale: number,
  ) => {
    const light = '#ececf1'
    const dark = '#dddfe8'
    for (let y = 0; y < cellPxH; y += 1) {
      for (let x = 0; x < cellPxW; x += 1) {
        ctx.fillStyle = (x + y) % 2 === 0 ? light : dark
        ctx.fillRect(x * scale, y * scale, scale, scale)
      }
    }
  }

  /** Диапазон слоёв `[from, to)` текущего кадра. */
  const renderFrameLayersSlice = (
    frame: DrawFrame,
    ctx: CanvasRenderingContext2D,
    scale: number,
    fromLayer: number,
    toLayerExclusive: number,
    alpha: number,
  ) => {
    const layers = frame.layers
    const end = Math.min(toLayerExclusive, layers.length)
    for (let li = Math.max(0, fromLayer); li < end; li += 1) {
      const layer = layers[li]!
      if (!layer.visible) {
        continue
      }
      for (let y = 0; y < options.canvasHeight.value; y += 1) {
        for (let x = 0; x < options.canvasWidth.value; x += 1) {
          const color = layer.pixels[y]![x]!
          if (!color) {
            continue
          }
          ctx.globalAlpha = alpha
          ctx.fillStyle = color
          ctx.fillRect(x * scale, y * scale, scale, scale)
        }
      }
    }
    ctx.globalAlpha = 1
  }

  const renderFrameToContext = (frame: DrawFrame, ctx: CanvasRenderingContext2D, scale: number, alpha = 1) => {
    renderFrameLayersSlice(frame, ctx, scale, 0, frame.layers.length, alpha)
  }

  const requestRender = () => {
    const canvas = options.canvasRef.value
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const z = options.zoom.value
    const cw = options.canvasWidth.value
    const ch = options.canvasHeight.value
    drawCheckerboardBackground(ctx, cw, ch, z)

    if (options.onionSkin.value && options.activeFrameIndex.value > 0) {
      const prev = options.frames.value[options.activeFrameIndex.value - 1]!
      renderFrameToContext(prev, ctx, z, 0.28)
    }

    const frame = options.activeFrame.value
    const activeLi = Math.min(Math.max(0, options.activeLayerIndex.value), Math.max(0, frame.layers.length - 1))
    /** Нижележащие слои под активным — как справочный набросок (новый пустой слой поверх). */
    const layerGhostAlpha = 0.34
    if (frame.layers.length > 0 && activeLi > 0) {
      renderFrameLayersSlice(frame, ctx, z, 0, activeLi, layerGhostAlpha)
    }
    if (frame.layers.length > 0) {
      renderFrameLayersSlice(frame, ctx, z, activeLi, frame.layers.length, 1)
    }

    if (options.showGrid.value) {
      /**
       * Светлый фон: линии сетки приглушённые тёмно-серыми.
       */
      const minorAlpha = z <= 2 ? 0.38 : z <= 4 ? 0.32 : 0.24
      const majorAlpha = z <= 2 ? 0.56 : z <= 4 ? 0.48 : 0.38
      ctx.lineWidth = 1
      for (let x = 0; x <= options.canvasWidth.value; x += 1) {
        const isMajorLine = x % 8 === 0
        ctx.strokeStyle = isMajorLine
          ? `rgba(71, 85, 105, ${majorAlpha})`
          : `rgba(100, 116, 139, ${minorAlpha})`
        ctx.beginPath()
        ctx.moveTo(x * z + 0.5, 0)
        ctx.lineTo(x * z + 0.5, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y <= options.canvasHeight.value; y += 1) {
        const isMajorLine = y % 8 === 0
        ctx.strokeStyle = isMajorLine
          ? `rgba(71, 85, 105, ${majorAlpha})`
          : `rgba(100, 116, 139, ${minorAlpha})`
        ctx.beginPath()
        ctx.moveTo(0, y * z + 0.5)
        ctx.lineTo(canvas.width, y * z + 0.5)
        ctx.stroke()
      }
    }

    if (options.selection.value) {
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.95)'
      ctx.setLineDash([4, 2])
      ctx.strokeRect(
        options.selection.value.x * options.zoom.value,
        options.selection.value.y * options.zoom.value,
        options.selection.value.width * options.zoom.value,
        options.selection.value.height * options.zoom.value,
      )
      ctx.setLineDash([])
    }

    const tool = options.activeTool.value
    const start = options.pointerStart.value
    const end = options.hoverPoint.value
    const showShapePreview
      = options.mouseDown.value
        && start
        && end
        && (tool === 'line' || tool === 'rectangle' || tool === 'circle')

    if (showShapePreview) {
      const stroke = rgbaFromHex(options.primaryColor.value, 0.92)
      const outline = 'rgba(15, 23, 42, 0.55)'
      ctx.save()
      ctx.setLineDash([])
      ctx.lineJoin = 'miter'
      ctx.lineCap = 'square'

      if (tool === 'line') {
        const lw = Math.max(1, options.penSize.value * z)
        ctx.strokeStyle = stroke
        if (start.x === end.x && start.y === end.y) {
          /* Нулевая длина: stroke не рисуется — показываем «якорь» как квадрат кисти. */
          const cx = (start.x + 0.5) * z
          const cy = (start.y + 0.5) * z
          ctx.fillStyle = stroke
          ctx.fillRect(cx - lw / 2, cy - lw / 2, lw, lw)
        }
        else {
          ctx.lineWidth = lw
          ctx.beginPath()
          ctx.moveTo((start.x + 0.5) * z, (start.y + 0.5) * z)
          ctx.lineTo((end.x + 0.5) * z, (end.y + 0.5) * z)
          ctx.stroke()
        }
      }
      else if (tool === 'rectangle') {
        const minX = Math.min(start.x, end.x)
        const maxX = Math.max(start.x, end.x)
        const minY = Math.min(start.y, end.y)
        const maxY = Math.max(start.y, end.y)
        const pxW = maxX - minX + 1
        const pxH = maxY - minY + 1
        const x = minX * z + 0.5
        const y = minY * z + 0.5
        const w = pxW * z - 1
        const h = pxH * z - 1
        ctx.lineWidth = 3
        ctx.strokeStyle = outline
        ctx.strokeRect(x, y, w, h)
        ctx.lineWidth = 1
        ctx.strokeStyle = stroke
        ctx.strokeRect(x, y, w, h)
      }
      else if (tool === 'circle') {
        const rx = Math.max(1, Math.abs(end.x - start.x))
        const ry = Math.max(1, Math.abs(end.y - start.y))
        const cx = Math.min(start.x, end.x) + Math.floor(rx / 2)
        const cy = Math.min(start.y, end.y) + Math.floor(ry / 2)
        const rxPx = (rx / 2) * z
        const ryPx = (ry / 2) * z
        const cxPx = (cx + 0.5) * z
        const cyPx = (cy + 0.5) * z
        ctx.lineWidth = 3
        ctx.strokeStyle = outline
        ctx.beginPath()
        ctx.ellipse(cxPx, cyPx, rxPx, ryPx, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.lineWidth = 1
        ctx.strokeStyle = stroke
        ctx.beginPath()
        ctx.ellipse(cxPx, cyPx, rxPx, ryPx, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()
    }

    if (options.hoverPoint.value) {
      const half = Math.floor(options.penSize.value / 2)
      const startX = (options.hoverPoint.value.x - half) * options.zoom.value + 0.5
      const startY = (options.hoverPoint.value.y - half) * options.zoom.value + 0.5
      const size = options.penSize.value * options.zoom.value
      ctx.setLineDash([])
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.strokeRect(startX, startY, size, size)
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)'
      ctx.strokeRect(startX + 1, startY + 1, Math.max(0, size - 2), Math.max(0, size - 2))
    }
  }

  const renderFrameThumbnail = (frame: DrawFrame, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const cw = options.canvasWidth.value
    const ch = options.canvasHeight.value
    if (cw <= 0 || ch <= 0) {
      return
    }
    /** Дробный масштаб: при большом холсте `floor` давал 0 и миниатюры оставались пустыми. */
    const scale = Math.min(canvas.width / cw, canvas.height / ch)
    if (!(scale > 0) || !Number.isFinite(scale)) {
      return
    }
    ctx.imageSmoothingEnabled = false
    renderFrameToContext(frame, ctx, scale)
  }

  const requestFrameThumbnails = () => {
    for (const frame of options.frames.value) {
      const canvas = options.frameThumbRefs.value[frame.id]
      if (!canvas) {
        continue
      }
      renderFrameThumbnail(frame, canvas)
    }
  }

  const requestPreviewRender = () => {
    requestFrameThumbnails()
  }

  const setFrameThumbRef = (frameId: string, canvas: HTMLCanvasElement | null) => {
    options.frameThumbRefs.value[frameId] = canvas
  }

  const requestAnimationPreviewRender = () => {
    const canvas = options.animationPreviewRef.value
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    const frame = options.frames.value[options.animationFrameIndex.value]
    if (!frame) {
      return
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const cw = options.canvasWidth.value
    const ch = options.canvasHeight.value
    if (cw <= 0 || ch <= 0) {
      return
    }
    const scale = Math.min(canvas.width / cw, canvas.height / ch)
    if (!(scale > 0) || !Number.isFinite(scale)) {
      return
    }
    ctx.imageSmoothingEnabled = false
    renderFrameToContext(frame, ctx, scale)
  }

  return {
    renderFrameToContext,
    requestRender,
    requestPreviewRender,
    setFrameThumbRef,
    requestFrameThumbnails,
    requestAnimationPreviewRender,
  }
}
