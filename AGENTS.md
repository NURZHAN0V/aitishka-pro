# AGENTS.md — Vue 3 и фронтенд

Actionable-справочник для **AI-агента**. **Vue 3 без Nuxt**, Composition API, минимум зависимостей.

## Быстрые правила

**Проект feedtop:** обычный SPA, **без PWA** — не добавлять manifest, service worker, Workbox, offline-cache, `beforeinstallprompt`.

**MUST:** Vue 3 + `<script setup>` + Vite + pnpm · модульный монолит · composables · Base*-обёртки · `api.*()` · fetch в `onMounted` · Vue Style Guide · @antfu/eslint-config

**NEVER:** mixins · Vue 2 · OOP на фронте · наследование компонентов · лишние npm · UI-lib напрямую · fetch в setup · фронт=security · SSR/Workbox/VueUse/i18next по умолчанию · PWA в feedtop · prop/event dribbling · dark UX · монолит на всю страницу (кроме PoC)

---

## 1. Контекст

**Хорошая архитектура** — без боли: тема, UI-lib, i18n, модули, scale, perf, security, онбординг.

**Предпосылки:** JS intermediate+, HTML/CSS · Vue 3 only · официальная документация Vue — справочник, не учебник · гуглить · ментор полезен на любом уровне

**Термины:** DX · UX (опыт пользователя) · UI (визуальный слой) · SW · AT · RT

**Vue vs React:** SFC разделяет HTML/CSS/JS · Proxy (`push`≠spread) · composables→MVC · Vue = флагман COP · реактивность работает и без UI

**Практика:** рефакторинг · документация и диаграммы · принцип бойскаута · Flexbox за пару дней

**Цитата:** хорошие разработчики знают *почему* стандарты; плохие — цепляются за тренды.

**SDLC:** бизнес-анализ и scope до кода · инкремент: витрина(JSON)→BaaS→маркетплейс · рабочий продукт после каждого этапа · без «сначала плохо» · **сначала функционал и адаптивность, полировка UI — позже**

**Кругозор:** backend basics, SQL, JSON-RPC/WS, Swagger, CI/CD — помогает выбирать фронтенд-стратегии

---

## 2. Стек

| | |
|--|--|
| Framework | Vue 3, Composition API, `<script setup>` |
| Build | Vite (`esnext`), не vue-cli/Webpack |
| PM | pnpm |
| Router | vue-router (единственная обязательная зависимость scaffolder) |
| TS | Scaffold в TS; продолжение в JS допустимо · типизировать сущности в `index.d.ts` |
| Styles | SCSS + CSS3 (Flexbox, Grid, Container Queries) |
| Lint | @antfu/eslint-config + Volar (+ Prettier для `<style>`) |
| IDE | VS Code (WebStorm отстаёт); 16GB+, SSD, монитор 22"+ |
| Alias | `@` → `./src` в vite.config и tsconfig |

Создание: `pnpm create vite` · `pnpm create vue-webapp [-c config.json]`

### Vue 3 основы

SFC: template + script setup + style scoped · `createApp().use(router).mount()` · `useRoute`/`useRouter` · Teleport · multi `v-model` · `defineProps`/`defineEmits` · slots (default/named/scoped) · композиция вместо наследования

### Три режима поставки Vue

Standalone app · importable Vue library · embeddable Custom Element

### Миграция Vue 2

Только legacy; новый код — Vue 3

---

## 3. Архитектура

### Структура (модульный монолит)

```
core/           → shell: api, i18n, BaseButton, BaseIcon, layouts
modules/<feat>/ → components, composables, views, services, routes
```

| Подход | Когда |
|--------|-------|
| Flat | PoC |
| **Modules** | **Production — лучший для Vue 3** |
| Atomic/FSD | Внутри модуля; на весь app — избыточно |
| Microfrontends | Много команд |

**Naming:** `*View` не `*Page` · слабо связанные экраны — отдельные подсистемы через router params, каждый грузит свои данные

**Shared код:** Git submodules или private npm

### Парадигма

Компоненты + composables + модули · MVC · async≠offload (Event Loop = main thread) · Workers = реальный offload

**MVC-тест:** смена UI → новые views; composables без изменений

**API-слой:** app → единый api-модуль → адаптеры (Supabase/Firebase/свой backend/headless CMS)

### Vue Router

Nested `router-view`: outer=layout, inner=page · `meta: { requiresAuth, backRoute }` + guards · lazy import

