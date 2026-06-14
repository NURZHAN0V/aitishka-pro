# AGENTS.md — контент aitishka.pro

Actionable-справочник для **AI-агента** и **автора**, работающих только в `content/`.

## Быстрые правила

**MUST:** править только `content/` · slug — латиница, kebab-case · категории из `taxonomy.json` · новая статья = файл + запись в `posts/index.json` · `body` — Markdown в JSON · обложки — `/media/...`

**NEVER:** править `public/content/` · выдумывать slug категории · дублировать `body` в index · raw HTML · GFM (таблицы, чеклисты, зачёркивание)

---

## 1. Контекст

| | |
|--|--|
| Источник правды | `content/` |
| Копия для SPA | `public/content/` — **генерируется**, не редактировать |
| Загрузка | `fetch('/content/...')` — `api.getPosts()`, `api.getPost(slug)` |
| Сборка | `pnpm dev` / `pnpm build` → `scripts/copy-content.mjs` |

Обложки в **`public/media/`** (вне `content/`). Указывайте существующий `/media/...` или согласуйте новый файл с разработчиком. `pnpm migrate` — только для dev (импорт из Strapi).

---

## 2. Структура папки

```
content/
├── site.json              ← конфиг SPA (навигация, about, contact, тесты)
├── taxonomy.json          ← категории статей
├── video-taxonomy.json    ← категории видео
├── videos.json            ← плейлисты и ролики
└── posts/
    ├── index.json         ← оглавление (без body)
    └── {slug}.json        ← полная статья
```

**`site.json`:** `title`, `url`, `description`, `navigation`, `benefits`, `technologies`, `about`, `contact`, `news`, `testQuestions`. Влияет на весь сайт — менять осознанно.

---

## 3. Статьи (posts)

**Файлы:** `posts/{slug}.json` (полный `Post`) + запись в `posts/index.json` (`PostSummary`, **без `body`**). Имя файла = `slug`.

| Поле | Обяз. | Описание |
|------|-------|----------|
| `id` | да | Уникальная строка |
| `slug` | да | a-z, 0-9, дефис; lowercase; уникален |
| `title` | да | Заголовок |
| `description` | нет* | Для карточки/SEO; может быть `""` |
| `body` | да** | Markdown; **только** в `{slug}.json` |
| `cover` | да | `/media/cover.webp` |
| `category`, `subcategory` | да | `{ slug, name }` из taxonomy |
| `url` | да | `/articles/{cat}/{subcat}/{slug}` |
| `publishedAt` | нет | ISO 8601 |
| `views` | да | Для новой — `0` |

\* Рекомендуется. \*\* Не включать в index.

**Slug:** транслит заголовка, без кириллицы и пробелов. Не менять после публикации без редиректа.

**URL:** `/articles/dlya-vzroslyh/python/prostoj-gid-po-soketam-v-python`

---

## 4. Markdown в `body` — поддерживается

Рендер: `src/core/composables/useMarkdown.ts`.

**Базовый синтаксис:** заголовки `#`–`####`, абзацы, **жирный**, *курсив*, списки, `[ссылки](url)`, автолинковка URL, `> цитаты`, `---`, изображения `![alt](/media/x.webp)`, inline `` `код` ``, fenced blocks:

````markdown
```python
print("hello")
```
````

Подсветка + кнопка «Скопировать» — автоматически.

**Языки:** `javascript`/`js`, `typescript`/`ts`, `python`/`py`, `bash`/`sh`, `shell`, `yaml`/`yml`, `json`, `sql`, `css`, `html`/`xml`, `cpp`/`c`/`arduino`, `php`, `ini`, `dockerfile`, `markdown`/`md`. Неизвестный язык — без подсветки, копирование работает.

**Якоря (markdown-it-anchor):** h1–h4 получают якорь `#`; slug из текста заголовка.

**Атрибуты (markdown-it-attrs):** только `id`, `class` — `### Заголовок {#my-id .class}`

**Callout-блоки:**

````markdown
::: tip
Совет читателю.
:::

::: important
Критически важно.
:::
````

| Тег | Вид |
|-----|-----|
| `tip`, `совет` | «Совет» |
| `important`, `warning`, `info`, `важно` | «Важно» |

---

## 5. Markdown — НЕ работает

| ❌ | Причина |
|----|---------|
| Raw HTML | `html: false` |
| Таблицы, чеклисты, `~~зачёркивание~~` | плагины не подключены |
| Footnotes, Mermaid, embed | не поддерживаются |
| HTML-атрибуты кроме `id`/`class` | ограничение attrs |

Проверка: `pnpm dev` → страница статьи.

---

## 6. Категории статей

Источник: **`taxonomy.json`** → `categories[]` → `subcategories[]`.

**MUST:** `slug` и `name` в статье **точно** как в taxonomy. **NEVER:** несуществующий slug.

**Выбор:** открыть taxonomy → категория (`novosti`, `dlya-vzroslyh`, `dlya-detej`) → подкатегория внутри неё → скопировать в JSON.

**Новая категория:** сначала добавить в `taxonomy.json`, потом статьи.

---

## 7. Видео

**`videos.json`:** `{ "playlists": [...], "videos": [...] }`. Отдельные ролики — в `videos[]`; серии — в `playlists[].videos[]`.

| Поле | Описание |
|------|----------|
| `id`, `slug`, `title` | slug → URL `/media/{slug}` |
| `excerpt` | Описание |
| `embedUrl` | VK Video embed |
| `thumbnailUrl` | `/media/...` |
| `duration` | `"ММ:СС"` |
| `category` | slug из **`video-taxonomy.json`** |
| `views`, `publishedAt`, `order` | order — порядок в плейлисте |

Плейлист: `id`, `slug`, `title`, `description?`, `thumbnailUrl?`, `publishedAt?`, `videos[]`. Новая категория — сначала в `video-taxonomy.json`.

---

## 8. После изменений

1. Новая/удалённая статья → обновить **`posts/index.json`** (без `body`).
2. Перезапустить dev или дождаться `copy-content.mjs` при build.
3. Не править **`public/content/`** вручную.

---

## 9. Чеклист новой статьи

1. Категория + подкатегория из `taxonomy.json`
2. Уникальный `slug`
3. `posts/{slug}.json` с `body`
4. `url` = `/articles/{cat}/{subcat}/{slug}`
5. `cover` — `/media/...`
6. Запись в `posts/index.json` **без `body`**
7. `pnpm dev` — проверить рендер
8. Заполнить `description`

---

## 10. Примеры

### Статья + index (фрагменты)

```json
{
  "id": "manual-moj-gid",
  "slug": "moj-gid",
  "title": "Мой гид",
  "description": "Краткое описание.",
  "body": "## Введение\n\nТекст…",
  "cover": "/media/cover.webp",
  "category": { "slug": "dlya-vzroslyh", "name": "Для взрослых" },
  "subcategory": { "slug": "python", "name": "Python" },
  "url": "/articles/dlya-vzroslyh/python/moj-gid",
  "publishedAt": "2026-06-14T12:00:00.000Z",
  "views": 0
}
```

В `index.json` — тот же объект **без `body`**.

### Фрагмент `body`

```markdown
## Введение {#intro}

::: tip
`python -m venv .venv`
:::

```python
print("Привет!")
```

::: important
Не публикуйте секреты в статьях.
:::
```

---

*При расхождении с кодом — ориентир: `useMarkdown.ts`, `index.d.ts`, `copy-content.mjs`.*
