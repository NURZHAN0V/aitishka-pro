import type { BreadcrumbItem, CategoryRef, Video } from '@/index.d'
import { resolveVideoCategoryName } from '@/modules/media/utils/buildVideoCategoryChips'

export function buildVideoBreadcrumbs(
  video: Video,
  categories: CategoryRef[],
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'Видео', to: '/media' },
  ]

  if (video.category?.trim()) {
    items.push({
      label: resolveVideoCategoryName(video.category, categories),
      to: `/media?category=${video.category}`,
    })
  }

  items.push({ label: video.title })

  return items
}
