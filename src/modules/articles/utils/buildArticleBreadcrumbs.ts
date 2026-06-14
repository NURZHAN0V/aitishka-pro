import type { BreadcrumbItem, Post } from '@/index.d'
import { NEWS_CATEGORY_SLUG } from '@/modules/news/constants'

export function buildArticleBreadcrumbs(post: Post): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = []

  if (post.category.slug === NEWS_CATEGORY_SLUG) {
    items.push({ label: 'Новости', to: '/news' })
  }
  else {
    items.push({ label: 'Статьи', to: '/articles' })

    if (post.category?.slug)
      items.push({ label: post.category.name, to: `/articles/${post.category.slug}` })

    if (post.subcategory?.slug)
      items.push({ label: post.subcategory.name, to: `/articles/${post.category.slug}/${post.subcategory.slug}` })
  }

  items.push({ label: post.title })

  return items
}
