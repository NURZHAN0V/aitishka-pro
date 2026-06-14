import type { BreadcrumbItem, Taxonomy } from '@/index.d'

export function buildCategoryBreadcrumbs(
  taxonomy: Taxonomy,
  categorySlug: string,
): BreadcrumbItem[] {
  const category = taxonomy.categories.find(c => c.slug === categorySlug)

  return [
    { label: 'Статьи', to: '/articles' },
    { label: category?.name || categorySlug },
  ]
}

export function buildSubcategoryBreadcrumbs(
  taxonomy: Taxonomy,
  categorySlug: string,
  subcategorySlug: string,
): BreadcrumbItem[] {
  const category = taxonomy.categories.find(c => c.slug === categorySlug)
  const subcategory = category?.subcategories.find(s => s.slug === subcategorySlug)

  return [
    { label: 'Статьи', to: '/articles' },
    { label: category?.name || categorySlug, to: `/articles/${categorySlug}` },
    { label: subcategory?.name || subcategorySlug },
  ]
}
