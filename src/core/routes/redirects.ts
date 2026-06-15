import type { RouteRecordRaw } from 'vue-router'

import { TIMEWEB_AFFILIATE_URLS } from '@/core/affiliates/timewebBanners'

export const redirectRoutes: RouteRecordRaw[] = [
  {
    path: '/twcloud',
    name: 'redirect-twcloud',
    component: () => import('@/core/views/ExternalRedirectView.vue'),
    meta: {
      title: 'Timeweb Cloud',
      redirectUrl: TIMEWEB_AFFILIATE_URLS.cloud,
    },
  },
  {
    path: '/twhost',
    name: 'redirect-twhost',
    component: () => import('@/core/views/ExternalRedirectView.vue'),
    meta: {
      title: 'Timeweb',
      redirectUrl: TIMEWEB_AFFILIATE_URLS.host,
    },
  },
]
