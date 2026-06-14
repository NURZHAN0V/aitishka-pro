import { onBeforeUnmount, onMounted, ref } from 'vue'

type ScreenClass = 'mobile' | 'tablet' | 'notebook' | 'desktop'

function getScreenClass(width: number): ScreenClass {
  if (width <= 480)
    return 'mobile'
  if (width <= 767)
    return 'tablet'
  if (width <= 1199)
    return 'notebook'
  return 'desktop'
}

export function useScreenWidth() {
  const screenClass = ref<ScreenClass>('desktop')
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

  const update = () => {
    width.value = window.innerWidth
    const next = getScreenClass(width.value)
    if (screenClass.value !== next) {
      document.body.classList.remove('mobile', 'tablet', 'notebook', 'desktop')
      document.body.classList.add(next)
      screenClass.value = next
    }
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', update)
  })

  return { screenClass, width }
}
