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
    <section class="home__hero">
      <h1 class="home__title">
        Обучение разработке
        <span class="home__title-accent"> с нуля</span>
      </h1>
      <p class="home__lead">
        Статьи, видео и практика по Git, HTML, CSS, JavaScript. Структурированные материалы для новичков и тех, кто хочет закрепить навыки.
      </p>
      <p class="home__rebrand">
        Образовательная платформа «Айтишка» (AITISHKAPRO). Раньше сайт был на pluspixel.ru — материалы переехали сюда.
        <RouterLink to="/articles/novosti/platforma/pereehali-s-pluspixel-ru" class="home__rebrand-link">
          Подробнее о переезде
        </RouterLink>
      </p>
      <div class="home__hero-actions">
        <BaseButton @click="openEnrollModal">
          Начать обучение
        </BaseButton>
        <RouterLink to="/articles" class="btn btn--outline btn--block">
          Смотреть материалы
        </RouterLink>
      </div>
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
  padding-block: 2.5rem 3.5rem;
  text-align: center;

  @include lg {
    padding-block: 5rem;
  }
}

.home__title {
  font-family: $font-display;
  font-size: $text-3xl;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.03em;
  text-wrap: balance;
  max-width: 48rem;
  margin-inline: auto;

  @include sm {
    font-size: $text-4xl;
  }
}

.home__title-accent {
  color: $color-primary;
}

.home__lead {
  margin-top: 1rem;
  font-size: $text-lg;
  line-height: 1.6;
  color: $color-secondary;
  max-width: 42rem;
  margin-inline: auto;
  text-wrap: pretty;

  @include sm {
    margin-top: 1.5rem;
    font-size: $text-xl;
  }
}

.home__rebrand {
  margin-top: 0.75rem;
  font-size: $text-sm;
  line-height: 1.6;
  color: $color-secondary;
  max-width: 42rem;
  margin-inline: auto;
  text-wrap: pretty;

  @include sm {
    margin-top: 1rem;
    font-size: $text-base;
  }
}

.home__rebrand-link {
  display: inline;
  margin-left: 0.25rem;
  color: $color-primary;
  text-decoration: underline;

  &:hover {
    color: $color-primary-hover;
  }
}

.home__hero-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 2rem;
  align-items: center;

  @include sm {
    flex-direction: row;
    justify-content: center;
  }
}

.home__section {
  padding-block: 2.5rem;
}

.home__section-title {
  font-family: $font-display;
  font-size: $text-2xl;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-wrap: balance;
  text-align: center;
  margin-bottom: 2rem;

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
</style>
