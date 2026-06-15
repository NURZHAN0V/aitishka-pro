import type { DrawFrame } from '@/modules/draw/types/draw-editor'

/**
 * Пресетная палитра для пиксель-арта: нейтрали, ряды по оттенкам, кожа/земля/вода.
 * Порядок — от тёмного к светлому внутри групп (тени → блики).
 */
export const DRAW_PALETTE_PRESETS: readonly string[] = [
  '#000000',
  '#0c0a09',
  '#1c1917',
  '#292524',
  '#44403c',
  '#57534e',
  '#78716c',
  '#a8a29e',
  '#d6d3d1',
  '#e7e5e4',
  '#fafaf9',
  '#ffffff',
  '#020617',
  '#0f172a',
  '#1e293b',
  '#334155',
  '#64748b',
  '#94a3b8',
  '#cbd5e1',
  '#450a0a',
  '#7f1d1d',
  '#b91c1c',
  '#ef4444',
  '#fca5a5',
  '#fecaca',
  '#7c2d12',
  '#c2410c',
  '#ea580c',
  '#fb923c',
  '#fdba74',
  '#ffedd5',
  '#713f12',
  '#a16207',
  '#ca8a04',
  '#eab308',
  '#fde047',
  '#fef9c3',
  '#14532d',
  '#166534',
  '#15803d',
  '#22c55e',
  '#86efac',
  '#dcfce7',
  '#134e4a',
  '#0f766e',
  '#0d9488',
  '#14b8a6',
  '#5eead4',
  '#ccfbf1',
  '#1e3a8a',
  '#1d4ed8',
  '#2563eb',
  '#3b82f6',
  '#93c5fd',
  '#dbeafe',
  '#4c1d95',
  '#6d28d9',
  '#7c3aed',
  '#a78bfa',
  '#ddd6fe',
  '#831843',
  '#be185d',
  '#db2777',
  '#f472b6',
  '#fbcfe8',
  '#431407',
  '#9a3412',
  '#b45309',
  '#d97757',
  '#fed7aa',
]

/** Быстрые образцы в левой панели «Цвета» (первые слоты пресета). */
export const DRAW_PALETTE_QUICK_SWATCHES: readonly string[] = DRAW_PALETTE_PRESETS.slice(0, 18)

export function normalizeDrawHex(raw: string): string {
  let v = raw.trim()
  if (!v) {
    return '#000000'
  }
  if (!v.startsWith('#')) {
    v = `#${v}`
  }
  v = v.toLowerCase()
  if (v.length === 4 && /^#[0-9a-f]{3}$/.test(v)) {
    const r = v[1]!
    const g = v[2]!
    const b = v[3]!
    return `#${r}${r}${g}${g}${b}${b}`
  }
  if (/^#[0-9a-f]{6}$/.test(v)) {
    return v
  }
  return '#000000'
}

function luminance(hex: string): number {
  const n = normalizeDrawHex(hex).slice(1)
  const r = Number.parseInt(n.slice(0, 2), 16) / 255
  const g = Number.parseInt(n.slice(2, 4), 16) / 255
  const b = Number.parseInt(n.slice(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Уникальные непустые цвета со всех кадров и слоёв (нормализованные #rrggbb). */
export function collectUniqueColorsFromFrames(frames: DrawFrame[], max = 64): string[] {
  const seen = new Set<string>()
  for (const frame of frames) {
    for (const layer of frame.layers) {
      for (const row of layer.pixels) {
        for (const cell of row) {
          if (!cell) {
            continue
          }
          seen.add(normalizeDrawHex(cell))
        }
      }
    }
  }
  const list = [...seen]
  list.sort((a, b) => {
    const la = luminance(a)
    const lb = luminance(b)
    if (Math.abs(la - lb) > 0.04) {
      return lb - la
    }
    return a.localeCompare(b)
  })
  return list.slice(0, max)
}
