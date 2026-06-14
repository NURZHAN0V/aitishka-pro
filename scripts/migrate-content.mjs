/**
 * Migrates content from cms.pluspixel.ru (Strapi) to local JSON files.
 * Run: pnpm migrate
 */
import {
  createWriteStream,
  mkdirSync,
  writeFileSync,
} from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const STRAPI_BASE = process.env.STRAPI_API_BASE || 'https://cms.pluspixel.ru/api'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || process.env.NUXT_STRAPI_API_TOKEN || ''
const MEDIA_DIR = join(root, 'public', 'media')
const CONTENT_DIR = join(root, 'content')
const POSTS_DIR = join(CONTENT_DIR, 'posts')

const downloadedMedia = new Map()

function extractSlug(entity) {
  if (!entity)
    return ''
  const attrs = entity.attributes || entity
  return attrs.slug || ''
}

function extractName(entity) {
  if (!entity)
    return ''
  const attrs = entity.attributes || entity
  return attrs.name || ''
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
}

async function fetchStrapi(path, retries = 3) {
  const headers = {}
  if (STRAPI_TOKEN)
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${STRAPI_BASE}${path}`, { headers })
      if (!res.ok)
        throw new Error(`${res.status} ${res.statusText}`)
      return res.json()
    }
    catch (err) {
      if (i === retries - 1)
        throw err
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
}

async function downloadMedia(url) {
  if (!url || typeof url !== 'string')
    return '/media/cover.webp'

  if (url.startsWith('/media/'))
    return url

  let remoteUrl = url
  if (url.startsWith('/uploads/')) {
    remoteUrl = `https://cms.pluspixel.ru${url}`
  }
  else if (!url.startsWith('http')) {
    const uploadsIdx = url.indexOf('/uploads/')
    if (uploadsIdx !== -1)
      remoteUrl = `https://cms.pluspixel.ru${url.slice(uploadsIdx).split('?')[0]}`
  }

  if (downloadedMedia.has(remoteUrl))
    return downloadedMedia.get(remoteUrl)

  try {
    const res = await fetch(remoteUrl)
    if (!res.ok)
      return '/media/cover.webp'

    const ext = extname(new URL(remoteUrl).pathname) || '.webp'
    const hash = Buffer.from(remoteUrl).toString('base64url').slice(0, 16)
    const filename = `${hash}${ext}`
    const localPath = `/media/${filename}`
    const dest = join(MEDIA_DIR, filename)

    mkdirSync(MEDIA_DIR, { recursive: true })
    await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
    downloadedMedia.set(remoteUrl, localPath)
    return localPath
  }
  catch {
    return '/media/cover.webp'
  }
}

function normalizeCoverUrl(cover) {
  if (!cover)
    return null
  if (typeof cover === 'string')
    return cover
  const url = cover?.data?.attributes?.url || cover?.url
  return url || null
}

function normalizePost(post) {
  const attrs = post.attributes || post
  const categoriesData = attrs.categories?.data ?? attrs.categories ?? []
  const subcategoriesData = attrs.subcategories?.data ?? attrs.subcategories ?? []
  const categories = Array.isArray(categoriesData) ? categoriesData : []
  const subcategories = Array.isArray(subcategoriesData) ? subcategoriesData : []

  const category = categories[0]
  const subcategory = subcategories[0]
  const categorySlug = extractSlug(category)
  const subcategorySlug = extractSlug(subcategory)
  const slug = attrs.slug || ''

  return {
    id: post.documentId || String(post.id || slug),
    slug,
    title: attrs.title || 'Без названия',
    description: attrs.description || '',
    body: attrs.body || '',
    cover: normalizeCoverUrl(attrs.cover),
    category: {
      slug: categorySlug,
      name: extractName(category),
    },
    subcategory: {
      slug: subcategorySlug,
      name: extractName(subcategory),
    },
    url: categorySlug && subcategorySlug && slug
      ? `/articles/${categorySlug}/${subcategorySlug}/${slug}`
      : `/articles/${slug}`,
    publishedAt: attrs.publishedAt,
    views: attrs.views || 0,
  }
}

