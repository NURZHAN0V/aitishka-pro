/**
 * Restructure posts: meta schema, markdown normalization, cover paths.
 * Run: node scripts/restructure-posts.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const POSTS_DIR = join(root, 'content', 'posts')

const META_OVERRIDES = {
  'pereehali-s-pluspixel-ru': {
    description: 'Команда AITISHKAPRO сообщает о переезде на aitishka.pro. Все статьи и учебные материалы теперь публикуются на новом сайте.',
    tags: ['novosti', 'platforma', 'aitishka'],
  },
  'prostoj-gid-po-soketam-v-python': {
    description: 'Мини-учебник по сокетам в Python: TCP и UDP, простой сервер и клиент, ошибки и таймауты. Без сложных терминов — для начинающих.',
    tags: ['python', 'sockets', 'tutorial'],
  },
  'polnoe-rukovodstvo-po-rest-api-v-strapi-5-nastrojka-zaprosy-i-rabota-s-kontentom': {
    description: 'REST API в Strapi 5: эндпоинты, права доступа, запросы, ошибки и практические примеры. Полное руководство для разработчиков.',
    tags: ['strapi', 'rest-api', 'tutorial'],
  },
  'kak-podklyuchitsya-k-git-hub-po-ssh-poshagovoe-rukovodstvo-dlya-novichkov': {
    description: 'Как создать SSH-ключ и подключиться к GitHub без пароля при каждом push. Пошагово для Windows, Linux и macOS.',
    tags: ['git', 'github', 'ssh', 'tutorial'],
  },
  'nuxt-js-strapi-na-servere-poshagovaya-ustanovka-s-nginx-i-pm-2': {
    description: 'Деплой Nuxt.js и Strapi на Ubuntu: Node.js, PM2, Nginx и окружение для продакшна. Пошаговое руководство без лишней воды.',
    tags: ['nuxt', 'strapi', 'deploy', 'nginx', 'pm2'],
  },
  'kak-ispravit-oshibku-s-npm-v-terminale-vs-code': {
    description: 'VS Code не видит npm в PowerShell? Разбираем политику выполнения скриптов и возвращаем рабочий терминал за несколько минут.',
    tags: ['npm', 'vscode', 'windows', 'troubleshooting'],
  },
  'kak-sdelat-svoj-pervyj-lcd-displej-s-arduino': {
    description: 'Первый проект с Arduino и LCD 16x2: подключение, код на LiquidCrystal и вывод текста на экран. Урок для начинающих.',
    tags: ['arduino', 'lcd', 'tutorial', 'kids'],
  },
  'pixel-art': {
    description: 'Научимся рисовать анимацию ходьбы в Piskel: 6 кадров, настройка FPS и экспорт GIF. Пошаговый урок для юных художников.',
    tags: ['piskel', 'pixel-art', 'animation', 'medialaboratoriya'],
  },
  'monitoring': {
    description: 'Мониторинг сервера: Prometheus, Loki и Grafana на Ubuntu. Сбор метрик, логов и дашборды для Node.js-приложений.',
    tags: ['monitoring', 'prometheus', 'grafana', 'devops'],
  },
  'integracziya-redis-s-strapi': {
    description: 'Кэширование Strapi v5 через Redis: установка, конфигурация, middleware и очереди Bull. Ускоряем API и снижаем нагрузку на БД.',
    tags: ['strapi', 'redis', 'caching', 'tutorial'],
  },
  'kak-podklyuchit-domen-k-vps-na-ubuntu-nginx-1': {
    description: 'Подключение домена к VPS на Ubuntu: DNS, Nginx, SSL через Certbot и автопродление сертификата. Полное руководство для новичков.',
    tags: ['nginx', 'ssl', 'vps', 'ubuntu', 'tutorial'],
  },
  'migayushhij-svetodiod-na-arduino-uno-r3': {
    description: 'Первый проект на Arduino UNO: мигающий светодиод, схема, код и принцип работы GPIO. Стартовый урок для детей.',
    tags: ['arduino', 'led', 'tutorial', 'kids'],
  },
}

function inferTags(post) {
  const sub = post.subcategory?.slug || ''
  const tags = new Set([sub].filter(Boolean))
  const title = post.title.toLowerCase()

  if (sub.includes('python'))
    tags.add('python')
  if (sub.includes('arduino'))
    tags.add('arduino')
  if (sub.includes('rolox') || title.includes('roblox'))
    tags.add('roblox')
  if (title.includes('strapi'))
    tags.add('strapi')
  if (title.includes('nuxt'))
    tags.add('nuxt')
  if (title.includes('git'))
    tags.add('git')
  if (title.includes('шпаргал'))
    tags.add('cheatsheet')
  else if (sub === 'dlya-detej' || post.category?.slug === 'dlya-detej')
    tags.add('tutorial')
  else
    tags.add('guide')

  return [...tags].slice(0, 5)
}

function buildMeta(post) {
  const override = META_OVERRIDES[post.slug]
  const description = override?.description
    || post.description?.trim()
    || `${post.title}. Учебный материал AITISHKAPRO — практика и пошаговые инструкции для начинающих.`

  const trimmed = description.length > 160 ? `${description.slice(0, 157)}…` : description
  const coverPath = `/media/posts/${post.slug}-cover.webp`

  return {
    description: trimmed,
    tags: override?.tags || inferTags(post),
    ogImage: coverPath,
  }
}

function stripLeadingH1(body) {
  return body.replace(/^#\s+(?:\S.*|[\t\v\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF])\n+/, '')
}

function setextToAtx(body) {
  return body.replace(/^([^\n#*\d\-].+)\n([=-]{3,})\s*$/gm, (_, title, underline) => {
    const trimmed = title.trim()
    // Never treat code-fence closers or short lines as setext headings
    if (!trimmed || trimmed.startsWith('`') || trimmed === '```' || trimmed.length < 4)
      return `${title}\n${underline}`
    const level = underline.includes('=') ? '##' : '##'
    return `${level} ${trimmed}`
  })
}

function checklistsToBullets(body) {
  return body.replace(/^(\s*)-\s+\[[ x]\]\s+/gim, '$1- ')
}

function iframeToCallout(body) {
  return body.replace(
    /<iframe[^>]*src="([^"]+)"[^>]*><\/iframe>\s*/gi,
    (_, src) => `::: tip\nВидео к статье: [смотреть на VK Video](${src})\n:::\n\n`,
  )
}

