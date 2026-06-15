export function useDrawViewportGuards() {
  const preventPageZoomWheel = (event: WheelEvent) => {
    if (event.ctrlKey) {
      event.preventDefault()
    }
  }

  const preventGestureZoom = (event: Event) => {
    event.preventDefault()
  }

  return { preventPageZoomWheel, preventGestureZoom }
}
