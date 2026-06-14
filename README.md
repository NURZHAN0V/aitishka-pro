# Онлайн обучение по веб-разработке «Айтишка»

## Описание проекта

**AITISHKAPRO** — образовательный блог и витрина материалов по веб-разработке. Сайт построен как быстрый Vue 3 SPA с контентом в JSON: статьи, видео, таксономия и статические страницы хранятся локально в репозитории без зависимости от Strapi в runtime.

Продакшен: [aitishka.pro](https://aitishka.pro)

## Стек технологий

- Vue 3 (Composition API, `<script setup>`)
- Vite 6 + TypeScript
- vue-router
- SCSS (палитра из дизайн-референса `web/`)
- markdown-it для статей
- pnpm
- GitHub Actions → GitHub Pages

Архитектурные правила: [AGENTS.md](./AGENTS.md)

## Быстрый старт

```bash
pnpm install
pnpm dev
```

Приложение: `http://localhost:3400`

Сборка:

```bash
pnpm build
pnpm preview
```

## Архитектура проекта

Модульный монолит:

```
src/
  core/           — api, composables, Base-компоненты, layouts, стили
  modules/        — home, articles, media, layout, modals, about, contact, news
content/          — исходный JSON-контент (в git)
public/           — статика, CNAME, media после миграции
scripts/          — миграция, копирование контента, sitemap, build.json
```

### Контент

| Файл | Описание |
|------|----------|
| `content/site.json` | Навигация, hero, about, contact, тесты |
| `content/taxonomy.json` | Категории и подкатегории |
| `content/posts/index.json` | Список статей (метаданные) |
| `content/posts/{slug}.json` | Полная статья |
| `content/videos.json` | Видеоматериалы |

### Миграция из Strapi

Импорт из `cms.pluspixel.ru` (pluspixel-nuxt API):

```bash
# Токен — из pluspixel-nuxt/client/.env.example (NUXT_STRAPI_API_TOKEN)
$env:STRAPI_API_TOKEN="<token>"
pnpm migrate
```

Скрипт скачивает посты, категории, видео и обложки в `content/` и `public/media/`.

При `dev` и `build` контент копируется в `public/content/`.

### Деплой

Push в `main` → GitHub Actions собирает проект и публикует в ветку `gh-pages`.

Настройка домена:

1. `public/CNAME` → `aitishka.pro`
2. GitHub → Settings → Pages → Custom domain
3. DNS: A-записи GitHub Pages или CNAME на `{user}.github.io`
4. Enforce HTTPS

## Git

Сообщения коммитов — **только на русском языке**.

## Контакты

- Email: info@aitishka.pro
- Telegram: [@aitishka_pro](https://t.me/aitishka_pro)

## Лицензия

Проект для образовательных целей AITISHKA.
