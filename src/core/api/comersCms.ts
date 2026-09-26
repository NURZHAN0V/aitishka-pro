import type { ComersCatalogSettings, ComersCmsItem, ComersCmsListResponse, ComersCreateRequestResult } from '@/core/api/types.comers'
import type {
  CreateRequestPayload,
  CreateRequestResult,
  Post,
  PostSummary,
  SiteConfig,
  Taxonomy,
} from '@/index.d'
import { comersFetch } from '@/core/api/http'
import {
  mapCatalogSettingsToSite,
  mapCmsItemToPost,
  mapCmsItemToPostSummary,
  mapCmsPageToPost,
  mapCreateRequestPayload,
  mapCreateRequestResult,
  taxonomyFromArticles,
} from '@/core/api/mappers'

const PAGE_SIZE = 50

async function fetchAllArticles(): Promise<ComersCmsItem[]> {
  const first = await comersFetch<ComersCmsListResponse>(`/api/cms/articles?page=1&page_size=${PAGE_SIZE}`)
  const items = [...(first.items ?? [])]
  const total = first.total ?? items.length
  const pageSize = first.page_size || PAGE_SIZE
  const pages = Math.max(1, Math.ceil(total / pageSize))

  for (let page = 2; page <= pages; page++) {
    const next = await comersFetch<ComersCmsListResponse>(`/api/cms/articles?page=${page}&page_size=${pageSize}`)
    items.push(...(next.items ?? []))
  }

  return items
}

let siteFallback: Partial<SiteConfig> | undefined

export function setComersSiteFallback(fallback: Partial<SiteConfig>) {
  siteFallback = fallback
}

export const comersApi = {
  async getSite(): Promise<SiteConfig> {
    const settings = await comersFetch<ComersCatalogSettings>('/api/catalog/settings')
    return mapCatalogSettingsToSite(settings, siteFallback)
  },

  async getTaxonomy(): Promise<Taxonomy> {
    const items = await fetchAllArticles()
    return taxonomyFromArticles(items)
  },

  async getPosts(): Promise<PostSummary[]> {
    const items = await fetchAllArticles()
    return items.map(mapCmsItemToPostSummary)
  },

  async getPost(slug: string): Promise<Post | null> {
    try {
      const item = await comersFetch<ComersCmsItem>(`/api/cms/articles/${encodeURIComponent(slug)}`)
      return mapCmsItemToPost(item)
    }
    catch (error) {
      if (error && typeof error === 'object' && 'status' in error && (error as { status: number }).status === 404)
        return null
      throw error
    }
  },

  async getPage(slug: string): Promise<Post | null> {
    try {
      const item = await comersFetch<ComersCmsItem>(`/api/cms/pages/${encodeURIComponent(slug)}`)
      return mapCmsPageToPost(item)
    }
    catch (error) {
      if (error && typeof error === 'object' && 'status' in error && (error as { status: number }).status === 404)
        return null
      throw error
    }
  },

  async createRequest(payload: CreateRequestPayload): Promise<CreateRequestResult> {
    const body = mapCreateRequestPayload(payload)
    const result = await comersFetch<ComersCreateRequestResult>('/api/requests', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return mapCreateRequestResult(result)
  },
}
