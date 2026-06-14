import type { BreadcrumbItem } from '@/index.d'
import { readonly, ref } from 'vue'

const pageBreadcrumbs = ref<BreadcrumbItem[]>([])

export function usePageBreadcrumbs() {
  function setPageBreadcrumbs(items: BreadcrumbItem[]) {
    pageBreadcrumbs.value = items
  }

  function clearPageBreadcrumbs() {
    pageBreadcrumbs.value = []
  }

  return {
    pageBreadcrumbs: readonly(pageBreadcrumbs),
    setPageBreadcrumbs,
    clearPageBreadcrumbs,
  }
}

export function usePageBreadcrumbsState() {
  return pageBreadcrumbs
}
