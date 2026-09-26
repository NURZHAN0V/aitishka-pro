import type {
  BuildInfo,
  CreateRequestPayload,
  CreateRequestResult,
  Post,
  PostSummary,
  SiteConfig,
  Taxonomy,
  Video,
  VideoCatalog,
  VideoTaxonomy,
} from '@/index.d'
import { comersApi, setComersSiteFallback } from '@/core/api/comersCms'
import { configureComersHttp } from '@/core/api/http'
import { localApi } from '@/core/api/localApi'

export type ContentSource = 'local' | 'comers'

function resolveContentSource(): ContentSource {
  const raw = (import.meta.env.VITE_CONTENT_SOURCE || 'local').trim().toLowerCase()
  return raw === 'comers' ? 'comers' : 'local'
}

let source: ContentSource = 'local'

export function getContentSource(): ContentSource {
  return source
}

export const api = {
  init() {
    source = resolveContentSource()
    if (source === 'comers') {
      const base = (import.meta.env.VITE_COMERS_API_URL || '').trim()
      const key = (import.meta.env.VITE_COMERS_STOREFRONT_KEY || '').trim()
      configureComersHttp(base, key)

      // Soft-load local site.json for benefits / tests / about fallback when CMS has no equivalent
      void localApi.getSite().then(setComersSiteFallback).catch(() => {
        // local content optional in comers-only deploys
      })
    }
  },

  async getSite(): Promise<SiteConfig> {
    if (source === 'comers')
      return comersApi.getSite()
    return localApi.getSite()
  },

  async getTaxonomy(): Promise<Taxonomy> {
    if (source === 'comers')
      return comersApi.getTaxonomy()
    return localApi.getTaxonomy()
  },

  async getVideoTaxonomy(): Promise<VideoTaxonomy> {
    // Videos stay on local JSON until CMS has a video content type
    return localApi.getVideoTaxonomy()
  },

  async getPosts(): Promise<PostSummary[]> {
    if (source === 'comers')
      return comersApi.getPosts()
    return localApi.getPosts()
  },

  async getPost(slug: string): Promise<Post | null> {
    if (source === 'comers')
      return comersApi.getPost(slug)
    return localApi.getPost(slug)
  },

  async getPage(slug: string): Promise<Post | null> {
    if (source === 'comers')
      return comersApi.getPage(slug)
    return localApi.getPage(slug)
  },

  async getVideoCatalog(): Promise<VideoCatalog> {
    return localApi.getVideoCatalog()
  },

  async getVideos(): Promise<Video[]> {
    return localApi.getVideos()
  },

  async getBuildInfo(): Promise<BuildInfo> {
    return localApi.getBuildInfo()
  },

  async createRequest(payload: CreateRequestPayload): Promise<CreateRequestResult> {
    if (source === 'comers')
      return comersApi.createRequest(payload)
    return localApi.createRequest(payload)
  },
}
