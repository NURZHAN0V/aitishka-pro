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
  {
    path: '/aitun',
    name: 'redirect-aitun',
    component: () => import('@/core/views/ExternalRedirectView.vue'),
    meta: {
      title: 'AUTUNNEL',
      redirectUrl: TIMEWEB_AFFILIATE_URLS.aitun,
    },
  },
  {
    path: '/max',
    name: 'redirect-max',
    component: () => import('@/core/views/ExternalRedirectView.vue'),
    meta: {
      title: 'MAX',
      redirectUrl: 'https://max.ru/join/MnmYbwZYJBbjSr6uAIc_Fero_JOxXO066R1TKCjvOSs',
    },
  },
]
