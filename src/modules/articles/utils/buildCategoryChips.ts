import type { Category } from '@/index.d'
import { NEWS_CATEGORY_SLUG } from '@/modules/news/constants'

export type CategoryChipKind = 'all' | 'category' | 'subcategory' | 'subsubsection' | 'media' | 'video-category'

export interface CategoryChip {
  id: string
  label: string
  to: string
  kind: CategoryChipKind
}

export function buildCategoryChips(categories: Category[]): CategoryChip[] {
  const chips: CategoryChip[] = [
    { id: 'all', label: 'Все', to: '/articles', kind: 'all' },
  ]

  const articleCategories = categories.filter(c => c.slug !== NEWS_CATEGORY_SLUG)

  for (const category of articleCategories) {
    chips.push({
      id: `cat-${category.slug}`,
      label: category.name,
      to: `/articles/${category.slug}`,
      kind: 'category',
    })
  }

  return chips
}

export function isCategoryChipActive(
  chip: CategoryChip,
  routeName: string | symbol | null | undefined,
  routeParams: Record<string, string | string[]>,
  _routePath: string,
): boolean {
  if (chip.kind === 'all')
    return routeName === 'articles'

  if (chip.kind === 'category') {
    const categorySlug = chip.to.split('/').filter(Boolean)[1]
    return routeParams.category === categorySlug
      && (routeName === 'articles-category'
        || routeName === 'articles-subcategory'
        || routeName === 'article')
  }

  return false
}
