import type { Ref } from 'vue'
import type { DrawPoint } from '@/modules/draw/types/draw-editor'

export function useDrawCanvasCoords(options: {
  canvasRef: Ref<HTMLCanvasElement | null>
  zoom: Ref<number>
  canvasWidth: Ref<number>
  canvasHeight: Ref<number>
}) {
  const getCanvasCoords = (event: Pick<MouseEvent, 'clientX' | 'clientY'>): DrawPoint => {
    const canvas = options.canvasRef.value
    if (!canvas) {
      return { x: 0, y: 0 }
    }
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((event.clientX - rect.left) / options.zoom.value)
    const y = Math.floor((event.clientY - rect.top) / options.zoom.value)
    return {
      x: Math.max(0, Math.min(options.canvasWidth.value - 1, x)),
      y: Math.max(0, Math.min(options.canvasHeight.value - 1, y)),
    }
  }

  return { getCanvasCoords }
}
