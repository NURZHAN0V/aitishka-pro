import { YANDEX_METRIKA_ID } from '@/core/constants/metrika'

interface YandexMetrikaInitOptions {
  ssr?: boolean
  clickmap?: boolean
  trackLinks?: boolean
  accurateTrackBounce?: boolean
  ecommerce?: string | boolean
  referrer?: string
  url?: string
}

interface YandexMetrikaHitOptions {
  title?: string
  referer?: string
}

interface YandexMetrikaFn {
  (counterId: number, event: 'init', options: YandexMetrikaInitOptions): void
  (counterId: number, event: 'hit', url: string, options?: YandexMetrikaHitOptions): void
  (counterId: number, event: string, ...args: unknown[]): void
  a?: unknown[]
  l?: number
}

declare global {
  interface Window {
    ym?: YandexMetrikaFn
  }
}

export function trackYandexMetrikaHit(url: string, title = document.title) {
  window.ym?.(YANDEX_METRIKA_ID, 'hit', url, { title })
}