function normalizeVideo(entity) {
  const attrs = entity.attributes || entity
  const embedCode = attrs.embedCode || ''
  let embedUrl = ''
  const srcMatch = embedCode.match(/src=["']([^"']+)["']/)
  if (srcMatch)
    embedUrl = srcMatch[1]

  return {
    id: entity.documentId || String(entity.id),
    slug: attrs.slug || String(entity.id),
    title: attrs.title || 'Без названия',
    excerpt: attrs.excerpt || attrs.description || '',
    embedUrl,
    thumbnailUrl: normalizeCoverUrl(attrs.thumbnail),
    duration: attrs.duration || '—',
    category: 'Видео',
    views: attrs.views || 0,
    publishedAt: attrs.publishedAt,
  }
}

const demoVideos = [
  {
    id: '1',
    slug: 'dzen-example',
    title: 'Пример видео из Дзена',
    excerpt: 'Встраивание видео через iframe (Дзен, YouTube и др.).',
    embedUrl: 'https://dzen.ru/embed/oOUYx_hcKAAA?from_block=partner&from=zen&mute=0&autoplay=0&tv=0',
    thumbnailUrl: 'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6979dbc253d8595cad514cce_6979dcbd7097eb06362e1346/scale_600',
    duration: '—',
    category: 'Видео',
    views: 0,
  },
  {
    id: '2',
    slug: 'git-intro',
    title: 'Введение в Git: первые шаги',
    excerpt: 'Установка, настройка и базовые команды для работы с репозиторием.',
    embedUrl: 'https://www.youtube.com/embed/8pDqJVdNa44',
    thumbnailUrl: null,
    duration: '12:40',
    category: 'Git',
    views: 0,
  },
  {
    id: '3',
    slug: 'html-basics',
    title: 'Основы HTML: структура документа',
    excerpt: 'Теги, семантика и базовая разметка страницы.',
    embedUrl: 'https://www.youtube.com/embed/8pDqJVdNa44',
    thumbnailUrl: null,
    duration: '18:20',
    category: 'HTML',
    views: 0,
  },
  {
    id: '4',
    slug: 'css-flexbox',
    title: 'CSS: Flexbox на практике',
    excerpt: 'Выравнивание и раскладка элементов с помощью Flexbox.',
    embedUrl: 'https://www.youtube.com/embed/8pDqJVdNa44',
    thumbnailUrl: null,
    duration: '22:15',
    category: 'CSS',
    views: 0,
  },
  {
    id: '5',
    slug: 'js-variables',
    title: 'JavaScript: переменные и типы данных',
    excerpt: 'let, const, примитивы и основы синтаксиса.',
    embedUrl: 'https://www.youtube.com/embed/8pDqJVdNa44',
    thumbnailUrl: null,
    duration: '25:00',
    category: 'JavaScript',
    views: 0,
  },
  {
    id: '6',
    slug: 'git-branches',
    title: 'Работа с ветками в Git',
    excerpt: 'Создание, переключение и слияние веток.',
    embedUrl: 'https://www.youtube.com/embed/8pDqJVdNa44',
    thumbnailUrl: null,
    duration: '15:30',
    category: 'Git',
    views: 0,
  },
  {
    id: '7',
    slug: 'css-responsive',
    title: 'Адаптивная вёрстка: медиазапросы',
    excerpt: 'Подстройка интерфейса под разные размеры экрана.',
    embedUrl: 'https://www.youtube.com/embed/8pDqJVdNa44',
    thumbnailUrl: null,
    duration: '20:45',
    category: 'CSS',
    views: 0,
  },
]

