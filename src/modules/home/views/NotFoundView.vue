<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BaseButton from '@/core/components/BaseButton.vue'
import BaseIcon from '@/core/components/BaseIcon.vue'
import { useTheme } from '@/core/composables/useTheme'
import { usePostsCatalog } from '@/modules/articles/composables/usePostsCatalog'

const router = useRouter()
const { setTheme } = useTheme()
const { ensureLoaded, posts } = usePostsCatalog()

const searchQuery = ref('')
const searchRef = ref<HTMLElement | null>(null)
const linksRef = ref<HTMLElement | null>(null)

const heroImageSrc = encodeURI('/ChatGPT Image 15 июн. 2026 г., 12_53_01.webp')

const quickLinks = [
  {
    to: '/news',
    icon: 'news',
    title: 'Новости',
    text: 'Актуальные события из мира IT',
  },
  {
    to: '/articles',
    icon: 'code',
    title: 'Статьи',
    text: 'Полезные материалы и гайды',
  },
  {
    to: '/media',
    icon: 'play',
    title: 'Видео',
    text: 'Обучающие ролики и обзоры',
  },
] as const

function scrollToSearch() {
  searchRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  searchRef.value?.querySelector('input')?.focus()
}

function scrollToLinks() {
  linksRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function enableDarkTheme() {
  setTheme('dark')
}

async function handleSearchSubmit() {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    scrollToSearch()
    return
  }

  await ensureLoaded()
  const match = posts.value.find(post =>
    post.title.toLowerCase().includes(query)
    || post.meta.description.toLowerCase().includes(query),
  )

  if (match) {
    await router.push(match.url)
    return
  }

  await router.push('/articles')
}
</script>

<template>
  <div class="not-found">
    <section class="not-found__hero">
      <div class="not-found__stars" aria-hidden="true" />

      <div class="container not-found__hero-inner">
        <p class="not-found__code" aria-hidden="true">
          404
        </p>

        <h1 class="not-found__title">
          Айтишка заблудилась в коде
        </h1>
        <p class="not-found__lead">
          Кажется, этой страницы нет в нашей вселенной.
        </p>

        <div class="not-found__scene">
          <div class="not-found__illustration-wrap">
            <img
              :src="heroImageSrc"
              alt=""
              class="not-found__illustration"
              width="640"
              height="480"
              decoding="async"
            >
          </div>

          <aside class="not-found__tips">
            <div class="not-found__tips-bar" aria-hidden="true">
              <span class="not-found__tips-dot not-found__tips-dot--red" />
              <span class="not-found__tips-dot not-found__tips-dot--yellow" />
              <span class="not-found__tips-dot not-found__tips-dot--green" />
            </div>

            <h2 class="not-found__tips-title">
              Что можно сделать?
            </h2>

            <ul class="not-found__tips-list">
              <li>
                <button type="button" class="not-found__tips-item" @click="scrollToSearch">
                  <BaseIcon name="search" size="1.125rem" />
                  <span>Проверить адрес</span>
                </button>
              </li>
              <li>
                <RouterLink to="/" class="not-found__tips-item">
                  <BaseIcon name="home" size="1.125rem" />
                  <span>Вернуться на главную</span>
                </RouterLink>
              </li>
              <li>
                <button type="button" class="not-found__tips-item" @click="scrollToLinks">
                  <BaseIcon name="folder" size="1.125rem" />
                  <span>Изучить другие разделы</span>
                </button>
              </li>
              <li>
                <button type="button" class="not-found__tips-item" @click="enableDarkTheme">
                  <BaseIcon name="moon" size="1.125rem" />
                  <span>Включить тёмную тему</span>
                </button>
              </li>
            </ul>
          </aside>
        </div>

        <div class="not-found__cta">
          <p class="not-found__cta-text">
            Но не переживай, в IT ищут решения!
          </p>
          <RouterLink to="/" class="not-found__cta-link">
            <BaseButton class="not-found__cta-btn">
              <BaseIcon name="home" size="1.125rem" />
              На главную
            </BaseButton>
          </RouterLink>
        </div>
      </div>
    </section>

    <section ref="searchRef" class="not-found__search container">
      <h2 class="not-found__search-title">
        Попробуй найти то, что нужно
      </h2>

      <form class="not-found__search-form" @submit.prevent="handleSearchSubmit">
        <label class="not-found__search-field">
          <BaseIcon name="search" size="1.25rem" />
          <input
            v-model="searchQuery"
            type="search"
            class="not-found__search-input"
            placeholder="Поиск по сайту..."
            autocomplete="off"
          >
        </label>
      </form>
    </section>

    <section ref="linksRef" class="not-found__links container">
      <ul class="not-found__links-grid">
        <li v-for="item in quickLinks" :key="item.to">
          <RouterLink :to="item.to" class="not-found__link-card">
            <span class="not-found__link-icon">
              <BaseIcon :name="item.icon" size="1.375rem" />
            </span>
            <span class="not-found__link-body">
              <span class="not-found__link-title">{{ item.title }}</span>
              <span class="not-found__link-text">{{ item.text }}</span>
            </span>
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  overflow: hidden;
}

