/**
 * Draw editor icons from Hugeicons free set (@hugeicons/core-free-icons).
 * Keys match BaseIcon names used across the draw module.
 */
import {
  Add01Icon,
  ArrowAllDirectionIcon,
  ArrowDataTransferHorizontalIcon,
  ArrowExpand01Icon,
  ArrowLeft01Icon,
  CircleIcon,
  ColorPickerIcon,
  Copy01Icon,
  CropIcon,
  CursorRectangleSelectionIcon,
  Delete02Icon,
  Download01Icon,
  Edit02Icon,
  EraserIcon,
  FileExportIcon,
  FileZipIcon,
  FitToScreenIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  FloppyDiskIcon,
  Folder02Icon,
  Grid02Icon,
  Grid3X3Icon,
  HelpCircleIcon,
  HistoryIcon,
  Image01Icon,
  LassoToolIcon,
  Layers01Icon,
  Layers02Icon,
  LinkSquare02Icon,
  MagicWand01Icon,
  MaximizeScreenIcon,
  MergeIcon,
  MinimizeScreenIcon,
  PaintBrush04Icon,
  PaintBucketIcon,
  PaletteIcon,
  PauseIcon,
  PencilEdit02Icon,
  PencilIcon,
  PlayIcon,
  Redo02Icon,
  RefreshIcon,
  RotateClockwiseIcon,
  Settings01Icon,
  SlashIcon,
  SquareIcon,
  Sun03Icon,
  Tick02Icon,
  Undo02Icon,
  Video01Icon,
  ViewIcon,
  ViewOffSlashIcon,
  ZoomInAreaIcon,
  ZoomOutAreaIcon,
} from '@hugeicons/core-free-icons'
import { hugeiconToSvg } from '@/core/icons/hugeiconToSvg'

type HugeIconNode = Parameters<typeof hugeiconToSvg>[0]

function svg(icon: unknown) {
  return hugeiconToSvg(icon as HugeIconNode)
}

export const drawToolHugeicons: Record<string, string> = {
  // Tools
  'draw-pencil': svg(PencilIcon),
  'draw-brush': svg(PaintBrush04Icon),
  'draw-brush-tool': svg(PaintBrush04Icon),
  'draw-mirror-pencil': svg(PencilEdit02Icon),
  'draw-fill': svg(PaintBucketIcon),
  'draw-exchange': svg(ArrowDataTransferHorizontalIcon),
  'draw-eraser': svg(EraserIcon),
  'draw-line': svg(SlashIcon),
  'draw-rectangle': svg(SquareIcon),
  'draw-circle': svg(CircleIcon),
  'draw-move': svg(ArrowAllDirectionIcon),
  'draw-magic': svg(MagicWand01Icon),
  'draw-rect-select': svg(CursorRectangleSelectionIcon),
  'draw-lasso': svg(LassoToolIcon),
  'draw-lighten': svg(Sun03Icon),
  'draw-dither': svg(Grid3X3Icon),
  'draw-eyedropper': svg(ColorPickerIcon),
  'draw-crop': svg(CropIcon),

  // Toolbar
  'draw-undo': svg(Undo02Icon),
  'draw-redo': svg(Redo02Icon),
  'draw-delete': svg(Delete02Icon),
  'draw-settings': svg(Settings01Icon),
  'draw-resize': svg(ArrowExpand01Icon),
  'draw-save': svg(FloppyDiskIcon),
  'draw-export': svg(FileExportIcon),
  'draw-folder': svg(Folder02Icon),
  'draw-play': svg(PlayIcon),
  'draw-pause': svg(PauseIcon),
  'draw-grid': svg(Grid02Icon),
  'draw-onion': svg(Layers01Icon),
  'draw-zoom-in': svg(ZoomInAreaIcon),
  'draw-zoom-out': svg(ZoomOutAreaIcon),
  'draw-fit': svg(FitToScreenIcon),

  // Navigation
  'draw-back': svg(ArrowLeft01Icon),
  'draw-external': svg(LinkSquare02Icon),
  'draw-fullscreen': svg(MaximizeScreenIcon),
  'draw-fullscreen-exit': svg(MinimizeScreenIcon),
  'draw-question': svg(HelpCircleIcon),

  // Layers / frames / history
  'draw-add': svg(Add01Icon),
  'draw-copy': svg(Copy01Icon),
  'draw-edit': svg(Edit02Icon),
  'draw-merge': svg(MergeIcon),
  'draw-stack': svg(Layers02Icon),
  'draw-palette': svg(PaletteIcon),
  'draw-history': svg(HistoryIcon),
  'draw-eye': svg(ViewIcon),
  'draw-eye-off': svg(ViewOffSlashIcon),

  // Export / transform
  'draw-download': svg(Download01Icon),
  'draw-image': svg(Image01Icon),
  'draw-video': svg(Video01Icon),
  'draw-zip': svg(FileZipIcon),
  'draw-flip-h': svg(FlipHorizontalIcon),
  'draw-flip-v': svg(FlipVerticalIcon),
  'draw-rotate': svg(RotateClockwiseIcon),
  'draw-expand': svg(ArrowExpand01Icon),
  'draw-check': svg(Tick02Icon),
  'draw-reset': svg(RefreshIcon),
}

export type DrawIconName = keyof typeof drawToolHugeicons
