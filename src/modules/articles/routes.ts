export const articlesRoutes = [
  {
    path: '/articles',
    name: 'articles',
    component: () => import('@/modules/articles/views/ArticlesListView.vue'),
    meta: { title: 'Статьи', description: 'Учебные материалы и полезные статьи по веб-разработке.' },
  },
  {
    path: '/articles/:category',
    name: 'articles-category',
    component: () => import('@/modules/articles/views/CategoryView.vue'),
    meta: { title: 'Статьи' },
  },
  {
    path: '/articles/:category/:subcategory',
    name: 'articles-subcategory',
    component: () => import('@/modules/articles/views/SubcategoryView.vue'),
    meta: { title: 'Статьи' },
  },
  {
    path: '/articles/:category/:subcategory/:slug',
    name: 'article',
    component: () => import('@/modules/articles/views/ArticleView.vue'),
    meta: { title: 'Статья' },
  },
]
