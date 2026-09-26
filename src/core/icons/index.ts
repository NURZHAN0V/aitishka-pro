import { siteHugeicons } from '@/core/icons/site-hugeicons'
import { drawToolHugeicons } from '@/modules/draw/icons/draw-tool-hugeicons'

const icons: Record<string, string> = {
  ...siteHugeicons,
  ...drawToolHugeicons,
}

export function getIcon(name: string): string {
  return icons[name] ?? ''
}