const siteJson = {
  title: 'AITISHKAPRO',
  url: 'https://aitishka.pro',
  description: 'Обучение разработке с нуля — статьи, видео и практика по Git, HTML, CSS, JavaScript.',
  navigation: [
    { label: 'Новости', to: '/news' },
    {
      label: 'Статьи',
      to: '/articles',
      children: [
        {
          label: 'Git',
          to: '/articles/git',
          children: [
            { label: 'Основы', to: '/articles/git/basics' },
            { label: 'Ветки', to: '/articles/git/branches' },
            { label: 'Рабочий процесс', to: '/articles/git/workflow' },
          ],
        },
        {
          label: 'HTML&CSS',
          to: '/articles/html-css',
          children: [
            { label: 'HTML', to: '/articles/html-css/html' },
            { label: 'CSS', to: '/articles/html-css/css' },
            { label: 'Адаптивность', to: '/articles/html-css/responsive' },
          ],
        },
        { label: 'JavaScript', to: '/articles/javascript' },
      ],
    },
    { label: 'Видео', to: '/media' },
    { label: 'О нас', to: '/about' },
    { label: 'Контакты', to: '/contact' },
  ],
  benefits: [
    { title: 'Статьи и гайды', text: 'Пошаговые материалы по Git, HTML, CSS, JavaScript и смежным темам.', icon: 'article', link: '/articles', linkText: 'Перейти к статьям' },
    { title: 'Видеоуроки', text: 'Разборы и уроки в видеоформате для наглядного обучения.', icon: 'video', link: '/media', linkText: 'Смотреть видео' },
    { title: 'Проверка уровня', text: 'Тесты по каждой технологии помогут оценить готовность к практике.', icon: 'graduation', link: '/articles', linkText: 'Пройти тест' },
    { title: 'Поддержка', text: 'Вопросы можно задать в Telegram — мы поможем разобраться.', icon: 'support', link: 'https://t.me/aitishka_pro', linkText: 'Написать в Telegram', external: true },
  ],
  technologies: [
    { id: 'git', label: 'Git', to: '/articles/git', color: '#EF4444', hoverColor: '#DC2626' },
    { id: 'html', label: 'HTML', to: '/articles/html-css/html', color: '#FB923C', hoverColor: '#F97316' },
    { id: 'css', label: 'CSS', to: '/articles/html-css/css', color: '#0284C7', hoverColor: '#0369A1' },
    { id: 'javascript', label: 'JavaScript', to: '/articles/javascript', color: '#FACC15', hoverColor: '#EAB308', textColor: '#0F0F0F' },
    { id: 'typescript', label: 'TypeScript', to: '/articles', color: '#2563EB', hoverColor: '#1D4ED8' },
    { id: 'nodejs', label: 'Node.js', to: '/articles', color: '#22C55E', hoverColor: '#16A34A' },
    { id: 'golang', label: 'Golang', to: '/articles', color: '#00ADD8', hoverColor: '#0096C7' },
    { id: 'flutter', label: 'Flutter', to: '/articles', color: '#02569B', hoverColor: '#014A82' },
  ],
  about: {
    title: 'О нас',
    lead: 'Узнайте больше о платформе AITISHKAPRO и нашей миссии.',
    paragraphs: [
      'AITISHKAPRO — образовательная платформа для разработчиков. Мы помогаем осваивать Git, HTML, CSS, JavaScript и смежные технологии через статьи, видео и практические материалы.',
      'Наша цель — давать структурированные знания и поддерживать вас на пути от основ до уверенной разработки. Материалы подходят как новичкам, так и тем, кто хочет систематизировать навыки.',
    ],
    features: [
      { title: 'Статьи и гайды', text: 'Пошаговые материалы по технологиям.', icon: 'article' },
      { title: 'Видеоуроки', text: 'Наглядные разборы и уроки.', icon: 'video' },
      { title: 'Практика', text: 'Тесты и задания для закрепления.', icon: 'graduation' },
    ],
  },
  contact: {
    phone: '+7 (999) 999-99-99',
    email: 'info@aitishka.pro',
    address: 'Россия',
    social: [
      { label: 'Telegram', url: 'https://t.me/aitishka_pro', icon: 'telegram' },
      { label: 'ВКонтакте', url: 'https://vk.com/aitishka_pro', icon: 'links' },
    ],
  },
  news: {
    title: 'Новости',
    lead: 'Здесь находятся различные новости и события.',
  },
  testQuestions: {
    git: [
      { question: 'Что делает команда git commit?', options: ['Сохраняет изменения в удалённый репозиторий', 'Фиксирует изменения в локальной истории', 'Создаёт новую ветку', 'Отменяет последние изменения'], correctIndex: 1 },
      { question: 'Как отменить последний коммит, сохранив изменения в рабочей директории?', options: ['git reset --hard HEAD~1', 'git revert HEAD', 'git reset --soft HEAD~1', 'git checkout HEAD~1'], correctIndex: 2 },
      { question: 'Что такое git merge?', options: ['Удаление ветки', 'Слияние изменений из одной ветки в другую', 'Клонирование репозитория', 'Отправка изменений на сервер'], correctIndex: 1 },
    ],
    css: [
      { question: 'Какое свойство задаёт отступ снаружи элемента?', options: ['padding', 'margin', 'gap', 'inset'], correctIndex: 1 },
      { question: 'Что такое Flexbox?', options: ['Способ анимации элементов', 'Модель layout для выравнивания и распределения пространства', 'Тип селектора', 'Единица измерения'], correctIndex: 1 },
      { question: 'Как скрыть элемент, оставив место в потоке документа?', options: ['display: none', 'visibility: hidden', 'opacity: 0', 'height: 0'], correctIndex: 1 },
    ],
    html: [
      { question: 'Какой тег задаёт заголовок первого уровня?', options: ['<head>', '<h1>', '<header>', '<title>'], correctIndex: 1 },
      { question: 'Для чего используется атрибут alt у <img>?', options: ['Ссылка на изображение', 'Альтернативный текст при недоступности картинки', 'Выравнивание изображения', 'Размер изображения'], correctIndex: 1 },
      { question: 'Какой элемент семантически обозначает навигацию?', options: ['<menu>', '<nav>', '<sidebar>', '<links>'], correctIndex: 1 },
    ],
    python: [
      { question: 'Как создать список в Python?', options: ['(1, 2, 3)', '[1, 2, 3]', '{1, 2, 3}', '<1, 2, 3>'], correctIndex: 1 },
      { question: 'Что выведет len("Привет")?', options: ['5', '6', '7', 'Ошибка'], correctIndex: 1 },
      { question: 'Какой тип данных неизменяемый?', options: ['list', 'dict', 'tuple', 'set'], correctIndex: 2 },
    ],
    javascript: [
      { question: 'Чем const отличается от let?', options: ['const быстрее', 'const нельзя переназначить', 'const видна только в блоке', 'Ничем'], correctIndex: 1 },
      { question: 'Что вернёт typeof []?', options: ['"array"', '"object"', '"list"', '"undefined"'], correctIndex: 1 },
      { question: 'Как добавить элемент в конец массива?', options: ['array.add()', 'array.push()', 'array.append()', 'array.insert()'], correctIndex: 1 },
    ],
    typescript: [
      { question: 'Для чего в TypeScript нужны типы?', options: ['Только для документации', 'Проверка типов на этапе разработки и компиляции', 'Ускорение выполнения', 'Они не обязательны'], correctIndex: 1 },
      { question: 'Как объявить переменную с типом «массив чисел»?', options: ['let a: number[]', 'let a: array<number>', 'let a: Array', 'let a: num[]'], correctIndex: 0 },
      { question: 'Что такое interface?', options: ['Класс с реализацией', 'Описание формы объекта (контракт типов)', 'Функция', 'Модуль'], correctIndex: 1 },
    ],
    nodejs: [
      { question: 'Что такое npm?', options: ['Среда выполнения Node.js', 'Менеджер пакетов для Node.js', 'Фреймворк для серверов', 'База данных'], correctIndex: 1 },
      { question: 'Как в Node.js синхронно прочитать файл из модуля fs?', options: ['fs.read()', 'fs.readFileSync()', 'fs.readFile()', 'readSync()'], correctIndex: 1 },
      { question: 'Что такое event loop в Node.js?', options: ['Цикл компиляции', 'Механизм выполнения асинхронного кода', 'Очередь событий мыши', 'Планировщик потоков'], correctIndex: 1 },
    ],
  },
  skillLabels: {
    git: 'git',
    css: 'CSS',
    html: 'HTML',
    python: 'python',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    nodejs: 'nodejs',
  },
}

