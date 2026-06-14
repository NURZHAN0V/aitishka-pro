import { createRouter, createWebHistory } from 'vue-router'
import { trackYandexMetrikaHit } from '@/core/analytics/yandexMetrika'
import { aboutRoutes } from '@/modules/about/routes'
import { articlesRoutes } from '@/modules/articles/routes'
import { contactRoutes } from '@/modules/contact/routes'
import { homeRoutes } from '@/modules/home/routes'
import { mediaRoutes } from '@/modules/media/routes'
import { newsRoutes } from '@/modules/news/routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...homeRoutes,
    ...aboutRoutes,
    ...contactRoutes,
    ...articlesRoutes,
    ...mediaRoutes,
    ...newsRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/modules/home/views/NotFoundView.vue'),
      meta: { title: 'Страница не найдена' },
    },
  ],
  scrollBehavior(to, from) {
    const articlesFilter = to.path.startsWith('/articles') && from.path.startsWith('/articles')
    const mediaFilter = to.name === 'media' && from.name === 'media'

    if (articlesFilter || mediaFilter)
      return false

    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : 'AITISHKAPRO'
  document.title = `${title} — AITISHKAPRO`

  const description = typeof to.meta.description === 'string' ? to.meta.description : ''
  let meta = document.querySelector('meta[name="description"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'description')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', description || 'Обучение разработке с нуля — статьи, видео и практика.')

  trackYandexMetrikaHit(to.fullPath, document.title)
})

export default router
