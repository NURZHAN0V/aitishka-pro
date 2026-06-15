import type { ComputedRef, Ref } from 'vue'
import type { DrawEditorHistorySnapshot, DrawFrame, DrawHistoryEntry } from '@/modules/draw/types/draw-editor'
import { ref } from 'vue'

/** Лимит числа контрольных точек (совместимо с проверкой черновика в IndexedDB). */
export const DRAW_HISTORY_MAX_STACK = 80

export function useDrawHistory(options: {
  canvasWidth: Ref<number>
  canvasHeight: Ref<number>
  resizeWidth: Ref<number>
  resizeHeight: Ref<number>
  fps: Ref<number>
  frames: Ref<DrawFrame[]>
  activeFrameIndex: Ref<number>
  activeLayerIndex: Ref<number>
  activeFrame: ComputedRef<DrawFrame>
  isDirty: Ref<boolean>
  requestRender: () => void
}) {
  function cloneState(): string {
    return JSON.stringify({
      canvasWidth: options.canvasWidth.value,
      canvasHeight: options.canvasHeight.value,
      fps: options.fps.value,
      frames: options.frames.value,
      activeFrameIndex: options.activeFrameIndex.value,
      activeLayerIndex: options.activeLayerIndex.value,
    } satisfies DrawEditorHistorySnapshot)
  }

  /** Снимок «до любого шага истории» (начальное состояние сессии после сброса / загрузки). */
  const baselineSnapshot = ref(cloneState())

  /** Контрольные точки: каждый snapshot — полное состояние после помеченного действия. */
  const undoStack = ref<DrawHistoryEntry[]>([])

  /**
   * Указатель на активную точку: -1 — показан baseline; иначе индекс в undoStack.
   * Совпадает с выделением строки в панели (когда ≥ 0).
   */
  const historySelectedIndex = ref(-1)

  const applyState = (snapshot: string) => {
    const parsed = JSON.parse(snapshot) as DrawEditorHistorySnapshot
    options.canvasWidth.value = parsed.canvasWidth
    options.canvasHeight.value = parsed.canvasHeight
    options.resizeWidth.value = parsed.canvasWidth
    options.resizeHeight.value = parsed.canvasHeight
    options.fps.value = parsed.fps
    options.frames.value = parsed.frames
    options.activeFrameIndex.value = Math.min(parsed.activeFrameIndex, options.frames.value.length - 1)
    options.activeLayerIndex.value = Math.min(parsed.activeLayerIndex, options.activeFrame.value.layers.length - 1)
    options.requestRender()
  }

  /** После восстановления черновика / смены baseline выставить холст в точку каретки. */
  const applyHistoryPresentation = () => {
    const points = undoStack.value
    const s = historySelectedIndex.value
    if (points.length === 0) {
      applyState(baselineSnapshot.value)
      return
    }
    if (s >= 0 && s < points.length) {
      applyState(points[s]!.snapshot)
      return
    }
    if (s === -1) {
      applyState(baselineSnapshot.value)
      return
    }
    historySelectedIndex.value = points.length - 1
    applyState(points[historySelectedIndex.value]!.snapshot)
  }

  const pushHistory = (label: string) => {
    if (historySelectedIndex.value < undoStack.value.length - 1) {
      undoStack.value = undoStack.value.slice(0, historySelectedIndex.value + 1)
    }
    undoStack.value.push({ snapshot: cloneState(), label })
    while (undoStack.value.length > DRAW_HISTORY_MAX_STACK) {
      const dropped = undoStack.value.shift()!
      historySelectedIndex.value = Math.max(-1, historySelectedIndex.value - 1)
      baselineSnapshot.value = dropped.snapshot
    }
    historySelectedIndex.value = undoStack.value.length - 1
    options.isDirty.value = true
  }

  const undo = () => {
    if (historySelectedIndex.value < 0) {
      return
    }
    if (historySelectedIndex.value === 0) {
      applyState(baselineSnapshot.value)
      historySelectedIndex.value = -1
      return
    }
    historySelectedIndex.value -= 1
    applyState(undoStack.value[historySelectedIndex.value]!.snapshot)
  }

  const redo = () => {
    if (undoStack.value.length === 0) {
      return
    }
    if (historySelectedIndex.value >= undoStack.value.length - 1) {
      return
    }
    historySelectedIndex.value += 1
    applyState(undoStack.value[historySelectedIndex.value]!.snapshot)
  }

  /** Перейти к точке `index` в списке — строки истории не удаляются. */
  const goToHistoryCheckpoint = (index: number) => {
    if (index < 0 || index >= undoStack.value.length) {
      return
    }
    historySelectedIndex.value = index
    applyState(undoStack.value[index]!.snapshot)
    options.isDirty.value = true
  }

  const deleteHistoryCheckpointFrom = (index: number) => {
    const n = undoStack.value.length
    if (index < 0 || index >= n) {
      return
    }
    // eslint-disable-next-line no-alert -- подтверждение необратимого удаления истории
    if (!window.confirm(
      'Удалить эту запись и все более новые шаги (как в Adobe Photoshop)? Вернуть удалённые действия будет нельзя.',
    )) {
      return
    }

    undoStack.value = undoStack.value.slice(0, index)
    if (undoStack.value.length === 0) {
      applyState(baselineSnapshot.value)
      historySelectedIndex.value = -1
    }
    else {
      historySelectedIndex.value = undoStack.value.length - 1
      applyState(undoStack.value[historySelectedIndex.value]!.snapshot)
    }
    options.isDirty.value = true
    options.requestRender()
  }

  const clearProjectHistory = () => {
    undoStack.value = []
    historySelectedIndex.value = -1
    baselineSnapshot.value = cloneState()
  }

  const captureHistoryBaselineFromCurrent = () => {
    baselineSnapshot.value = cloneState()
  }

  return {
    undoStack,
    baselineSnapshot,
    historySelectedIndex,
    cloneState,
    applyState,
    applyHistoryPresentation,
    captureHistoryBaselineFromCurrent,
    pushHistory,
    undo,
    redo,
    goToHistoryCheckpoint,
    deleteHistoryCheckpointFrom,
    clearProjectHistory,
  }
}
