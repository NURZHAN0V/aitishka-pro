export const drawRoutes = [
  {
    path: '/draw',
    name: 'draw',
    component: () => import('@/modules/draw/views/DrawView.vue'),
    meta: {
      layout: 'draw',
      title: 'Рисовалка',
      description: 'Пиксельный редактор: рисуйте по клеточкам, слои, кадры и анимацию. Черновик хранится в IndexedDB вашего браузера.',
    },
  },
]
