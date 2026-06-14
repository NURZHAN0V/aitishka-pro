import { onMounted } from 'vue'
import { api } from '@/core/api'

const STORAGE_KEY = 'BUILD_DATE'

export function useBuildVersion() {
  onMounted(async () => {
    try {
      const buildData = await api.getBuildInfo()
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && stored !== buildData.date) {
        localStorage.setItem(STORAGE_KEY, buildData.date)
        window.location.reload()
        return
      }
      if (!stored)
        localStorage.setItem(STORAGE_KEY, buildData.date)
    }
    catch {
      // build.json may be absent in dev
    }
  })
}
