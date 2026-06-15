import type { ComputedRef, Ref } from 'vue'
import type { DrawDraftPayload, DrawFrame, DrawLayer } from '@/modules/draw/types/draw-editor'
import { applyPalette, GIFEncoder, quantize } from 'gifenc'
import { triggerBlobDownload, triggerDataUrlDownload } from '@/modules/draw/composables/draw/useDrawBlobDownload'
import { useDrawColorHelpers } from '@/modules/draw/composables/draw/useDrawColorHelpers'
import { createZipBlobSync } from '@/modules/draw/composables/draw/useDrawZipBlob'
import { useDrawNotify } from '@/modules/draw/composables/useDrawNotify'
import { DRAW_HISTORY_DOCUMENT_LABEL } from '@/modules/draw/types/draw-editor'

type GifEncoderInstance = ReturnType<typeof GIFEncoder>

function pngBytesFromCanvasSync(canvas: HTMLCanvasElement): Uint8Array {
  const dataUrl = canvas.toDataURL('image/png')
  const comma = dataUrl.indexOf(',')
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : ''
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) {
    out[i] = bin.charCodeAt(i) & 0xFF
  }
  return out
}

function clampExportScale(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) {
    return 1
  }
  return Math.min(32, Math.max(0.0625, raw))
}

function writeGifFrameFromCanvas(
  gif: GifEncoderInstance,
  canvas: HTMLCanvasElement,
  delayMs: number,
  frameIndex: number,
): void {
  const w = canvas.width
  const h = canvas.height
  if (w < 1 || h < 1) {
    throw new Error('Размер кадра для GIF меньше 1 px')
  }
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    throw new Error('Не удалось получить 2D-контекст для чтения пикселей')
  }
  let imageData: ImageData
  try {
    imageData = ctx.getImageData(0, 0, w, h)
  }
  catch {
    throw new Error('Не удалось прочитать пиксели кадра (getImageData)')
  }
  const rgba = imageData.data
  let palette: ReturnType<typeof quantize>
  let index: Uint8Array
  let transparent = false
  let transparentIndex = 0
  try {
    palette = quantize(rgba, 256, {
      format: 'rgba4444',
      clearAlpha: false,
      oneBitAlpha: true,
    })
    index = applyPalette(rgba, palette, 'rgba4444')
    const ti = palette.findIndex((c: number[]) => c.length >= 4 && c[3] === 0)
    transparent = ti >= 0
    transparentIndex = transparent ? ti : 0
  }
  catch {
    palette = quantize(rgba, 256, { format: 'rgb565' })
    index = applyPalette(rgba, palette, 'rgb565')
    transparent = false
    transparentIndex = 0
  }
  if (!palette.length) {
    throw new Error('Пустая палитра после квантования')
  }
  gif.writeFrame(index, w, h, {
    palette,
    delay: delayMs,
    ...(frameIndex === 0 ? { repeat: 0 } : {}),
    transparent,
    transparentIndex,
  })
}

