import type { RouteRecordRaw } from 'vue-router'

export const redirectRoutes: RouteRecordRaw[] = [
  {
    path: '/twcloud',
    name: 'redirect-twcloud',
    component: () => import('@/core/views/ExternalRedirectView.vue'),
    meta: {
      title: 'Timeweb Cloud',
      redirectUrl: 'https://timeweb.cloud/?i=142338',
    },
  },
  {
    path: '/twhost',
    name: 'redirect-twhost',
    component: () => import('@/core/views/ExternalRedirectView.vue'),
    meta: {
      title: 'Timeweb',
      redirectUrl: 'https://timeweb.com/ru/?i=142338',
    },
  },
]
