import type { DrawIconName } from '@/modules/draw/icons/draw-icons'

export type DrawTool
  = | 'pencil'
    | 'mirror-pencil'
    | 'fill'
    | 'replace-color'
    | 'eraser'
    | 'line'
    | 'rectangle'
    | 'circle'
    | 'move'
    | 'shape-select'
    | 'rect-select'
    | 'lasso'
    | 'lighten'
    | 'dither'
    | 'eyedropper'

export interface ToolOption {
  id: DrawTool
  label: string
  hotkey: string
}

export interface DrawLayer {
  id: string
  name: string
  visible: boolean
  pixels: string[][]
}

export interface DrawFrame {
  id: string
  layers: DrawLayer[]
}

export interface DrawPoint {
  x: number
  y: number
}

export interface DrawSelectionRect {
  x: number
  y: number
  width: number
  height: number
}

export interface DrawEditorHistorySnapshot {
  canvasWidth: number
  canvasHeight: number
  fps: number
  frames: DrawFrame[]
  activeFrameIndex: number
  activeLayerIndex: number
}

export interface DrawHistoryEntry {
  snapshot: string
  label: string
}

export interface DrawRedoEntry {
  snapshot: string
  forwardLabel: string
}

export const DRAW_HISTORY_DOCUMENT_LABEL = {
  newFrame: 'Новый кадр',
  duplicateFrame: 'Дублировать кадр',
  deleteFrame: 'Удалить кадр',
  reorderFrames: 'Порядок кадров',
  newLayer: 'Новый слой',
  duplicateLayer: 'Дублировать слой',
  renameLayer: 'Переименовать слой',
  deleteLayer: 'Удалить слой',
  reorderLayers: 'Порядок слоёв',
  mergeLayers: 'Объединить видимые слои',
  clearAnimation: 'Полная очистка проекта',
  rotateCanvas: 'Повернуть холст на 90°',
  flipHorizontal: 'Отразить по горизонтали',
  flipVertical: 'Отразить по вертикали',
  cropToSelection: 'Обрезать по выделению',
  resizeCanvas: 'Изменить размер холста',
  importImage: 'Импорт изображения в слой',
} as const

export interface DrawDraftPayload {
  canvasWidth: number
  canvasHeight: number
  fps: number
  frames: DrawFrame[]
  palette?: string[]
  primaryColor: string
  secondaryColor: string
  updatedAt: string
  spriteTitle?: string
  spriteDescription?: string
  exportScale?: number
  activeFrameIndex?: number
  activeLayerIndex?: number
  draftSchemaVersion?: number
  historyUndo?: DrawHistoryEntry[]
  historyRedo?: DrawRedoEntry[]
  historySelectedIndex?: number
  historyBaseline?: string
}

export const DRAW_DRAFT_STORAGE_KEY = 'aitishka_draw_draft_v1'

export const DRAW_DRAFT_IDB_NAME = 'aitishka_draw_draft'

export const DRAW_DRAFT_IDB_STORE = 'payload'

export const DRAW_DRAFT_IDB_VERSION = 1

export type SecondaryTab = 'settings' | 'resize' | 'save' | 'export' | 'load'

export const secondaryTabTitle: Record<SecondaryTab, string> = {
  settings: 'Общие настройки',
  resize: 'Изменение размера',
  save: 'Сохранение',
  export: 'Экспорт',
  load: 'Загрузка и импорт',
}

export const toolOptions: ToolOption[] = [
  { id: 'pencil', label: 'Карандаш', hotkey: 'P' },
  { id: 'mirror-pencil', label: 'Зеркальное перо', hotkey: 'V' },
  { id: 'fill', label: 'Заливка', hotkey: 'B' },
  { id: 'replace-color', label: 'Замена цвета', hotkey: 'A' },
  { id: 'eraser', label: 'Ластик', hotkey: 'E' },
  { id: 'line', label: 'Линия', hotkey: 'L' },
  { id: 'rectangle', label: 'Прямоугольник', hotkey: 'R' },
  { id: 'circle', label: 'Окружность', hotkey: 'C' },
  { id: 'move', label: 'Перемещение', hotkey: 'M' },
  { id: 'shape-select', label: 'Выделение формы', hotkey: 'Z' },
  { id: 'rect-select', label: 'Прямоугольное выделение', hotkey: 'S' },
  { id: 'lasso', label: 'Лассо', hotkey: 'H' },
  { id: 'lighten', label: 'Осветление', hotkey: 'U' },
  { id: 'dither', label: 'Дизеринг', hotkey: 'T' },
  { id: 'eyedropper', label: 'Пипетка', hotkey: 'O' },
]

export const toolLabelById: Record<DrawTool, string> = toolOptions.reduce(
  (acc, item) => {
    acc[item.id] = item.label
    return acc
  },
  {} as Record<DrawTool, string>,
)

export const toolIconById: Record<DrawTool, DrawIconName> = {
  'pencil': 'draw-pencil',
  'mirror-pencil': 'draw-brush',
  'fill': 'draw-fill',
  'replace-color': 'draw-exchange',
  'eraser': 'draw-eraser',
  'line': 'draw-line',
  'rectangle': 'draw-rectangle',
  'circle': 'draw-circle',
  'move': 'draw-move',
  'shape-select': 'draw-magic',
  'rect-select': 'draw-crop',
  'lasso': 'draw-lasso',
  'lighten': 'draw-lighten',
  'dither': 'draw-dither',
  'eyedropper': 'draw-eyedropper',
}

export const primaryToolIds: DrawTool[] = [
  'pencil',
  'eraser',
  'fill',
  'line',
  'rectangle',
  'circle',
  'mirror-pencil',
  'move',
  'eyedropper',
]
