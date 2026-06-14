export const newsRoutes = [
  {
    path: '/news',
    name: 'news',
    component: () => import('@/modules/news/views/NewsView.vue'),
    meta: { title: 'Новости' },
  },
]
