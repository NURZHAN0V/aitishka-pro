# Интеграция с Коммерсантиком

Витрина `aitishka.pro` может брать контент из локального JSON (`content/`) или из публичного API панели **Коммерсантик**.

## Режимы

| `VITE_CONTENT_SOURCE` | Поведение |
|-----------------------|-----------|
| `local` (по умолчанию) | Статьи, сайт, видео — из `/content/*.json` |
| `comers` | Статьи, страницы, навигация/контакты — из API; видео и skill-тесты пока из локального JSON (fallback), пока витрина не читает `/api/cms/playlists` и `storefront_extra` |

## Переменные окружения

См. [`.env.example`](../.env.example):

- `VITE_SITE_URL` — канонический origin сайта
- `VITE_CONTENT_SOURCE` — `local` \| `comers`
- `VITE_COMERS_API_URL` — базовый URL API (в prod — абсолютный; в dev можно оставить пустым и ходить через Vite proxy на `/api`)
- `VITE_COMERS_STOREFRONT_KEY` — ключ «Comers Витрина»

В `vite.config.ts` настроен proxy: `/api` и `/uploads` → `VITE_COMERS_API_URL`.

## Публичные эндпоинты, которые использует витрина

- `GET /api/cms/articles`, `GET /api/cms/articles/:slug`
- `GET /api/cms/pages`, `GET /api/cms/pages/:slug`
- `GET /api/catalog/settings`
- `POST /api/requests` — заявки с формы обучения (см. оставшиеся нюансы контракта в [comers-gaps.md](./comers-gaps.md))

Заголовок: `X-Comers-Storefront-Key`.

## URL витрины

- Статья: `/articles/:slug` (legacy `/articles/:cat/:sub/:slug` сохранён)
- Категория (плоская CMS): `/articles/category/:category`
- CMS-страница: `/pages/:slug`
- Заявка: модалка «Оставить заявку» → `api.createRequest`

## CI

Для сборки sitemap из API в GitHub Actions задайте secrets/vars:

- `VITE_CONTENT_SOURCE=comers`
- `VITE_COMERS_API_URL`
- `VITE_COMERS_STOREFRONT_KEY`
- `VITE_SITE_URL`
