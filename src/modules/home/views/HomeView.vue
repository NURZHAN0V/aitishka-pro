<script setup lang="ts">
import type { Ref } from 'vue'
import type { Benefit } from '@/index.d'
import { inject, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '@/core/api'
import BaseButton from '@/core/components/BaseButton.vue'
import BaseIcon from '@/core/components/BaseIcon.vue'
import { applyPageMeta } from '@/core/composables/usePageMeta'
import { useWhenVisible } from '@/core/composables/useWhenVisible'
import { HOME_PAGE_DESCRIPTION, HOME_PAGE_TITLE } from '@/modules/home/routes'

const enrollModalOpen = inject<Ref<boolean>>('enrollModalOpen', ref(false))
const benefits = ref<Benefit[]>([])
const { target: benefitsRef, visible: benefitsVisible } = useWhenVisible()

const heroStats = [
  { icon: 'rocket', tone: 'blue', title: '100+', text: 'полезных статей' },
  { icon: 'play', tone: 'violet', title: '50+', text: 'видеоуроков' },
  { icon: 'code', tone: 'green', title: 'Практика', text: 'с реальными примерами' },
  { icon: 'users', tone: 'sky', title: 'Для всех', text: 'от новичков до уверенных' },
] as const

onMounted(async () => {
  applyPageMeta({
    title: HOME_PAGE_TITLE,
    description: HOME_PAGE_DESCRIPTION,
    ogType: 'website',
    canonical: '/',
  })

  const site = await api.getSite()
  benefits.value = site.benefits
})

function openEnrollModal() {
  enrollModalOpen.value = true
}
</script>

<template>
  <div class="home">
    <section class="home__hero" aria-labelledby="home-hero-title">
      <div class="home__hero-grid">
        <div class="home__hero-copy">
          <p class="home__badge">
            <BaseIcon name="graduation" size="1rem" />
            <span>IT для новичков и не только</span>
          </p>
          <h1 id="home-hero-title" class="home__title">
            Обучение разработке
            <span class="home__title-accent">с нуля</span>
          </h1>
          <p class="home__lead">
            Статьи, видео и практика по Git, HTML, CSS, JavaScript. Структурированные материалы для новичков и тех, кто хочет закрепить навыки.
          </p>
          <div class="home__hero-actions">
            <BaseButton class="home__cta-primary" @click="openEnrollModal">
              <BaseIcon name="play" size="1.125rem" />
              <span>Начать обучение</span>
              <BaseIcon name="arrow-right" size="1.125rem" />
            </BaseButton>
            <RouterLink to="/articles" class="btn btn--outline home__cta-secondary">
              <BaseIcon name="book" size="1.125rem" />
              <span>Смотреть материалы</span>
            </RouterLink>
          </div>
        </div>

        <div class="home__hero-visual" aria-hidden="true">
          <div class="home__hero-glow" />
          <img
            class="home__hero-image"
            src="/images/hero-illustration.png"
            width="1024"
            height="668"
            alt=""
            decoding="async"
            fetchpriority="high"
          >
        </div>
      </div>

      <ul class="home__stats">
        <li
          v-for="stat in heroStats"
          :key="stat.title"
          class="home__stat"
        >
          <span class="home__stat-icon" :class="`home__stat-icon--${stat.tone}`">
            <BaseIcon :name="stat.icon" size="1.25rem" />
          </span>
          <span class="home__stat-text">
            <strong>{{ stat.title }}</strong>
            <span>{{ stat.text }}</span>
          </span>
        </li>
      </ul>
    </section>

    <section ref="benefitsRef" class="home__section">
      <h2 class="home__section-title">
        Что вы получите
      </h2>
      <ul v-if="benefitsVisible" class="home__benefits">
        <li v-for="item in benefits" :key="item.title" class="home__benefit card">
          <div class="home__benefit-icon">
            <BaseIcon :name="item.icon" size="1.5rem" />
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
          <RouterLink v-if="item.link && !item.external" :to="item.link" class="home__benefit-link">
            {{ item.linkText }}
            <BaseIcon name="arrow-right" />
          </RouterLink>
          <a
            v-else-if="item.link && item.external"
            :href="item.link"
            target="_blank"
            rel="noopener noreferrer"
            class="home__benefit-link"
          >
            {{ item.linkText }}
            <BaseIcon name="arrow-right" />
          </a>
        </li>
      </ul>
    </section>

    <section class="home__section">
      <div class="home__cta card">
        <h2>Готовы начать?</h2>
        <p>Оставьте заявку — мы свяжемся с вами и подберём подходящий формат обучения.</p>
        <BaseButton @click="openEnrollModal">
          Оставить заявку
        </BaseButton>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.home__hero {
  padding-block: 1.5rem 2.5rem;

  @include lg {
    padding-block: 2.5rem 3.5rem;
  }
}

.home__hero-grid {
  display: grid;
  gap: 2rem;
  align-items: center;

  @include lg {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: 2.5rem;
  }
}

.home__hero-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.home__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.25rem;
  padding: 0.375rem 0.875rem;
  border-radius: 999px;
  background: color-mix(in srgb, $color-primary 10%, transparent);
  color: $color-primary;
  font-size: $text-sm;
  font-weight: 500;
  line-height: 1.2;
  animation: home-fade-up 0.55s ease both;
}

