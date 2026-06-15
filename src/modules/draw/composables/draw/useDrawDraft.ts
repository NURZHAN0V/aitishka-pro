import type { Ref } from 'vue'
import type { DrawDraftPayload, DrawEditorHistorySnapshot, DrawFrame, DrawHistoryEntry } from '@/modules/draw/types/draw-editor'
import { DRAW_HISTORY_MAX_STACK } from '@/modules/draw/composables/draw/useDrawHistory'
import { useDrawNotify } from '@/modules/draw/composables/useDrawNotify'
import { DRAW_DRAFT_STORAGE_KEY } from '@/modules/draw/types/draw-editor'
import { readDrawDraftFromIdb, writeDrawDraftToIdb } from '@/modules/draw/utils/drawDraftIdb'

function readDraftRawFromLocalStorage(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    return localStorage.getItem(DRAW_DRAFT_STORAGE_KEY)
  }
  catch {
    return null
  }
}

function validateDrawFramesGrid(canvasWidth: number, canvasHeight: number, frames: DrawFrame[]): boolean {
  const w = canvasWidth
  const h = canvasHeight
  if (!Number.isFinite(w) || !Number.isFinite(h) || w < 8 || w > 256 || h < 8 || h > 256) {
    return false
  }
  if (!Array.isArray(frames) || frames.length < 1 || frames.length > 200) {
    return false
  }
  for (const frame of frames) {
    if (!frame?.layers?.length) {
      return false
    }
    for (const layer of frame.layers) {
      const pixels = layer?.pixels
      if (!Array.isArray(pixels) || pixels.length !== h) {
        return false
      }
      for (let y = 0; y < h; y += 1) {
        const row = pixels[y]
        if (!Array.isArray(row) || row.length !== w) {
          return false
        }
      }
    }
  }
  return true
}

function isRenderableDraftPayload(payload: DrawDraftPayload): boolean {
  return validateDrawFramesGrid(payload.canvasWidth, payload.canvasHeight, payload.frames as DrawFrame[])
}

function isRenderableHistorySnapshot(parsed: DrawEditorHistorySnapshot): boolean {
  if (
    typeof parsed.canvasWidth !== 'number'
    || typeof parsed.canvasHeight !== 'number'
    || typeof parsed.activeFrameIndex !== 'number'
    || typeof parsed.activeLayerIndex !== 'number'
    || typeof parsed.fps !== 'number'
    || !Number.isFinite(parsed.fps)
    || parsed.fps < 1
    || parsed.fps > 240
  ) {
    return false
  }
  return validateDrawFramesGrid(parsed.canvasWidth, parsed.canvasHeight, parsed.frames as DrawFrame[])
}

function parseValidatedUndoStack(raw: unknown): DrawHistoryEntry[] | null {
  if (!Array.isArray(raw) || raw.length > DRAW_HISTORY_MAX_STACK) {
    return null
  }
  const out: DrawHistoryEntry[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      return null
    }
    const label = (item as DrawHistoryEntry).label
    const snapshot = (item as DrawHistoryEntry).snapshot
    if (typeof label !== 'string' || label.length > 200 || typeof snapshot !== 'string' || snapshot.length > 50_000_000) {
      return null
    }
    try {
      const parsed = JSON.parse(snapshot) as DrawEditorHistorySnapshot
      if (!isRenderableHistorySnapshot(parsed)) {
        return null
      }
    }
    catch {
      return null
    }
    out.push({ label, snapshot })
  }
  return out
}

function parseValidatedBaseline(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length > 50_000_000) {
    return null
  }
  try {
    const parsed = JSON.parse(raw) as DrawEditorHistorySnapshot
    if (!isRenderableHistorySnapshot(parsed)) {
      return null
    }
  }
  catch {
    return null
  }
  return raw
}

function removeDraftFromLocalStorage(): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    localStorage.removeItem(DRAW_DRAFT_STORAGE_KEY)
  }
  catch {
    /* ignore */
  }
}

