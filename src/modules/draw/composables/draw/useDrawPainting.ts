import type { ComputedRef, Ref } from 'vue'
import type { DrawFrame, DrawLayer, DrawPoint, DrawSelectionRect, DrawTool } from '@/modules/draw/types/draw-editor'
import { useDrawColorHelpers } from '@/modules/draw/composables/draw/useDrawColorHelpers'
import { createEmptyPixels } from '@/modules/draw/composables/draw/useDrawFrameFactory'
import { toolLabelById } from '@/modules/draw/types/draw-editor'

export function useDrawPainting(options: {
  canvasRef: Ref<HTMLCanvasElement | null>
  canvasWidth: Ref<number>
  canvasHeight: Ref<number>
  activeTool: Ref<DrawTool>
  primaryColor: Ref<string>
  secondaryColor: Ref<string>
  penSize: Ref<number>
  activeFrame: ComputedRef<DrawFrame>
  activeLayer: ComputedRef<DrawLayer>
  selection: Ref<DrawSelectionRect | null>
  mouseDown: Ref<boolean>
  isPanning: Ref<boolean>
  hoverPoint: Ref<DrawPoint | null>
  pointerStart: Ref<DrawPoint | null>
  lassoPath: Ref<DrawPoint[]>
  moveOffset: Ref<DrawPoint>
  panStartClient: Ref<DrawPoint | null>
  panStartScroll: Ref<DrawPoint | null>
  panContainer: Ref<HTMLElement | null>
  getCanvasCoords: (event: Pick<MouseEvent, 'clientX' | 'clientY'>) => DrawPoint
  pushHistory: (label: string) => void
  requestRender: () => void
}) {
  const { lightenHex } = useDrawColorHelpers()

  /** Захват указателя при рисовании линии/фигуры — движения идут на canvas даже вне его. */
  let shapePointerCaptureId: number | null = null

  /** Кнопка, с которой начали штрих (ПКМ — цвет из вторичного слота, как в палитре). */
  let strokeUsesSecondary = false

  /** Последняя закрашенная клетка сетки при активном штрихе — для интерполяции при быстром движении. */
  let lastStrokeGridPoint: DrawPoint | null = null

  let strokeRenderRaf = 0

  const scheduleStrokeRender = () => {
    if (strokeRenderRaf !== 0) {
      return
    }
    strokeRenderRaf = requestAnimationFrame(() => {
      strokeRenderRaf = 0
      options.requestRender()
    })
  }

  /** Промежуточные события указателя (Chrome и др.) — не терять клетки между move. */
  const pointerMoveChain = (event: PointerEvent): Pick<MouseEvent, 'clientX' | 'clientY'>[] => {
    if (typeof event.getCoalescedEvents === 'function') {
      const c = event.getCoalescedEvents()
      if (c.length > 0) {
        return c
      }
    }
    return [event]
  }

  const clearShapePointerCapture = () => {
    const el = options.canvasRef.value
    if (el != null && shapePointerCaptureId != null) {
      try {
        el.releasePointerCapture(shapePointerCaptureId)
      }
      catch {
        /* не захвачен */
      }
    }
    shapePointerCaptureId = null
  }

  const inBounds = (x: number, y: number): boolean =>
    x >= 0 && y >= 0 && x < options.canvasWidth.value && y < options.canvasHeight.value

  const setPixel = (x: number, y: number, color: string) => {
    if (!inBounds(x, y)) {
      return
    }
    options.activeLayer.value.pixels[y]![x] = color
  }

  const getTopPixel = (x: number, y: number): string => {
    for (let i = options.activeFrame.value.layers.length - 1; i >= 0; i -= 1) {
      const layer = options.activeFrame.value.layers[i]!
      if (!layer.visible) {
        continue
      }
      const value = layer.pixels[y]![x]!
      if (value) {
        return value
      }
    }
    return ''
  }

  const drawBrush = (point: DrawPoint, color: string) => {
    const half = Math.floor(options.penSize.value / 2)
    for (let y = point.y - half; y <= point.y + half; y += 1) {
      for (let x = point.x - half; x <= point.x + half; x += 1) {
        setPixel(x, y, color)
      }
    }
  }

  const drawLine = (a: DrawPoint, b: DrawPoint, color: string) => {
    let x0 = a.x
    let y0 = a.y
    const x1 = b.x
    const y1 = b.y
    const dx = Math.abs(x1 - x0)
    const sx = x0 < x1 ? 1 : -1
    const dy = -Math.abs(y1 - y0)
    const sy = y0 < y1 ? 1 : -1
    let error = dx + dy
    while (true) {
      drawBrush({ x: x0, y: y0 }, color)
      if (x0 === x1 && y0 === y1) {
        break
      }
      const e2 = 2 * error
      if (e2 >= dy) {
        error += dy
        x0 += sx
      }
      if (e2 <= dx) {
        error += dx
        y0 += sy
      }
    }
  }

  /** Штрих с горизонтальным зеркалом (как mirror-pencil между двумя клетками). */
  const drawMirroredStrokeLine = (a: DrawPoint, b: DrawPoint, color: string) => {
    const w = options.canvasWidth.value
    let x0 = a.x
    let y0 = a.y
    const x1 = b.x
    const y1 = b.y
    const dx = Math.abs(x1 - x0)
    const sx = x0 < x1 ? 1 : -1
    const dy = -Math.abs(y1 - y0)
    const sy = y0 < y1 ? 1 : -1
    let error = dx + dy
    while (true) {
      drawBrush({ x: x0, y: y0 }, color)
      drawBrush({ x: w - 1 - x0, y: y0 }, color)
      if (x0 === x1 && y0 === y1) {
        break
      }
      const e2 = 2 * error
      if (e2 >= dy) {
        error += dy
        x0 += sx
      }
      if (e2 <= dx) {
        error += dx
        y0 += sy
      }
    }
  }

  const floodFill = (start: DrawPoint, target: string, replacement: string) => {
    if (target === replacement) {
      return
    }
    const stack: DrawPoint[] = [start]
    while (stack.length) {
      const point = stack.pop()!
      if (!inBounds(point.x, point.y)) {
        continue
      }
      if (options.activeLayer.value.pixels[point.y]![point.x] !== target) {
        continue
      }
      options.activeLayer.value.pixels[point.y]![point.x] = replacement
      stack.push({ x: point.x + 1, y: point.y })
      stack.push({ x: point.x - 1, y: point.y })
      stack.push({ x: point.x, y: point.y + 1 })
      stack.push({ x: point.x, y: point.y - 1 })
    }
  }

  const onPointerDown = (event: PointerEvent) => {
    if (event.button === 2) {
      event.preventDefault()
    }

    if (event.button === 1) {
      event.preventDefault()
      const container = options.canvasRef.value?.closest('.draw-scrollbar') as HTMLElement | null
      if (!container) {
        return
      }
      options.isPanning.value = true
      options.panContainer.value = container
      options.panStartClient.value = { x: event.clientX, y: event.clientY }
      options.panStartScroll.value = { x: container.scrollLeft, y: container.scrollTop }
      return
    }

    const tool = options.activeTool.value
    if (event.button === 2) {
      const ignoreRight: DrawTool[] = ['move', 'rect-select', 'shape-select', 'lasso', 'lighten', 'dither']
      if (ignoreRight.includes(tool)) {
        return
      }
    }

    if (event.button !== 0 && event.button !== 2) {
      return
    }

    strokeUsesSecondary = event.button === 2 && tool !== 'eraser'

    options.mouseDown.value = true
    const point = options.getCanvasCoords(event)
    options.hoverPoint.value = point
    options.pointerStart.value = point
    options.lassoPath.value = [point]

    if (tool === 'fill') {
      const target = options.activeLayer.value.pixels[point.y]![point.x]!
      const replacement = strokeUsesSecondary ? options.secondaryColor.value : options.primaryColor.value
      floodFill(point, target, replacement)
      options.mouseDown.value = false
      strokeUsesSecondary = false
      options.requestRender()
      options.pushHistory(toolLabelById.fill)
      return
    }
    if (tool === 'replace-color') {
      const target = getTopPixel(point.x, point.y)
      const replacement = strokeUsesSecondary ? options.secondaryColor.value : options.primaryColor.value
      for (const row of options.activeLayer.value.pixels) {
        for (let i = 0; i < row.length; i += 1) {
          if (row[i] === target) {
            row[i] = replacement
          }
        }
      }
      options.mouseDown.value = false
      strokeUsesSecondary = false
      options.requestRender()
      options.pushHistory(toolLabelById['replace-color'])
      return
    }
    if (tool === 'eyedropper') {
      const sampled = getTopPixel(point.x, point.y)
      if (sampled) {
        if (strokeUsesSecondary || event.shiftKey) {
          options.secondaryColor.value = sampled
        }
        else {
          options.primaryColor.value = sampled
        }
      }
      options.mouseDown.value = false
      strokeUsesSecondary = false
      options.requestRender()
      return
    }
    if (tool === 'pencil' || tool === 'eraser') {
      lastStrokeGridPoint = point
      drawBrush(point, tool === 'eraser' ? '' : strokeUsesSecondary ? options.secondaryColor.value : options.primaryColor.value)
      options.requestRender()
      return
    }
    if (tool === 'mirror-pencil') {
      lastStrokeGridPoint = point
      const c = strokeUsesSecondary ? options.secondaryColor.value : options.primaryColor.value
      drawBrush(point, c)
      drawBrush({ x: options.canvasWidth.value - 1 - point.x, y: point.y }, c)
      options.requestRender()
      return
    }
    if (tool === 'dither') {
      if ((point.x + point.y) % 2 === 0) {
        drawBrush(point, options.primaryColor.value)
      }
      options.mouseDown.value = false
      strokeUsesSecondary = false
      options.requestRender()
      options.pushHistory(toolLabelById.dither)
      return
    }
    if (tool === 'lighten') {
      const base = options.activeLayer.value.pixels[point.y]![point.x]!
      if (base) {
        drawBrush(point, lightenHex(base))
      }
      options.mouseDown.value = false
      strokeUsesSecondary = false
      options.requestRender()
      options.pushHistory(toolLabelById.lighten)
      return
    }

    if (tool === 'line' || tool === 'rectangle' || tool === 'circle') {
      if ((event.button === 0 || event.button === 2) && options.canvasRef.value && Number.isFinite(event.pointerId)) {
        try {
          options.canvasRef.value.setPointerCapture(event.pointerId)
          shapePointerCaptureId = event.pointerId
        }
        catch {
          shapePointerCaptureId = null
        }
      }
      options.requestRender()
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    if (
      options.isPanning.value
      && options.panContainer.value
      && options.panStartClient.value
      && options.panStartScroll.value
    ) {
      event.preventDefault()
      const dx = event.clientX - options.panStartClient.value.x
      const dy = event.clientY - options.panStartClient.value.y
      options.panContainer.value.scrollLeft = options.panStartScroll.value.x - dx
      options.panContainer.value.scrollTop = options.panStartScroll.value.y - dy
      return
    }

    const point = options.getCanvasCoords(event)
    options.hoverPoint.value = point
    if (!options.mouseDown.value) {
      options.requestRender()
      return
    }
    if (options.activeTool.value === 'pencil' || options.activeTool.value === 'eraser') {
      const c
        = options.activeTool.value === 'eraser'
          ? ''
          : strokeUsesSecondary
            ? options.secondaryColor.value
            : options.primaryColor.value
      let prev = lastStrokeGridPoint
      for (const ev of pointerMoveChain(event)) {
        const pt = options.getCanvasCoords(ev)
        if (prev === null) {
          drawBrush(pt, c)
          prev = pt
        }
        else if (pt.x !== prev.x || pt.y !== prev.y) {
          drawLine(prev, pt, c)
          prev = pt
        }
      }
      lastStrokeGridPoint = prev
      scheduleStrokeRender()
    }
    else if (options.activeTool.value === 'mirror-pencil') {
      const c = strokeUsesSecondary ? options.secondaryColor.value : options.primaryColor.value
      let prev = lastStrokeGridPoint
      for (const ev of pointerMoveChain(event)) {
        const pt = options.getCanvasCoords(ev)
        if (prev === null) {
          drawBrush(pt, c)
          drawBrush({ x: options.canvasWidth.value - 1 - pt.x, y: pt.y }, c)
          prev = pt
        }
        else if (pt.x !== prev.x || pt.y !== prev.y) {
          drawMirroredStrokeLine(prev, pt, c)
          prev = pt
        }
      }
      lastStrokeGridPoint = prev
      scheduleStrokeRender()
    }
    else if (options.activeTool.value === 'dither') {
      if ((point.x + point.y) % 2 === 0) {
        drawBrush(point, options.primaryColor.value)
      }
    }
    else if (options.activeTool.value === 'lighten') {
      const base = options.activeLayer.value.pixels[point.y]![point.x]!
      if (base) {
        drawBrush(point, lightenHex(base))
      }
    }
    else if (options.activeTool.value === 'move' && options.pointerStart.value) {
      options.moveOffset.value = {
        x: point.x - options.pointerStart.value.x,
        y: point.y - options.pointerStart.value.y,
      }
    }
    else if (
      (options.activeTool.value === 'rect-select' || options.activeTool.value === 'shape-select')
      && options.pointerStart.value
    ) {
      const minX = Math.min(options.pointerStart.value.x, point.x)
      const minY = Math.min(options.pointerStart.value.y, point.y)
      options.selection.value = {
        x: minX,
        y: minY,
        width: Math.abs(point.x - options.pointerStart.value.x) + 1,
        height: Math.abs(point.y - options.pointerStart.value.y) + 1,
      }
    }
    else if (options.activeTool.value === 'lasso') {
      options.lassoPath.value.push(point)
      const xs = options.lassoPath.value.map(item => item.x)
      const ys = options.lassoPath.value.map(item => item.y)
      options.selection.value = {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs) + 1,
        height: Math.max(...ys) - Math.min(...ys) + 1,
      }
    }
    if (
      !(options.mouseDown.value && (options.activeTool.value === 'pencil' || options.activeTool.value === 'eraser' || options.activeTool.value === 'mirror-pencil'))
    ) {
      options.requestRender()
    }
  }

  const onPointerUp = (event: PointerEvent) => {
    if (options.isPanning.value) {
      options.isPanning.value = false
      options.panContainer.value = null
      options.panStartClient.value = null
      options.panStartScroll.value = null
      return
    }

    if (!options.mouseDown.value) {
      return
    }
    const toolAtUp = options.activeTool.value
    const pointerStartWas = options.pointerStart.value
    const point = options.getCanvasCoords(event)
    options.mouseDown.value = false
    clearShapePointerCapture()
    options.hoverPoint.value = point

    const strokeColor = strokeUsesSecondary ? options.secondaryColor.value : options.primaryColor.value
    let didMoveLayer = false

    if (options.pointerStart.value && options.activeTool.value === 'line') {
      drawLine(options.pointerStart.value, point, strokeColor)
    }
    else if (options.pointerStart.value && options.activeTool.value === 'rectangle') {
      const ps = options.pointerStart.value
      const minX = Math.min(ps.x, point.x)
      const maxX = Math.max(ps.x, point.x)
      const minY = Math.min(ps.y, point.y)
      const maxY = Math.max(ps.y, point.y)
      for (let x = minX; x <= maxX; x += 1) {
        setPixel(x, minY, strokeColor)
        setPixel(x, maxY, strokeColor)
      }
      for (let y = minY; y <= maxY; y += 1) {
        setPixel(minX, y, strokeColor)
        setPixel(maxX, y, strokeColor)
      }
    }
    else if (options.pointerStart.value && options.activeTool.value === 'circle') {
      const ps = options.pointerStart.value
      const rx = Math.max(1, Math.abs(point.x - ps.x))
      const ry = Math.max(1, Math.abs(point.y - ps.y))
      const cx = Math.min(ps.x, point.x) + Math.floor(rx / 2)
      const cy = Math.min(ps.y, point.y) + Math.floor(ry / 2)
      for (let a = 0; a < 360; a += 1) {
        const rad = (a * Math.PI) / 180
        const x = Math.round(cx + (rx / 2) * Math.cos(rad))
        const y = Math.round(cy + (ry / 2) * Math.sin(rad))
        setPixel(x, y, strokeColor)
      }
    }
    else if (options.activeTool.value === 'move' && (options.moveOffset.value.x !== 0 || options.moveOffset.value.y !== 0)) {
      const next = createEmptyPixels(options.canvasWidth.value, options.canvasHeight.value)
      for (let y = 0; y < options.canvasHeight.value; y += 1) {
        for (let x = 0; x < options.canvasWidth.value; x += 1) {
          const value = options.activeLayer.value.pixels[y]![x]!
          if (!value) {
            continue
          }
          const nx = x + options.moveOffset.value.x
          const ny = y + options.moveOffset.value.y
          if (inBounds(nx, ny)) {
            next[ny]![nx] = value
          }
        }
      }
      options.activeLayer.value.pixels = next
      options.moveOffset.value = { x: 0, y: 0 }
      didMoveLayer = true
    }

    if (toolAtUp === 'pencil' || toolAtUp === 'eraser' || toolAtUp === 'mirror-pencil') {
      lastStrokeGridPoint = null
      if (strokeRenderRaf !== 0) {
        cancelAnimationFrame(strokeRenderRaf)
        strokeRenderRaf = 0
      }
      options.pushHistory(toolLabelById[toolAtUp])
    }
    else if (
      (toolAtUp === 'line' || toolAtUp === 'rectangle' || toolAtUp === 'circle')
      && pointerStartWas
    ) {
      options.pushHistory(toolLabelById[toolAtUp])
    }
    else if (toolAtUp === 'move' && didMoveLayer) {
      options.pushHistory(toolLabelById.move)
    }
    else if (toolAtUp === 'rect-select' || toolAtUp === 'shape-select' || toolAtUp === 'lasso') {
      options.pushHistory(toolLabelById[toolAtUp])
    }

    options.pointerStart.value = null
    strokeUsesSecondary = false
    lastStrokeGridPoint = null
    if (strokeRenderRaf !== 0) {
      cancelAnimationFrame(strokeRenderRaf)
      strokeRenderRaf = 0
    }
    options.requestRender()
  }

  const onPointerLeave = () => {
    if (options.isPanning.value) {
      return
    }
    if (shapePointerCaptureId != null) {
      return
    }
    options.mouseDown.value = false
    strokeUsesSecondary = false
    options.pointerStart.value = null
    options.hoverPoint.value = null
    lastStrokeGridPoint = null
    if (strokeRenderRaf !== 0) {
      cancelAnimationFrame(strokeRenderRaf)
      strokeRenderRaf = 0
    }
    options.requestRender()
  }

  return {
    inBounds,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
  }
}
