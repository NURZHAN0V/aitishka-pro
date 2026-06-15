import type { Ref } from 'vue'
import type { DrawTool } from '@/modules/draw/types/draw-editor'

/** Привязка по физической клавише (`KeyboardEvent.code`), не зависит от языка раскладки. */
export const drawEditorToolCodeBindings: Partial<Record<string, DrawTool>> = {
  KeyP: 'pencil',
  KeyV: 'mirror-pencil',
  KeyB: 'fill',
  KeyA: 'replace-color',
  KeyE: 'eraser',
  KeyL: 'line',
  KeyR: 'rectangle',
  KeyC: 'circle',
  KeyM: 'move',
  KeyZ: 'shape-select',
  KeyS: 'rect-select',
  KeyH: 'lasso',
  KeyU: 'lighten',
  KeyT: 'dither',
  KeyO: 'eyedropper',
}

/** @deprecated Используйте drawEditorToolCodeBindings — key зависит от раскладки (латиница/кириллица). */
export const drawEditorToolKeyBindings: Record<string, DrawTool> = {
  p: 'pencil',
  v: 'mirror-pencil',
  b: 'fill',
  a: 'replace-color',
  e: 'eraser',
  l: 'line',
  r: 'rectangle',
  c: 'circle',
  m: 'move',
  z: 'shape-select',
  s: 'rect-select',
  h: 'lasso',
  u: 'lighten',
  t: 'dither',
  o: 'eyedropper',
}

export interface DrawEditorKeyboardDeps {
  saveDraft: (opts?: { toast?: boolean }) => void
  undo: () => void
  redo: () => void
  duplicateLayer: () => void
  showShortcuts: Ref<boolean>
  showAnimationModal: Ref<boolean>
  showSecondaryPopover: Ref<boolean>
  penSize: Ref<number>
  activeTool: Ref<DrawTool>
}

function isTypingInField(target: EventTarget | null): boolean {
  const el = target instanceof HTMLElement ? target : null
  if (!el) {
    return false
  }
  return Boolean(
    el.closest(
      'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]',
    ),
  )
}

export function useDrawEditorKeyboard(deps: DrawEditorKeyboardDeps) {
  const handleKeyboard = (event: KeyboardEvent) => {
    const code = event.code
    const keyLower = event.key.toLowerCase()
    const ctrlOrMeta = event.ctrlKey || event.metaKey

    if (deps.showShortcuts.value && code === 'Escape') {
      event.preventDefault()
      deps.showShortcuts.value = false
      return
    }
    if (deps.showShortcuts.value) {
      return
    }

    if (deps.showAnimationModal.value && code === 'Escape') {
      event.preventDefault()
      deps.showAnimationModal.value = false
      return
    }
    if (deps.showAnimationModal.value) {
      return
    }

    if (deps.showSecondaryPopover.value && code === 'Escape') {
      event.preventDefault()
      deps.showSecondaryPopover.value = false
      return
    }

    // Блокируем только Ctrl+масштаб страницы в браузере (по code — однообразно на любых раскладках)
    if (
      ctrlOrMeta
      && (code === 'Equal' || code === 'Minus' || code === 'Digit0' || keyLower === '+' || keyLower === '_' || keyLower === '0')
    ) {
      event.preventDefault()
      return
    }

    if (ctrlOrMeta && code === 'KeyS') {
      event.preventDefault()
      deps.saveDraft({ toast: true })
      return
    }
    if (ctrlOrMeta && code === 'KeyZ' && !event.shiftKey) {
      event.preventDefault()
      deps.undo()
      return
    }
    if (ctrlOrMeta && (code === 'KeyY' || (code === 'KeyZ' && event.shiftKey))) {
      event.preventDefault()
      deps.redo()
      return
    }
    if (ctrlOrMeta && code === 'KeyJ') {
      event.preventDefault()
      deps.duplicateLayer()
      return
    }

    const typing = isTypingInField(event.target)

    // «?» / Shift+/ на той же физической клавише (Slash + Shift)
    if (
      !ctrlOrMeta
      && !event.altKey
      && ((code === 'Slash' && event.shiftKey) || event.key === '?')
    ) {
      if (typing) {
        return
      }
      event.preventDefault()
      deps.showShortcuts.value = !deps.showShortcuts.value
      return
    }

    if (!ctrlOrMeta && !event.altKey && code === 'BracketLeft') {
      if (typing) {
        return
      }
      event.preventDefault()
      deps.penSize.value = Math.max(1, deps.penSize.value - 1)
      return
    }
    if (!ctrlOrMeta && !event.altKey && code === 'BracketRight') {
      if (typing) {
        return
      }
      event.preventDefault()
      deps.penSize.value = Math.min(8, deps.penSize.value + 1)
      return
    }

    if (ctrlOrMeta || event.altKey) {
      return
    }
    if (typing) {
      return
    }

    const boundTool = drawEditorToolCodeBindings[code]
    if (boundTool) {
      event.preventDefault()
      deps.activeTool.value = boundTool
    }
  }

  return { handleKeyboard }
}