.not-found__hero {
  position: relative;
  padding-block: 2rem 2.5rem;
  background:
    radial-gradient(ellipse 120% 80% at 50% -20%, rgb(91 155 235 / 18%) 0%, transparent 55%),
    radial-gradient(circle at 15% 35%, rgb(139 92 246 / 12%) 0%, transparent 28%),
    radial-gradient(circle at 85% 60%, rgb(20 97 205 / 10%) 0%, transparent 32%),
    $color-background;
}

.not-found__stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.85;
  background-image:
    radial-gradient(1px 1px at 10% 20%, rgb(240 248 255 / 90%) 50%, transparent 50%),
    radial-gradient(1px 1px at 25% 65%, rgb(240 248 255 / 70%) 50%, transparent 50%),
    radial-gradient(1.5px 1.5px at 40% 15%, rgb(167 139 250 / 80%) 50%, transparent 50%),
    radial-gradient(1px 1px at 55% 45%, rgb(240 248 255 / 75%) 50%, transparent 50%),
    radial-gradient(1px 1px at 70% 25%, rgb(240 248 255 / 65%) 50%, transparent 50%),
    radial-gradient(1.5px 1.5px at 82% 72%, rgb(91 155 235 / 75%) 50%, transparent 50%),
    radial-gradient(1px 1px at 92% 38%, rgb(240 248 255 / 70%) 50%, transparent 50%),
    radial-gradient(1px 1px at 18% 88%, rgb(240 248 255 / 60%) 50%, transparent 50%),
    radial-gradient(1px 1px at 48% 82%, rgb(240 248 255 / 55%) 50%, transparent 50%),
    radial-gradient(1px 1px at 63% 8%, rgb(240 248 255 / 80%) 50%, transparent 50%);
}

