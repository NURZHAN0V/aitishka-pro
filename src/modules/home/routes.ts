export const homeRoutes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/modules/home/views/HomeView.vue'),
    meta: {
      title: 'Главная',
      description: 'Обучение разработке с нуля — статьи, видео и практика по Git, HTML, CSS, JavaScript.',
    },
  },
]
