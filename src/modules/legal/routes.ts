export const legalRoutes = [
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/modules/legal/views/PrivacyView.vue'),
    meta: {
      title: 'Политика конфиденциальности',
      description: 'Политика обработки персональных данных сайта aitishka.pro в соответствии с законодательством РФ.',
    },
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('@/modules/legal/views/TermsView.vue'),
    meta: {
      title: 'Пользовательское соглашение',
      description: 'Условия использования образовательной платформы AITISHKAPRO (aitishka.pro).',
    },
  },
]
