import type { Video } from '@/index.d'

export function sortVideosByDate(videos: Video[]) {
  return [...videos].sort((a, b) => {
    const dateA = a.publishedAt ? Date.parse(a.publishedAt) : 0
    const dateB = b.publishedAt ? Date.parse(b.publishedAt) : 0
    return dateB - dateA
  })
}

export function getVideoBySlug(videos: Video[], slug: string) {
  return videos.find(video => video.slug === slug) ?? null
}

export function sortPlaylistVideos(videos: Video[]) {
  return [...videos].sort((a, b) => {
    const orderA = a.playlist?.order ?? a.order ?? Number.MAX_SAFE_INTEGER
    const orderB = b.playlist?.order ?? b.order ?? Number.MAX_SAFE_INTEGER
    if (orderA !== orderB)
      return orderA - orderB

    const dateA = a.publishedAt ? Date.parse(a.publishedAt) : 0
    const dateB = b.publishedAt ? Date.parse(b.publishedAt) : 0
    return dateA - dateB
  })
}

export function getSidebarVideos(videos: Video[], current: Video) {
  if (current.playlist?.id) {
    const playlistVideos = sortPlaylistVideos(
      videos.filter(video => video.playlist?.id === current.playlist?.id),
    )

    return {
      title: current.playlist.title,
      isPlaylist: true,
      videos: playlistVideos,
    }
  }

  return {
    title: 'Последние видео',
    isPlaylist: false,
    videos: sortVideosByDate(videos.filter(video => video.id !== current.id)),
  }
}
