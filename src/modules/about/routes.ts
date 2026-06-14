export const aboutRoutes = [
  {
    path: '/about',
    name: 'about',
    component: () => import('@/modules/about/views/AboutView.vue'),
    meta: { title: 'О нас' },
  },
]
