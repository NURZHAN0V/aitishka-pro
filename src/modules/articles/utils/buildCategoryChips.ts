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
    const hasSubs = category.subcategories.length > 0
    chips.push({
      id: `cat-${category.slug}`,
      label: category.name,
      to: hasSubs ? `/articles/${category.slug}` : `/articles/category/${category.slug}`,
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
    const parts = chip.to.split('/').filter(Boolean)
    const categorySlug = parts[parts.length - 1]
    const paramCategory = routeParams.category
    const paramSlug = routeParams.slug
    return (paramCategory === categorySlug || paramSlug === categorySlug)
      && (routeName === 'articles-category'
        || routeName === 'articles-subcategory'
        || routeName === 'article'
        || routeName === 'article-legacy')
  }

  return false
}