### Паттерны

- `useAppLoader` + Set ID (`useId` 3.5+) — альтернатива Suspense
- provide/inject: тема, auth, i18n, Accordion/Panel — умеренно; типизировать; нет DevTools
- Модалы: Async Promise+DI или Vue plugin
- Workers: Business Delegate + Command/Dispatcher (только serializable commands, не cross-thread calls)
- Нет silver bullet — прототипировать варианты

### Шаблоны

Singleton · DI · Observer · Façade · Proxy · Decorator · Command · Promises · Callback

### Data flow

`props/emits → provide/inject → composables → Pinia → bus`

Bus = mitt только WS-reconnect · dribbling — плохо · prop drilling на мелком дереве — OK

---

## 4. Компоненты и UI

### Принципы

Separation · Composition · SRP · Encapsulation (black box: props/emits/slots) · KIC · DRY · KISS · Code for the next · CRUD-методы группировать · слушатели снимать в `onBeforeUnmount`

### UI workflow

Макет → таблица (Role/State/Props/Emits/Events) → динамика модалов → паттерны

### Правила

Owner mutates · children emit · siblings via parent/composable · no parent methods as props · local import · PascalCase · модал-edit: копия объекта → accept → мутация · `defineAsyncComponent` (+ loading/error/timeout)

Global registration — только shared utils (bloat, скрытые deps, коллизии)

### Валидация

UI → компонент · сложные → компонент+утилита · бизнес → composable

### Обёртки

UI-lib · Headless UI · toaster/modal → `Base*` · Quasar/PrimeVue OK · Vuetify 2 устарел

**Base-компоненты:** минимум (`BaseIconButton`+badge), расширять позже

### Адаптивность

`useScreenWidth` (480/767/1199) → body: `mobile|tablet|notebook|desktop` · Flexbox/Grid · HTML5 semantic

---

## 5. State

`ref` default · `reactive` objects · `shallowRef` big arrays · `push` not spread

`useAuth`+methods (не `useAuthStore`) · не голый exported ref · **циклические импорты модулей с ref → undefined downstream; предпочитать singleton composable** · локальные инстансы composable (несколько виджетов) · no SSR globals · cleanup в `onBeforeUnmount`

**Storage:** `useLocalStorage.observe` — один объект LS, sync вкладок · LS межвкладочный · SS на вкладку · native не reactive

| | |
|--|--|
| Prop drilling | Мелкое дерево |
| provide/inject | Тема, i18n |
| composable | Логика (~1.5×/20× vs Pinia) |
| Pinia | SSR, DevTools, команда (Vuex deprecated) |
| event bus | WS only |

Dev: refs→Pinia для DevTools в dev

---

## 6. API и security

```
Component → api.*() → http → transport
```

`api.init()` · interceptors · **onMounted**, не setup-await

**Протоколы:** REST start · **JSON-RPC** · WS+mitt · GraphQL own fullstack — 99% нет

**Auth:** auth ≠ authorization · httpOnly AT · LS+JS dup (iOS) · AT+RT · RBAC/PBA backend · 401→login+reset · fingerprint/IP для critical · OAuth только с backend

**Инфра:** CORS backend · Vite proxy dev · mock API · Hoppscotch/Postman · BaaS: SQL>RDBMS для commerce · adapter на провайдера · Edge Functions · open/self-hostable backend предпочтительнее lock-in · headless e-commerce CMS на этапе маркетплейса

**Модель:** индексируемые колонки + JSON для иерархии · типы в `index.d.ts`

---

## 7. Ассеты

`public/` HTTP · `assets/` hash bundle · `?raw` SVG · webp · `BaseIcon`+glob · JSON named import

---

## 8. SPA / PWA / SEO

**SPA→PWA обязательно:** HTTPS · manifest · SW без Workbox · cache-first · VERSION · Lighthouse · offline · `beforeinstallprompt` · `appinstalled` · push (ограничения iOS)

**PWA trade-offs:** iOS отстаёт по API · App Store limits · на слабом железе native быстрее

**SEO:** Mobile-Friendly → **dynamic rendering** (лёгкий server-side HTML per URL, кэшируемый; контент = SPA, иначе cloaking) → SSG → SSR (тупик) · PageSpeed≠installed PWA

**Cache-bust:** `build.json` timestamp · compare LS · reload

---