.not-found__hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.not-found__code {
  margin: 0;
  font-family: $font-mono;
  font-size: clamp(4.5rem, 16vw, 8.5rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: 0.04em;
  color: #8ec5ff;
  text-shadow:
    0.06em 0.06em 0 #6eb3f4,
    0.12em 0.12em 0 #4f9ce8,
    0 0 0.35em rgb(91 155 235 / 55%),
    0 0 0.8em rgb(91 155 235 / 25%);
}

.not-found__title {
  margin: 1rem 0 0.5rem;
  max-width: 20ch;
  font-family: $font-display;
  font-size: $text-2xl;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-wrap: balance;
  color: $color-default;

  @include sm {
    max-width: none;
    font-size: $text-3xl;
  }
}

.not-found__lead {
  margin: 0;
  max-width: 34rem;
  font-size: $text-base;
  line-height: 1.6;
  color: $color-secondary;
  text-wrap: pretty;

  @include sm {
    font-size: $text-lg;
  }
}

.not-found__scene {
  display: grid;
  gap: 1.5rem;
  width: 100%;
  margin-top: 1.75rem;
  align-items: center;

  @include lg {
    grid-template-columns: minmax(0, 1.35fr) minmax(16rem, 0.85fr);
    gap: 1.25rem;
    margin-top: 2rem;
    text-align: left;
  }
}

.not-found__illustration-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.not-found__illustration {
  width: min(100%, 36rem);
  height: auto;
  object-fit: contain;
  image-rendering: pixelated;
  filter: drop-shadow(0 12px 32px rgb(0 0 0 / 35%));
}

.not-found__tips {
  width: 100%;
  max-width: 22rem;
  margin-inline: auto;
  padding: 1rem 1.125rem 1.125rem;
  text-align: left;
  background: rgb(15 21 36 / 72%);
  border: 1px solid rgb(91 155 235 / 18%);
  border-radius: $radius-lg;
  box-shadow:
    0 12px 40px rgb(0 0 0 / 28%),
    inset 0 1px 0 rgb(255 255 255 / 4%);
  backdrop-filter: blur(12px);

  @include lg {
    margin-inline: 0 0;
    justify-self: end;
  }
}

.not-found__tips-bar {
  display: flex;
  gap: 0.375rem;
  margin-bottom: 0.875rem;
}

.not-found__tips-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;

  &--red {
    background: #ff5f57;
  }

  &--yellow {
    background: #febc2e;
  }

  &--green {
    background: #28c840;
  }
}

.not-found__tips-title {
  margin: 0 0 0.875rem;
  font-family: $font-display;
  font-size: $text-base;
  font-weight: 600;
  color: $color-default;
}

.not-found__tips-list {
  display: grid;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.not-found__tips-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  font-size: $text-sm;
  color: $color-secondary;
  text-align: left;
  text-decoration: none;
  background: transparent;
  border: none;
  border-radius: $radius-sm;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    color: $color-default;
    background: rgb(91 155 235 / 10%);
  }

  @include focus-ring;
}

.not-found__cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.not-found__cta-text {
  margin: 0;
  font-size: $text-base;
  color: $color-secondary;
}

.not-found__cta-link {
  text-decoration: none;
}

.not-found__cta-btn {
  box-shadow:
    0 0 0 1px rgb(91 155 235 / 35%),
    0 8px 24px rgb(20 97 205 / 35%);
}

.not-found__search {
  padding-block: 2.5rem 1.5rem;
}

.not-found__search-title {
  margin: 0 0 1rem;
  font-family: $font-display;
  font-size: $text-xl;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-align: center;
  color: $color-default;
}

.not-found__search-form {
  max-width: 42rem;
  margin-inline: auto;
}

.not-found__search-field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.125rem;
  color: var(--color-text-muted);
  background: var(--color-surface-muted);
  border: 1px solid $color-gray-300;
  border-radius: 999px;
  box-shadow: $shadow-sm;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus-within {
    border-color: $color-primary;
    box-shadow: 0 0 0 3px $color-primary-alpha-12;
  }
}

.not-found__search-input {
  flex: 1;
  min-width: 0;
  padding: 0;
  font-size: $text-base;
  color: $color-default;
  background: transparent;
  border: none;

  &::placeholder {
    color: var(--color-text-muted);
  }

  &:focus {
    outline: none;
  }
}

.not-found__links {
  padding-block: 0 3rem;
}

.not-found__links-grid {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;

  @include md {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.not-found__link-card {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  height: 100%;
  padding: 1.125rem 1.25rem;
  text-decoration: none;
  background: var(--color-surface-muted);
  border: 1px solid $color-gray-300;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: $color-primary-alpha-28;
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }

  @include focus-ring;
}

.not-found__link-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  color: $color-primary;
  background: $color-primary-alpha-10;
  border-radius: $radius-sm;
}

.not-found__link-body {
  display: grid;
  gap: 0.25rem;
}

.not-found__link-title {
  font-family: $font-display;
  font-size: $text-base;
  font-weight: 600;
  color: $color-default;
}

.not-found__link-text {
  font-size: $text-sm;
  line-height: 1.5;
  color: $color-secondary;
}

@media (prefers-reduced-motion: reduce) {
  .not-found__link-card {
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: none;
    }
  }
}
</style>