function h4PlusToBold(body) {
  return body
    .replace(/^#{4,6} ([^\n]+)$/gm, '**$1**')
}

function fixPluspixelLinks(body) {
  return body
    .replace(
      /https:\/\/pluspixel\.ru\/dlya-vzroslyh\/veb-razrabotka\/kak-podklyuchit-domen-k-vps-na-ubuntu-nginx/g,
      'https://aitishka.pro/articles/dlya-vzroslyh/veb-razrabotka/kak-podklyuchit-domen-k-vps-na-ubuntu-nginx-1',
    )
}

function removeManualToc(body) {
  return body.replace(/^## Содержание\n(?:- .+\n)+/m, '')
}

function gfmTablesToLists(body) {
  const lines = body.split('\n')
  const out = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (/^\|.+\|$/.test(line.trim()) && i + 1 < lines.length && /^\|[\s\-:|]+\|$/.test(lines[i + 1].trim())) {
      const headers = line.split('|').map(c => c.trim()).filter(Boolean)
      i += 2
      while (i < lines.length && /^\|.+\|$/.test(lines[i].trim())) {
        const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean)
        const row = headers.map((h, idx) => `**${h}:** ${cells[idx] || ''}`).join(' · ')
        out.push(`- ${row}`)
        i++
      }
      out.push('')
      continue
    }
    out.push(line)
    i++
  }

  return out.join('\n')
}

function normalizeStepHeaders(body, slug) {
  if (slug === 'pixel-art') {
    return body.replace(/^### (Шаг \d+:[^\n]+)/gm, '**$1**')
  }
  return body.replace(/^### (Шаг \d[^\n]*)/gm, '**$1**')
}

function normalizeLcdArticle(body) {
  return setextToAtx(body.replace(/^={3,}\s*\n/m, ''))
}

function normalizeMarkdown(body, slug) {
  let result = body

  if (slug === 'kak-sdelat-svoj-pervyj-lcd-displej-s-arduino')
    result = normalizeLcdArticle(result)
  else
    result = setextToAtx(result)

  result = stripLeadingH1(result)
  result = iframeToCallout(result)
  result = checklistsToBullets(result)
  result = gfmTablesToLists(result)
  result = removeManualToc(result)
  result = h4PlusToBold(result)
  result = normalizeStepHeaders(result, slug)
  result = fixPluspixelLinks(result)

  return result.replace(/\n{3,}/g, '\n\n').trim()
}

function toSummary(post) {
  const { body: _body, description: _desc, ...summary } = post
  return summary
}

function main() {
  const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json')
  const summaries = []

  for (const file of files.sort()) {
    const path = join(POSTS_DIR, file)
    const post = JSON.parse(readFileSync(path, 'utf8'))

    post.body = normalizeMarkdown(post.body || '', post.slug)
    post.meta = buildMeta(post)
    delete post.description

    if (post.category?.slug && post.subcategory?.slug && post.slug) {
      post.url = `/articles/${post.category.slug}/${post.subcategory.slug}/${post.slug}`
    }

    writeFileSync(path, `${JSON.stringify(post, null, 2)}\n`)
    summaries.push(toSummary(post))
  }

  summaries.sort((a, b) => {
    const da = a.publishedAt || ''
    const db = b.publishedAt || ''
    return db.localeCompare(da)
  })

  writeFileSync(join(POSTS_DIR, 'index.json'), `${JSON.stringify(summaries, null, 2)}\n`)
  console.log(`Restructured ${summaries.length} posts`)
}

main()
