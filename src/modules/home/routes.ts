export const HOME_PAGE_TITLE = 'Айтишка — обучение разработке'
export const HOME_PAGE_DESCRIPTION = 'Образовательная платформа «Айтишка» (AITISHKAPRO): статьи, видео и практика по программированию. Раньше — pluspixel.ru.'

export const homeRoutes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/modules/home/views/HomeView.vue'),
    meta: {
      title: HOME_PAGE_TITLE,
      description: HOME_PAGE_DESCRIPTION,
    },
  },
]
