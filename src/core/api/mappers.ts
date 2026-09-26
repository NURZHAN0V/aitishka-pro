import type {
  CmsBlockDocument,
  ComersCatalogSettings,
  ComersCategoryBrief,
  ComersCmsItem,
  ComersCreateRequestPayload,
  ComersCreateRequestResult,
  ComersNavItem,
} from '@/core/api/types.comers'
import type {
  Category,
  CategoryRef,
  CreateRequestPayload,
  CreateRequestResult,
  NavItem,
  Post,
  PostSummary,
  SiteConfig,
  Taxonomy,
} from '@/index.d'
import { resolveMediaUrl } from '@/core/api/http'

const EMPTY_CATEGORY: CategoryRef = { slug: '', name: '' }

function firstCategory(categories?: ComersCategoryBrief[]): CategoryRef {
  const item = categories?.[0]
  if (!item)
    return EMPTY_CATEGORY
  return { slug: item.slug, name: item.name }
}

function coverUrl(item: ComersCmsItem): string {
  const first = item.cover_media?.[0]?.url
  return first ? resolveMediaUrl(first) : '/media/cover.webp'
}

function parseBlocks(raw: ComersCmsItem['content_blocks']): CmsBlockDocument | undefined {
  if (!raw || typeof raw !== 'object')
    return undefined
  if (!Array.isArray(raw.blocks))
    return undefined
  return {
    version: typeof raw.version === 'number' ? raw.version : 1,
    blocks: raw.blocks,
  }
}

export function mapCmsItemToPostSummary(item: ComersCmsItem): PostSummary {
  const category = firstCategory(item.categories)
  return {
    id: String(item.id),
    slug: item.slug,
    title: item.title,
    meta: {
      description: item.seo_description || item.excerpt || '',
      tags: item.tags,
      ogTitle: item.seo_title || item.title,
      ogDescription: item.seo_description || item.excerpt || '',
      ogImage: coverUrl(item) !== '/media/cover.webp' ? coverUrl(item) : undefined,
    },
    cover: coverUrl(item),
    category,
    subcategory: EMPTY_CATEGORY,
    url: `/articles/${item.slug}`,
    publishedAt: item.publish_at ?? undefined,
    views: 0,
  }
}

export function mapCmsItemToPost(item: ComersCmsItem): Post {
  const summary = mapCmsItemToPostSummary(item)
  return {
    ...summary,
    body: item.content_md || '',
    contentBlocks: parseBlocks(item.content_blocks),
    excerpt: item.excerpt,
  }
}

export function mapCmsPageToPost(item: ComersCmsItem): Post {
  const post = mapCmsItemToPost(item)
  return {
    ...post,
    url: `/pages/${item.slug}`,
    category: EMPTY_CATEGORY,
    subcategory: EMPTY_CATEGORY,
  }
}

export function taxonomyFromArticles(items: ComersCmsItem[]): Taxonomy {
  const bySlug = new Map<string, Category>()
  for (const item of items) {
    for (const cat of item.categories ?? []) {
      if (!bySlug.has(cat.slug)) {
        bySlug.set(cat.slug, {
          slug: cat.slug,
          name: cat.name,
          subcategories: [],
        })
      }
    }
  }
  return { categories: [...bySlug.values()] }
}

function mapNavUrl(url: string): string {
  if (!url)
    return '/'
  if (/^https?:\/\//i.test(url))
    return url
  return url.startsWith('/') ? url : `/${url}`
}

function mapNavItems(items: ComersNavItem[]): NavItem[] {
  return items.map(item => ({
    label: item.label,
    to: mapNavUrl(item.url),
  }))
}

function socialFromSettings(settings: ComersCatalogSettings): SiteConfig['contact']['social'] {
  const socials = settings.general.socials ?? {}
  const out: SiteConfig['contact']['social'] = []
  if (socials.vk)
    out.push({ label: 'ВКонтакте', url: socials.vk, icon: 'vk' })
  if (socials.telegram)
    out.push({ label: 'Telegram', url: socials.telegram, icon: 'telegram' })
  if (socials.youtube)
    out.push({ label: 'YouTube', url: socials.youtube, icon: 'youtube' })
  if (socials.max)
    out.push({ label: 'MAX', url: socials.max, icon: 'max' })
  return out
}

/** Собирает SiteConfig из catalog/settings; локальные поля (benefits, tests) подмешиваются с fallback. */
export function mapCatalogSettingsToSite(
  settings: ComersCatalogSettings,
  localFallback?: Partial<SiteConfig>,
): SiteConfig {
  const general = settings.general
  const seo = settings.seo
  const header = settings.storefront?.header_top ?? []

  return {
    title: general.name || localFallback?.title || 'AITISHKAPRO',
    url: general.domain
      ? (general.domain.startsWith('http') ? general.domain : `https://${general.domain}`)
      : (localFallback?.url || 'https://aitishka.pro'),
    description: seo.description || general.description || localFallback?.description || '',
    navigation: header.length ? mapNavItems(header) : (localFallback?.navigation ?? []),
    benefits: localFallback?.benefits ?? [],
    technologies: localFallback?.technologies ?? [],
    about: localFallback?.about ?? {
      title: 'О нас',
      lead: '',
      paragraphs: [],
      features: [],
    },
    media: localFallback?.media ?? { title: 'Видео', lead: '' },
    contact: {
      lead: localFallback?.contact?.lead || 'Свяжитесь с нами.',
      phone: general.phone || localFallback?.contact?.phone || '',
      email: general.email || localFallback?.contact?.email || '',
      address: [general.city, general.address].filter(Boolean).join(', ')
        || localFallback?.contact?.address
        || '',
      social: socialFromSettings(settings).length
        ? socialFromSettings(settings)
        : (localFallback?.contact?.social ?? []),
    },
    news: localFallback?.news ?? { title: 'Новости', lead: '' },
    testQuestions: localFallback?.testQuestions ?? {} as SiteConfig['testQuestions'],
    skillLabels: localFallback?.skillLabels ?? {} as SiteConfig['skillLabels'],
  }
}

export function mapCreateRequestPayload(payload: CreateRequestPayload): ComersCreateRequestPayload {
  return {
    kind: payload.kind,
    name: payload.name,
    phone: payload.phone,
    consent: payload.consent,
    source_url: payload.sourceUrl,
    title: payload.title,
  }
}

export function mapCreateRequestResult(data: ComersCreateRequestResult): CreateRequestResult {
  return {
    id: data.id,
    number: data.number,
    status: data.status,
  }
}
