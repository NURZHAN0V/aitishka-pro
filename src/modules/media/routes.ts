export const mediaRoutes = [
  {
    path: '/media',
    name: 'media',
    component: () => import('@/modules/media/views/MediaView.vue'),
    meta: { title: 'Видео', description: 'Учебные видео по программированию и смежным темам.' },
  },
  {
    path: '/media/:slug',
    name: 'media-video',
    component: () => import('@/modules/media/views/VideoView.vue'),
    meta: { title: 'Видео' },
  },
]