export function useDrawDraft(options: {
  canvasWidth: Ref<number>
  canvasHeight: Ref<number>
  resizeWidth: Ref<number>
  resizeHeight: Ref<number>
  fps: Ref<number>
  frames: Ref<DrawFrame[]>
  activeFrameIndex: Ref<number>
  activeLayerIndex: Ref<number>
  primaryColor: Ref<string>
  secondaryColor: Ref<string>
  spriteTitle: Ref<string>
  spriteDescription: Ref<string>
  exportScale: Ref<number>
  lastSavedAt: Ref<Date | null>
  isDirty: Ref<boolean>
  requestRender: () => void
  undoStack: Ref<DrawHistoryEntry[]>
  baselineSnapshot: Ref<string>
  historySelectedIndex: Ref<number>
  applyHistoryPresentation: () => void
  captureHistoryBaselineFromCurrent: () => void
}) {
  const { showNotification } = useDrawNotify()

  const buildPayload = (): DrawDraftPayload => ({
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
    draftSchemaVersion: 3,
    historyBaseline: options.baselineSnapshot.value,
    historyUndo: options.undoStack.value.map(e => ({ ...e })),
    historySelectedIndex: options.historySelectedIndex.value,
  })

  const applyPayload = (payload: DrawDraftPayload) => {
    options.canvasWidth.value = payload.canvasWidth
    options.canvasHeight.value = payload.canvasHeight
    options.resizeWidth.value = payload.canvasWidth
    options.resizeHeight.value = payload.canvasHeight
    options.fps.value = payload.fps
    options.frames.value = payload.frames
    options.primaryColor.value = payload.primaryColor
    options.secondaryColor.value = payload.secondaryColor
    if (typeof payload.spriteTitle === 'string') {
      options.spriteTitle.value = payload.spriteTitle
    }
    if (typeof payload.spriteDescription === 'string') {
      options.spriteDescription.value = payload.spriteDescription
    }
    if (typeof payload.exportScale === 'number' && Number.isFinite(payload.exportScale)) {
      options.exportScale.value = payload.exportScale
    }
    if (typeof payload.activeFrameIndex === 'number' && payload.activeFrameIndex >= 0) {
      options.activeFrameIndex.value = Math.min(payload.activeFrameIndex, payload.frames.length - 1)
    }
    else {
      options.activeFrameIndex.value = 0
    }
    if (typeof payload.activeLayerIndex === 'number' && payload.activeLayerIndex >= 0) {
      const frame = payload.frames[options.activeFrameIndex.value]
      const maxL = frame?.layers.length ? frame.layers.length - 1 : 0
      options.activeLayerIndex.value = Math.min(payload.activeLayerIndex, maxL)
    }
    else {
      options.activeLayerIndex.value = 0
    }
    options.lastSavedAt.value = new Date(payload.updatedAt)

    const checkpointsParsed = parseValidatedUndoStack(payload.historyUndo)
    const baselineParsed = parseValidatedBaseline(payload.historyBaseline)

    if (checkpointsParsed != null && baselineParsed != null) {
      options.baselineSnapshot.value = baselineParsed
      options.undoStack.value = checkpointsParsed
      const nu = checkpointsParsed.length
      if (nu === 0) {
        options.historySelectedIndex.value = -1
      }
      else {
        const sel = typeof payload.historySelectedIndex === 'number' ? payload.historySelectedIndex : nu - 1
        options.historySelectedIndex.value = Math.min(Math.max(-1, sel), nu - 1)
      }
    }
    else {
      options.undoStack.value = []
      options.historySelectedIndex.value = -1
      options.captureHistoryBaselineFromCurrent()
    }

    options.applyHistoryPresentation()
  }

  const readDraftRaw = async (): Promise<string | null> => {
    if (typeof window === 'undefined') {
      return null
    }

    const raw = await readDrawDraftFromIdb()
    if (raw) {
      return raw
    }

    const fromLs = readDraftRawFromLocalStorage()
    if (fromLs) {
      await writeDrawDraftToIdb(fromLs)
      removeDraftFromLocalStorage()
      return fromLs
    }

    return null
  }

  interface SaveDraftOptions { toast?: boolean }

  const saveDraft = async (opts?: SaveDraftOptions) => {
    try {
      const payload = buildPayload()
      const json = JSON.stringify(payload)

      const written = await writeDrawDraftToIdb(json)
      if (!written) {
        showNotification({
          type: 'error',
          title: 'Черновик',
          message: 'Не удалось записать в IndexedDB (проверьте настройки браузера или место на диске).',
        })
        return
      }

      removeDraftFromLocalStorage()

      options.lastSavedAt.value = new Date()
      options.isDirty.value = false
      if (opts?.toast) {
        showNotification({
          type: 'success',
          title: 'Черновик сохранён',
          message: 'Данные только в IndexedDB этого браузера; на сервер не отправляются.',
          duration: 3200,
        })
      }
    }
    catch {
      showNotification({
        type: 'error',
        title: 'Черновик',
        message: 'Не удалось сохранить черновик.',
      })
    }
  }

  interface RestoreDraftOptions { silent?: boolean }

  const restoreDraft = async (opts?: RestoreDraftOptions) => {
    try {
      const raw = await readDraftRaw()
      if (!raw) {
        if (!opts?.silent) {
          showNotification({
            type: 'warning',
            title: 'Черновик',
            message: 'Черновик не найден.',
          })
        }
        return
      }
      const payload = JSON.parse(raw) as DrawDraftPayload
      if (!Array.isArray(payload.frames) || payload.frames.length === 0 || !isRenderableDraftPayload(payload)) {
        if (!opts?.silent) {
          showNotification({
            type: 'error',
            title: 'Черновик',
            message: 'Черновик повреждён или не подходит по размеру сетки — начните новый проект или импортируйте JSON.',
          })
        }
        return
      }
      applyPayload(payload)
      options.requestRender()
    }
    catch {
      showNotification({
        type: 'error',
        title: 'Черновик',
        message: 'Не удалось восстановить черновик.',
      })
    }
  }

  return { saveDraft, restoreDraft }
}
