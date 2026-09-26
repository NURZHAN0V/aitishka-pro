# Онлайн обучение по веб-разработке «Айтишка»

## Описание проекта

**AITISHKAPRO** — образовательный блог и витрина материалов по веб-разработке.

Продакшен: [aitishka.pro](https://aitishka.pro)

Контент в проде планируется вести через панель **Коммерсантик** (headless API). Подробности: [docs/comers.md](./docs/comers.md), пробелы CMS: [docs/comers-gaps.md](./docs/comers-gaps.md).

## Стек технологий

- Vue 3 (Composition API, `<script setup>`)
- Vite 6 + TypeScript
- vue-router
- SCSS (палитра из дизайн-референса `web/`)
- markdown-it / CMS blocks для статей
- pnpm
- GitHub Actions → GitHub Pages

Архитектурные правила: [AGENTS.md](./AGENTS.md)

## Быстрый старт

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Приложение: `http://localhost:3400`

По умолчанию `VITE_CONTENT_SOURCE=local` (JSON из `content/`). Для API Коммерсантика:

```bash
VITE_CONTENT_SOURCE=comers
VITE_COMERS_API_URL=http://localhost:8080
VITE_COMERS_STOREFRONT_KEY=...
```

Сборка:

```bash
pnpm build
pnpm preview
```

## Архитектура проекта

Модульный монолит:

```
src/
  core/           — api (local|comers), cms blocks, composables, Base-*, layouts
  modules/        — home, articles, pages, media, layout, modals, about, contact, news
content/          — локальный JSON (dev / fallback)
public/           — статика, CNAME, media
scripts/          — копирование контента, sitemap, build.json
docs/             — comers.md, comers-gaps.md
```

## Контакты

- Email: info@aitishka.pro
- ВКонтакте: [vk.com/aitishka](https://vk.com/aitishka)

## Лицензия

Проект для образовательных целей AITISHKA.
