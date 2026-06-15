import type { DrawFrame, DrawLayer } from '@/modules/draw/types/draw-editor'

/** Без secure context `crypto.randomUUID` недоступен — иначе редактор падает при создании кадра. */
export function newDrawEntityId(): string {
  try {
    const c = globalThis.crypto
    if (c && typeof c.randomUUID === 'function') {
      return c.randomUUID()
    }
  }
  catch {
    /* ignore */
  }
  return `draw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`
}

export function createEmptyPixels(w: number, h: number): string[][] {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => ''))
}

export function createDrawLayer(name: string, width: number, height: number): DrawLayer {
  return {
    id: newDrawEntityId(),
    name,
    visible: true,
    pixels: createEmptyPixels(width, height),
  }
}

export function createDrawFrame(width: number, height: number): DrawFrame {
  return {
    id: newDrawEntityId(),
    layers: [createDrawLayer('Слой 1', width, height)],
  }
}