.home__title {
  margin: 0;
  font-family: $font-display;
  font-size: clamp(2.25rem, 5vw, 3.75rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.035em;
  text-wrap: balance;
  max-width: 14ch;
  animation: home-fade-up 0.6s ease 0.05s both;
}

.home__title-accent {
  display: block;
  color: $color-primary;
}

.home__lead {
  margin: 1.25rem 0 0;
  max-width: 36rem;
  font-size: $text-base;
  line-height: 1.65;
  color: $color-secondary;
  text-wrap: pretty;
  animation: home-fade-up 0.65s ease 0.1s both;

  @include sm {
    font-size: $text-lg;
  }
}

.home__hero-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  margin-top: 1.75rem;
  animation: home-fade-up 0.7s ease 0.15s both;

  @include sm {
    flex-direction: row;
    flex-wrap: wrap;
    width: auto;
  }
}

.home__cta-primary,
.home__cta-secondary {
  min-height: 3rem;
}

.home__hero-visual {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 16rem;
  animation: home-fade-up 0.75s ease 0.12s both;

  @include lg {
    min-height: 22rem;
  }
}

.home__hero-glow {
  position: absolute;
  inset: 12% 8% 18%;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    color-mix(in srgb, $color-primary 22%, transparent) 0%,
    color-mix(in srgb, $color-primary 8%, transparent) 45%,
    transparent 72%
  );
  filter: blur(8px);
  pointer-events: none;
}

.home__hero-image {
  position: relative;
  z-index: 1;
  width: min(100%, 34rem);
  height: auto;
  animation: home-float 5.5s ease-in-out infinite;
}

.home__stats {
  display: grid;
  gap: 0.75rem;
  margin: 2rem 0 0;
  padding: 0;
  list-style: none;
  animation: home-fade-up 0.7s ease 0.2s both;

  @include sm {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  @include lg {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-top: 2.75rem;
  }
}

.home__stat {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.125rem;
  border: 1px solid $color-gray-200;
  border-radius: $radius-lg;
  background: $color-white;
  box-shadow: $shadow-sm;
  transition: border-color 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: $color-primary-alpha-30;
    transform: translateY(-2px);
  }
}

.home__stat-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: $radius-sm;

  &--blue {
    background: $color-primary-alpha-10;
    color: $color-primary;
  }

  &--violet {
    background: color-mix(in srgb, #7c5cbf 14%, transparent);
    color: #6a4db0;
  }

  &--green {
    background: color-mix(in srgb, #22a06b 14%, transparent);
    color: #1b8a5a;
  }

  &--sky {
    background: color-mix(in srgb, #3b9eff 14%, transparent);
    color: #2a7fd4;
  }
}

.home__stat-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;

  strong {
    font-family: $font-display;
    font-size: $text-lg;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: $color-default;
  }

  span {
    font-size: $text-sm;
    line-height: 1.35;
    color: $color-secondary;
  }
}

.home__section {
  padding-block: 2.5rem;
}

.home__section-title {
  position: relative;
  width: fit-content;
  margin: 0 auto 2rem;
  font-family: $font-display;
  font-size: $text-2xl;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-wrap: balance;
  text-align: center;

  &::after {
    content: '';
    display: block;
    width: 2.5rem;
    height: 0.2rem;
    margin: 0.75rem auto 0;
    border-radius: 999px;
    background: $color-primary;
  }

  @include sm {
    font-size: $text-3xl;
  }
}

.home__benefits {
  display: grid;
  gap: 1rem;

  @include sm {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @include lg {
    grid-template-columns: repeat(4, 1fr);
  }
}

.home__benefit {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem 1.5rem;
  transition: border-color 0.2s;

  &:hover {
    border-color: $color-primary-alpha-30;
  }

  h3 {
    font-family: $font-display;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  p {
    font-size: $text-sm;
    color: $color-secondary;
    flex: 1;
  }
}

.home__benefit-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: $color-primary-alpha-10;
  border-radius: $radius-sm;
  color: $color-primary;
}

.home__benefit-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: $color-primary;

  &:hover {
    color: $color-primary-hover;
  }
}

.home__cta {
  max-width: 42rem;
  margin-inline: auto;
  padding: 2rem 2.5rem;
  text-align: center;

  h2 {
    font-family: $font-display;
    font-size: $text-xl;
    font-weight: 600;
    letter-spacing: -0.02em;

    @include sm {
      font-size: $text-2xl;
    }
  }

  p {
    margin-block: 0.75rem 1.5rem;
    color: $color-secondary;
  }
}

@keyframes home-fade-up {
  from {
    opacity: 0;
    transform: translateY(0.75rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes home-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-0.5rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .home__badge,
  .home__title,
  .home__lead,
  .home__hero-actions,
  .home__hero-visual,
  .home__stats,
  .home__hero-image {
    animation: none;
  }
}
</style>