async function main() {
  mkdirSync(POSTS_DIR, { recursive: true })
  mkdirSync(MEDIA_DIR, { recursive: true })

  let rawPosts = []
  let rawCategories = []

  try {
    console.log('Fetching posts...')
    const postsRes = await fetchStrapi('/posts?populate=*&pagination[pageSize]=100&status=published')
    rawPosts = Array.isArray(postsRes.data) ? postsRes.data : []
  }
  catch (err) {
    console.warn('Posts fetch failed:', err.message)
  }

  try {
    console.log('Fetching categories...')
    const categoriesRes = await fetchStrapi('/categories?populate[subcategories]=*&locale=ru&pagination[pageSize]=100')
    rawCategories = Array.isArray(categoriesRes.data) ? categoriesRes.data : []
  }
  catch (err) {
    console.warn('Categories fetch failed:', err.message)
  }

  console.log('Fetching videos...')
  let videos = []
  try {
    const videosRes = await fetchStrapi('/videos?populate=thumbnail&pagination[pageSize]=100&status=published')
    const rawVideos = Array.isArray(videosRes.data) ? videosRes.data : []
    videos = rawVideos.map(normalizeVideo).filter(v => v.embedUrl)
  }
  catch {
    console.warn('Videos fetch failed, using demo data')
  }

  if (videos.length === 0)
    videos = demoVideos

  const postSummaries = []
  for (const raw of rawPosts) {
    const post = normalizePost(raw)
    if (post.cover)
      post.cover = await downloadMedia(post.cover)
    else
      post.cover = '/media/cover.webp'

    const filename = `${post.slug || post.id}.json`
    writeJson(join(POSTS_DIR, filename), post)
    postSummaries.push({
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      cover: post.cover,
      category: post.category,
      subcategory: post.subcategory,
      url: post.url,
      publishedAt: post.publishedAt,
      views: post.views,
    })
  }

  for (const video of videos) {
    if (video.thumbnailUrl && video.thumbnailUrl.startsWith('http')) {
      // keep external thumbnails for demo videos
    }
    else if (video.thumbnailUrl) {
      video.thumbnailUrl = await downloadMedia(video.thumbnailUrl)
    }
    else {
      video.thumbnailUrl = '/media/cover.webp'
    }
  }

  const taxonomy = {
    categories: rawCategories.map((cat) => {
      const attrs = cat.attributes || cat
      const subs = attrs.subcategories?.data ?? attrs.subcategories ?? []
      return {
        slug: extractSlug(cat),
        name: extractName(cat),
        subcategories: (Array.isArray(subs) ? subs : []).map(sub => ({
          slug: extractSlug(sub),
          name: extractName(sub),
        })),
      }
    }),
  }

  if (taxonomy.categories.length === 0) {
    taxonomy.categories = siteJson.navigation
      .find(n => n.label === 'Статьи')
      ?.children
      ?.map(c => ({
        slug: c.to.replace('/articles/', ''),
        name: c.label,
        subcategories: (c.children || []).map(s => ({
          slug: s.to.split('/').pop(),
          name: s.label,
        })),
      })) ?? []
  }

  writeJson(join(POSTS_DIR, 'index.json'), postSummaries)
  writeJson(join(CONTENT_DIR, 'taxonomy.json'), taxonomy)
  writeJson(join(CONTENT_DIR, 'videos.json'), videos)
  writeJson(join(CONTENT_DIR, 'site.json'), siteJson)

  console.log(`Migrated ${postSummaries.length} posts, ${videos.length} videos, ${taxonomy.categories.length} categories`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
