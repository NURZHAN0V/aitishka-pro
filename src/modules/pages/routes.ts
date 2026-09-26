export const pagesRoutes = [
  {
    path: '/pages/:slug',
    name: 'cms-page',
    component: () => import('@/modules/pages/views/CmsPageView.vue'),
    meta: { title: 'Страница' },
  },
]
