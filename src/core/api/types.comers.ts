/** DTO публичного API Коммерсантика (snake_case как в JSON). */

export interface ComersMediaItem {
  id: number
  url: string
  width?: number
  height?: number
}

export interface ComersCategoryBrief {
  id: number
  name: string
  slug: string
}

export interface ComersCmsItem {
  id: number
  title: string
  slug: string
  excerpt: string
  content_md?: string
  content_blocks?: CmsBlockDocument | null
  cover_media?: ComersMediaItem[]
  status: string
  publish_at: string | null
  seo_title: string
  seo_description: string
  seo_keywords: string
  tags?: string[]
  categories?: ComersCategoryBrief[]
  updated_at: string
}

export interface ComersCmsListResponse {
  items: ComersCmsItem[]
  total: number
  page: number
  page_size: number
}

export interface CmsBlockDocument {
  version: number
  blocks: CmsBlock[]
}

export interface CmsBlock {
  type: string
  attrs?: Record<string, unknown>
}

export interface ComersNavItem {
  label: string
  url: string
  type?: string
}

export interface ComersFooterGroup {
  title: string
  items: ComersNavItem[]
}

export interface ComersCatalogSettings {
  general: {
    name: string
    slogan: string
    description: string
    domain: string
    phone: string
    email: string
    city: string
    address: string
    socials?: {
      vk?: string
      telegram?: string
      youtube?: string
      max?: string
    }
  }
  seo: {
    title?: string
    description?: string
    keywords?: string
    og_image?: string
  }
  storefront: {
    header_top: ComersNavItem[]
    footer_main: ComersFooterGroup[]
  }
}

export interface ComersCreateRequestPayload {
  kind: string
  name: string
  phone: string
  consent: boolean
  source_url: string
  title: string
}

export interface ComersCreateRequestResult {
  id: number
  number: string
  status: string
}
