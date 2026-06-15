export function useDrawColorHelpers() {
  const hexToRgb = (hex: string): [number, number, number] => {
    const value = hex.replace('#', '')
    const norm = value.length === 3 ? value.split('').map(s => `${s}${s}`).join('') : value
    const num = Number.parseInt(norm, 16)
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
  }

  const rgbToHex = (r: number, g: number, b: number): string =>
    `#${[r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')}`

  const lightenHex = (hex: string): string => {
    const [r, g, b] = hexToRgb(hex || '#000000')
    return rgbToHex(Math.round(r + (255 - r) * 0.2), Math.round(g + (255 - g) * 0.2), Math.round(b + (255 - b) * 0.2))
  }

  return { hexToRgb, rgbToHex, lightenHex }
}