export function useDrawExport(options: {
  canvasWidth: Ref<number>
  canvasHeight: Ref<number>
  resizeWidth: Ref<number>
  resizeHeight: Ref<number>
  exportScale: Ref<number>
  fps: Ref<number>
  frames: Ref<DrawFrame[]>
  activeFrameIndex: Ref<number>
  activeLayerIndex: Ref<number>
  primaryColor: Ref<string>
  secondaryColor: Ref<string>
  activeFrame: ComputedRef<DrawFrame>
  activeLayer: ComputedRef<DrawLayer>
  spriteTitle: Ref<string>
  spriteDescription: Ref<string>
  renderFrameToContext: (frame: DrawFrame, ctx: CanvasRenderingContext2D, scale: number, alpha?: number) => void
  pushHistory: (label: string) => void
  requestRender: () => void
  clearProjectHistory?: () => void
}) {
  const { rgbToHex } = useDrawColorHelpers()
  const { showNotification } = useDrawNotify()

  const exportCanvasFromFrame = (frame: DrawFrame): HTMLCanvasElement => {
    const s = clampExportScale(options.exportScale.value)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(options.canvasWidth.value * s))
    canvas.height = Math.max(1, Math.round(options.canvasHeight.value * s))
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return canvas
    }
    ctx.imageSmoothingEnabled = false
    options.renderFrameToContext(frame, ctx, s)
    return canvas
  }

  const buildDraftPayload = (): DrawDraftPayload => ({
    canvasWidth: options.canvasWidth.value,
    canvasHeight: options.canvasHeight.value,
    fps: options.fps.value,
    frames: options.frames.value,
    primaryColor: options.primaryColor.value,
    secondaryColor: options.secondaryColor.value,
    updatedAt: new Date().toISOString(),
    spriteTitle: options.spriteTitle.value,
    spriteDescription: options.spriteDescription.value,
    exportScale: options.exportScale.value,
    activeFrameIndex: options.activeFrameIndex.value,
    activeLayerIndex: options.activeLayerIndex.value,
  })

  function sanitizeDownloadBase(raw: string, fallback: string): string {
    const source = (raw || '').trim() || fallback
    const base = source
      .replace(/[/\\?%*:|"<>]+/g, '-')
      .replace(/\s+/g, '-')
      .slice(0, 72)
    return base || fallback
  }

  function asciiSafeDownloadBase(raw: string, fallback: string): string {
    const step = sanitizeDownloadBase(raw, fallback)
    const ascii = step
      .split('')
      .map((ch) => {
        const c = ch.charCodeAt(0)
        return c >= 0x20 && c <= 0x7E ? ch : '-'
      })
      .join('')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    return ascii.length >= 1 && ascii !== '-' ? ascii.slice(0, 72) : fallback
  }

  const exportPNG = () => {
    const canvas = exportCanvasFromFrame(options.activeFrame.value)
    triggerDataUrlDownload('sprite.png', canvas.toDataURL('image/png'))
  }

  const exportProject = () => {
    const payload = buildDraftPayload()
    const base = asciiSafeDownloadBase(options.spriteTitle.value || 'sprite-project', 'sprite-project')
    triggerBlobDownload(`${base}.json`, new Blob([JSON.stringify(payload)], { type: 'application/json' }))
  }

  const exportZIP = () => {
    const files: { name: string, content: Uint8Array }[] = []
    for (let i = 0; i < options.frames.value.length; i += 1) {
      const canvas = exportCanvasFromFrame(options.frames.value[i]!)
      files.push({
        name: `frame-${String(i + 1).padStart(3, '0')}.png`,
        content: pngBytesFromCanvasSync(canvas),
      })
    }
    const zipBlob = createZipBlobSync(files)
    triggerBlobDownload('frames.zip', zipBlob)
  }

  const exportGIF = () => {
    const frames = options.frames.value
    if (frames.length < 1) {
      showNotification({
        type: 'warning',
        title: 'Экспорт GIF',
        message: 'Нет кадров для экспорта.',
      })
      return
    }
    const nameBase = asciiSafeDownloadBase(options.spriteTitle.value.trim(), 'animation')
    const delayMs = Math.max(1, Math.round(1000 / Math.max(1, options.fps.value)))
    const filename = `${nameBase}.gif`
    try {
      const gif = GIFEncoder()
      for (let i = 0; i < frames.length; i += 1) {
        const canvas = exportCanvasFromFrame(frames[i]!)
        writeGifFrameFromCanvas(gif, canvas, delayMs, i)
      }
      gif.finish()
      const bytes = gif.bytes()
      if (bytes.byteLength < 64) {
        throw new Error('Сформированный GIF слишком мал — кодирование не удалось.')
      }
      const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
      triggerBlobDownload(filename, new Blob([u8 as BlobPart], { type: 'image/gif' }))
      showNotification({
        type: 'success',
        title: 'GIF сохранён',
        message: `Файл ${filename} загружается (${frames.length} кадр.).`,
        duration: 4000,
      })
    }
    catch (e: unknown) {
      const msg = e instanceof Error && e.message ? e.message : 'Не удалось собрать GIF.'
      showNotification({
        type: 'error',
        title: 'Экспорт GIF',
        message: msg,
        duration: 7000,
      })
    }
  }

  const importImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png,image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) {
        return
      }
      const image = new Image()
      image.onload = () => {
        const temp = document.createElement('canvas')
        temp.width = options.canvasWidth.value
        temp.height = options.canvasHeight.value
        const ctx = temp.getContext('2d')
        if (!ctx) {
          return
        }
        ctx.drawImage(image, 0, 0, options.canvasWidth.value, options.canvasHeight.value)
        const data = ctx.getImageData(0, 0, options.canvasWidth.value, options.canvasHeight.value)
        for (let y = 0; y < options.canvasHeight.value; y += 1) {
          for (let x = 0; x < options.canvasWidth.value; x += 1) {
            const i = (y * options.canvasWidth.value + x) * 4
            const alpha = data.data[i + 3]!
            if (alpha > 0) {
              options.activeLayer.value.pixels[y]![x] = rgbToHex(data.data[i]!, data.data[i + 1]!, data.data[i + 2]!)
            }
          }
        }
        options.requestRender()
        options.pushHistory(DRAW_HISTORY_DOCUMENT_LABEL.importImage)
      }
      image.src = URL.createObjectURL(file)
    }
    input.click()
  }

  const importProject = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) {
        return
      }
      const content = await file.text()
      const parsed = JSON.parse(content) as DrawDraftPayload
      options.canvasWidth.value = parsed.canvasWidth
      options.canvasHeight.value = parsed.canvasHeight
      options.resizeWidth.value = parsed.canvasWidth
      options.resizeHeight.value = parsed.canvasHeight
      options.fps.value = parsed.fps
      options.frames.value = parsed.frames
      options.primaryColor.value = parsed.primaryColor
      options.secondaryColor.value = parsed.secondaryColor
      if (typeof parsed.spriteTitle === 'string') {
        options.spriteTitle.value = parsed.spriteTitle
      }
      if (typeof parsed.spriteDescription === 'string') {
        options.spriteDescription.value = parsed.spriteDescription
      }
      if (typeof parsed.exportScale === 'number' && Number.isFinite(parsed.exportScale)) {
        options.exportScale.value = parsed.exportScale
      }
      if (typeof parsed.activeFrameIndex === 'number' && parsed.activeFrameIndex >= 0) {
        options.activeFrameIndex.value = Math.min(parsed.activeFrameIndex, parsed.frames.length - 1)
      }
      else {
        options.activeFrameIndex.value = 0
      }
      if (typeof parsed.activeLayerIndex === 'number' && parsed.activeLayerIndex >= 0) {
        const frame = parsed.frames[options.activeFrameIndex.value]
        const maxL = frame?.layers.length ? frame.layers.length - 1 : 0
        options.activeLayerIndex.value = Math.min(parsed.activeLayerIndex, maxL)
      }
      else {
        options.activeLayerIndex.value = 0
      }
      options.clearProjectHistory?.()
      options.requestRender()
    }
    input.click()
  }

  return {
    exportCanvasFromFrame,
    exportPNG,
    exportProject,
    exportZIP,
    exportGIF,
    importImage,
    importProject,
  }
}
