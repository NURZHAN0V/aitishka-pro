export const contactRoutes = [
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/modules/contact/views/ContactView.vue'),
    meta: { title: 'Контакты' },
  },
]
