import type { Ref } from 'vue'
import { computed, ref } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'aitishka-theme'

let themeRef: Ref<ThemeMode> | null = null

function getSystemTheme(): ThemeMode {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStoredTheme(): ThemeMode | null {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' ? value : null
}

function updateThemeColor(theme: ThemeMode) {
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#070b14' : '#1461cd')
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme
  updateThemeColor(theme)
}

export function initTheme() {
  const stored = readStoredTheme()
  const theme = stored ?? getSystemTheme()

  if (!themeRef)
    themeRef = ref(theme)
  else
    themeRef.value = theme

  if (stored)
    applyTheme(stored)

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (readStoredTheme())
      return

    const next = event.matches ? 'dark' : 'light'
    themeRef!.value = next
  })
}

export function useTheme() {
  if (!themeRef)
    initTheme()

  const theme = themeRef!
  const isDark = computed(() => theme.value === 'dark')

  function setTheme(next: ThemeMode) {
    theme.value = next
    localStorage.setItem(STORAGE_KEY, next)
    applyTheme(next)
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