## 9. i18n и scaffolder

Чистый HTML5+CSS3 · функциональность по необходимости · высокая кастомизация · фича = полный минимум (composable+локали+демо+comments) · wrapper для 3rd party

`useI18nLight` ~70 строк · `vite-plugin-html-injection` · CSS vars · splash · dark theme · BaseIcon · BaseToggle

**Scaffolder:** wireframe builder (portfolio/blog/store) · layout/header/footer/drawer/navbar · PWA · API/JSON-RPC · GA · OG · GH Pages · themes · adaptability · planned: auth JWT, live showcase, version-check reload

TypeScript default, JavaScript allowed

---

## 10. Зависимости

Copy 5–50 lines > npm · tree-shaking ненадёжен · `vite-bundle-visualizer`

| ❌ | ✅ |
|----|-----|
| VueUse, i18next, Workbox, Pinia everywhere | composables, raw SW |
| moment, Swiper, Pug, Stylus, Tailwind | Intl, day.js, Keen-Slider/Embla; HTML/SCSS |
| mixins | composables |
| raw IndexedDB | `idb` |

OK: vue-sonner · Intersection Observer · Quasar/PrimeVue (wrapped)

**VueUse×8:** мелкие · dep-risk · mismatch · extra computed · adapters · dictates architecture · sync hell · populism

---

## 11. Web Components

Custom Element: string props · `CustomEvent` · zero-deps embed (timeline widgets)

---

## 12. Performance

async блокирует main thread · Workers: no DOM · alive на сессию · мало · clone reactive · worker errors isolated · IndexedDB offline · ShallowRef · 60fps≈16ms

---

## 13. UX

**Атрибуты:** UX, perf, security, extensibility, clean code · PWA+themes+i18n · per-shop themes

**UX-цели:** usefulness · memorability · user sense of control · общий словарь с дизайнерами

**UI:** контраст · consistency · alignment · proximity · Fitts · Hick · Shneiderman×8 · native inputs · hero · CTA

**Dark patterns NO:** roach motels · confirm shaming · hidden costs · bait-and-switch · privacy zuckering · disguised ads · basket sneaking · misdirection · trick questions · price blocking · forced continuity · friendly spam

---

## 14. Tests / Git / Deploy

Vitest+Vue Test Utils — большие команды; MVP unit-fetish сомнителен · e2e Cypress/WebdriverIO — prod важны

Git: branches · merges · remotes · **сообщения коммитов только на русском языке**

CI/CD: lint+build+test+deploy · GH Actions · per-env `.env` · subdomain isolation · deploy backups · manual prod dispatch

Hosting: GH Pages, Netlify, Vercel, Render, Firebase, S3 · domain+subdomains

VPS: Nginx · `createWebHistory` · `try_files ... /index.html` · CertBot · Docker optional

---

## 15. Инструменты

DevTools formatters · Playground/StackBlitz · VitePress · Hoppscotch/Postman/HeidiSQL · Codeium · cheat-sheets

Fullstack: mini-PC Linux + VS Code SSH Remote

VS Code: ESLint · Volar · TS Vue Plugin · Codeium · GitHub Actions

---

## 16. Антипаттерны

| ❌ | ✅ |
|----|-----|
| Vue 2, Options API, mixins | Composition API |
| OOP/наследование | composables |
| UI-lib direct | Base* wrap |
| Tailwind maintainable | CSS3 |
| SPA no PWA | HTTPS+manifest+SW |
| SSR default SEO | dynamic/SSG |
| Pinia/Vuex everywhere | composables first |
| event bus state | composable; mitt=WS |
| prop/event dribbling | provide/composable |
| global components | local import |
| fetch in setup | onMounted |
| front=security | backend every request |
| parent fn as props | emits |
| child mutates shared | parent owns |
| bare exported ref | composable+methods |
| cyclic ref imports | singleton composable |
| GraphQL fullstack | REST/JSON-RPC |
| VueUse default | own 10-50 lines |
| YouTube-only | Style Guide+практика |
| dark UX | honest UX |
| FSD/Atomic на app | modular monolith |
| tree-shaking trust | avoid deps |
| page monolith | decomposition |
| OAuth in browser | backend auth |
| bot≠user content | matching rendering |
| proprietary CMS lock-in | adapter+open backend |
| UI polish before core | function first |

---

*Сверяй API-изменения с актуальной документацией Vue/Vite.*
