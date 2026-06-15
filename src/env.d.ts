/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module '*.scss' {
  const css: string
  export default css
}

declare module 'gifenc' {
  export function GIFEncoder(): {
    writeFrame: (...args: unknown[]) => void
    finish: () => void
    bytes: () => Uint8Array
  }
  export function quantize(data: Uint8ClampedArray, maxColors: number, options?: Record<string, unknown>): number[][]
  export function applyPalette(data: Uint8ClampedArray, palette: number[][], format?: string): Uint8Array
}

declare module 'markdown-it-container' {
  import type MarkdownIt from 'markdown-it'
  import type ContainerToken from 'markdown-it/lib/token.mjs'

  interface ContainerOptions {
    validate?: (params: string) => boolean
    render?: (tokens: ContainerToken[], idx: number) => string
  }

  function containerPlugin(md: MarkdownIt, name: string, options?: ContainerOptions): void

  export default containerPlugin
}

interface ImportMetaEnv {
  readonly VITE_SITE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
