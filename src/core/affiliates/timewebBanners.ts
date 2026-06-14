export type AffiliatePartnerId = 'cloud' | 'host'

export type BannerFormat = 'sidebar' | 'leaderboard' | 'inline' | 'badge'

export interface BannerAsset {
  src: string
  width: number
  height: number
  media?: string
}

export interface AffiliatePartner {
  id: AffiliatePartnerId
  shortUrl: string
  label: string
  alt: string
  ariaLabel: string
  assets: Partial<Record<BannerFormat, BannerAsset | BannerAsset[]>>
}

export const TIMEWEB_BANNERS_CDN = 'https://wm.timeweb.ru/images/posters'

export const TIMEWEB_CLOUD: AffiliatePartner = {
  id: 'cloud',
  shortUrl: '/twcloud',
  label: 'Timeweb Cloud',
  alt: 'Timeweb Cloud — облачный хостинг',
  ariaLabel: 'Timeweb Cloud — перейти на сайт',
  assets: {
    sidebar: {
      src: `${TIMEWEB_BANNERS_CDN}/180x320/180x320-5.jpg`,
      width: 180,
      height: 320,
    },
    inline: {
      src: `${TIMEWEB_BANNERS_CDN}/300x250/300x250-26.jpg`,
      width: 300,
      height: 250,
    },
  },
}

export const TIMEWEB_HOST: AffiliatePartner = {
  id: 'host',
  shortUrl: '/twhost',
  label: 'Timeweb',
  alt: 'Timeweb — виртуальный хостинг',
  ariaLabel: 'Timeweb — перейти на сайт',
  assets: {
    leaderboard: [
      {
        src: `${TIMEWEB_BANNERS_CDN}/728x90/728x90-14.jpg`,
        width: 728,
        height: 90,
        media: '(min-width: 1024px)',
      },
      {
        src: `${TIMEWEB_BANNERS_CDN}/600x90/600x90-7.jpg`,
        width: 600,
        height: 90,
        media: '(min-width: 768px)',
      },
      {
        src: `${TIMEWEB_BANNERS_CDN}/468x60/468x60-7.jpg`,
        width: 468,
        height: 60,
      },
    ],
    badge: {
      src: `${TIMEWEB_BANNERS_CDN}/168x31/168x31-1.jpg`,
      width: 168,
      height: 31,
    },
  },
}

export const AFFILIATE_PARTNERS: Record<AffiliatePartnerId, AffiliatePartner> = {
  cloud: TIMEWEB_CLOUD,
  host: TIMEWEB_HOST,
}

export function getBannerAssets(partner: AffiliatePartnerId, format: BannerFormat): BannerAsset[] {
  const raw = AFFILIATE_PARTNERS[partner].assets[format]
  if (!raw)
    return []
  return Array.isArray(raw) ? raw : [raw]
}
