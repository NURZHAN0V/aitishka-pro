import type { BuildInfo, Post, PostSummary, SiteConfig, Taxonomy, Video, VideoCatalog, VideoTaxonomy } from '@/index.d'
import { flattenVideoCatalog, normalizeVideoCatalog } from '@/core/content/videoCatalog'

const CONTENT_BASE = '/content'

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok)
    throw new Error(`Failed to fetch ${path}: ${response.status}`)
  return response.json() as Promise<T>
}

export const api = {
  init() {
    // Reserved for future interceptors
  },

  async getSite(): Promise<SiteConfig> {
    return fetchJson<SiteConfig>(`${CONTENT_BASE}/site.json`)
  },

  async getTaxonomy(): Promise<Taxonomy> {
    return fetchJson<Taxonomy>(`${CONTENT_BASE}/taxonomy.json`)
  },

  async getVideoTaxonomy(): Promise<VideoTaxonomy> {
    return fetchJson<VideoTaxonomy>(`${CONTENT_BASE}/video-taxonomy.json`)
  },

  async getPosts(): Promise<PostSummary[]> {
    return fetchJson<PostSummary[]>(`${CONTENT_BASE}/posts/index.json`)
  },

  async getPost(slug: string): Promise<Post | null> {
    try {
      return await fetchJson<Post>(`${CONTENT_BASE}/posts/${slug}.json`)
    }
    catch {
      return null
    }
  },

  async getVideoCatalog(): Promise<VideoCatalog> {
    const data = await fetchJson<VideoCatalog | Video[]>(`${CONTENT_BASE}/videos.json`)
    return normalizeVideoCatalog(data)
  },

  async getVideos(): Promise<Video[]> {
    const catalog = await this.getVideoCatalog()
    return flattenVideoCatalog(catalog)
  },

  async getBuildInfo(): Promise<BuildInfo> {
    return fetchJson<BuildInfo>('/build.json')
  },
}
