import type { Video, VideoCatalog, VideoItem, VideoPlaylist } from '@/index.d'

function attachPlaylist(video: VideoItem, playlist: VideoPlaylist): Video {
  return {
    ...video,
    playlist: {
      id: playlist.id,
      slug: playlist.slug,
      title: playlist.title,
      order: video.order ?? 0,
    },
  }
}

export function flattenVideoCatalog(catalog: VideoCatalog): Video[] {
  const fromPlaylists = catalog.playlists.flatMap(playlist =>
    playlist.videos.map(video => attachPlaylist(video, playlist)),
  )

  return [...fromPlaylists, ...catalog.videos]
}

export function buildVideoCatalogFromFlat(videos: Video[]): VideoCatalog {
  const standalone: VideoItem[] = []
  const playlistMap = new Map<string, VideoPlaylist>()

  for (const video of videos) {
    const { playlist, ...item } = video

    if (playlist?.id) {
      if (!playlistMap.has(playlist.id)) {
        playlistMap.set(playlist.id, {
          id: playlist.id,
          slug: playlist.slug || playlist.id,
          title: playlist.title,
          thumbnailUrl: item.thumbnailUrl,
          publishedAt: item.publishedAt,
          videos: [],
        })
      }

      playlistMap.get(playlist.id)!.videos.push({
        ...item,
        order: playlist.order ?? item.order,
      })
      continue
    }

    standalone.push(item)
  }

  return {
    playlists: [...playlistMap.values()].map(playlist => ({
      ...playlist,
      videos: [...playlist.videos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    })),
    videos: standalone,
  }
}

export function collectVideoSlugs(catalog: VideoCatalog): string[] {
  const slugs = catalog.videos.map(video => video.slug)

  for (const playlist of catalog.playlists)
    slugs.push(...playlist.videos.map(video => video.slug))

  return slugs
}

export function normalizeVideoCatalog(data: VideoCatalog | Video[]): VideoCatalog {
  if (Array.isArray(data))
    return buildVideoCatalogFromFlat(data)

  return {
    playlists: data.playlists ?? [],
    videos: data.videos ?? [],
  }
}
