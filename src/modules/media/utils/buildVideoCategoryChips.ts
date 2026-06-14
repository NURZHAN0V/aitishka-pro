import type { LocationQuery } from 'vue-router'
import type { CategoryRef, Video } from '@/index.d'
import type { CategoryChip } from '@/modules/articles/utils/buildCategoryChips'

export function isMediaSection(routeName: string | symbol | null | undefined): boolean {
  return routeName === 'media' || routeName === 'media-video'
}

export function resolveVideoCategoryName(slug: string, categories: CategoryRef[]): string {
  return categories.find(category => category.slug === slug)?.name ?? slug
}

export function buildVideoCategoryChips(categories: CategoryRef[], videos: Video[]): CategoryChip[] {
  const usedSlugs = new Set(
    videos.map(video => video.category).filter((slug): slug is string => Boolean(slug?.trim())),
  )

  const chips: CategoryChip[] = [
    { id: 'media-all', label: 'Все', to: '/media', kind: 'all' },
  ]

  for (const category of categories) {
    if (!usedSlugs.has(category.slug))
      continue

    chips.push({
      id: `video-cat-${category.slug}`,
      label: category.name,
      to: `/media?category=${category.slug}`,
      kind: 'video-category',
    })
  }

  return chips
}

export function isVideoCategoryChipActive(
  chip: CategoryChip,
  routeName: string | symbol | null | undefined,
  routeParams: Record<string, string | string[]>,
  routeQuery: LocationQuery,
  videos: Video[],
): boolean {
  if (chip.kind === 'all')
    return routeName === 'media' && !routeQuery.category

  if (chip.kind !== 'video-category')
    return false

  const chipSlug = new URL(chip.to, 'http://local').searchParams.get('category')
  if (!chipSlug)
    return false

  if (routeName === 'media')
    return typeof routeQuery.category === 'string' && routeQuery.category === chipSlug

  if (routeName === 'media-video') {
    const slug = routeParams.slug
    if (typeof slug !== 'string')
      return false

    const video = videos.find(item => item.slug === slug)
    return video ? video.category === chipSlug : false
  }

  return false
}
