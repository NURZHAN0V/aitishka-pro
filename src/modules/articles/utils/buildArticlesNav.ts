import type { Category, NavSubItem } from '@/index.d'
import { NEWS_CATEGORY_SLUG } from '@/modules/news/constants'

export const ARTICLES_NAV_LIMIT = 5

export function buildArticlesNavChildren(categories: Category[], limit = ARTICLES_NAV_LIMIT) {
  const articleCategories = categories.filter(c => c.slug !== NEWS_CATEGORY_SLUG)
  const items: NavSubItem[] = articleCategories.slice(0, limit).map(category => ({
    label: category.name,
    to: `/articles/${category.slug}`,
    children: category.subcategories.length
      ? category.subcategories.map(sub => ({
          label: sub.name,
          to: `/articles/${category.slug}/${sub.slug}`,
        }))
      : undefined,
  }))

  return {
    items,
    hasMore: articleCategories.length > limit,
  }
}
