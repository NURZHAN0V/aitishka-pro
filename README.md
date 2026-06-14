# Онлайн обучение по веб-разработке «Айтишка»

## Описание проекта

**AITISHKAPRO** — образовательный блог и витрина материалов по веб-разработке.

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

## Контакты

- Email: info@aitishka.pro
- ВКонтакте: [vk.com/aitishka](https://vk.com/aitishka)

## Лицензия

Проект для образовательных целей AITISHKA.
