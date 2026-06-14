<script setup lang="ts">
import type { Ref } from 'vue'
import type { Benefit, Technology } from '@/index.d'
import { inject, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '@/core/api'
import BaseButton from '@/core/components/BaseButton.vue'
import BaseIcon from '@/core/components/BaseIcon.vue'
import { useWhenVisible } from '@/core/composables/useWhenVisible'

const enrollModalOpen = inject<Ref<boolean>>('enrollModalOpen', ref(false))
const benefits = ref<Benefit[]>([])
const technologies = ref<Technology[]>([])
const { target: benefitsRef, visible: benefitsVisible } = useWhenVisible()

onMounted(async () => {
  const site = await api.getSite()
  benefits.value = site.benefits
  technologies.value = site.technologies
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

    <section class="home__section home__tech card">
      <h2 class="home__section-title">
        Направления обучения
      </h2>
      <p class="home__tech-lead">
        Выберите технологию и начните с основ или проверьте свой уровень.
      </p>
      <div class="home__tech-grid">
        <RouterLink
          v-for="tech in technologies"
          :key="tech.id"
          :to="tech.to"
          class="home__tech-tag"
          :style="{
            backgroundColor: tech.color,
            color: tech.textColor || '#fff',
          }"
        >
          {{ tech.label }}
        </RouterLink>
      </div>
      <p class="home__tech-note">
        На странице
        <RouterLink to="/articles" class="home__inline-link">
          Статьи
        </RouterLink>
        можно пройти тест по любой технологии.
      </p>
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
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.2;
  max-width: 48rem;
  margin-inline: auto;

  @include sm {
    font-size: 2.25rem;
  }

  @include lg {
    font-size: 3rem;
  }
}

.home__title-accent {
  color: $color-primary;
}

.home__lead {
  margin-top: 1rem;
  font-size: 1.125rem;
  color: $color-secondary;
  max-width: 42rem;
  margin-inline: auto;

  @include sm {
    margin-top: 1.5rem;
    font-size: 1.25rem;
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
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;

  @include sm {
    font-size: 1.875rem;
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
    border-color: rgb(209 125 77 / 30%);
  }

  h3 {
    font-weight: 600;
  }

  p {
    font-size: 0.875rem;
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
  background: rgb(209 125 77 / 10%);
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

.home__tech {
  padding: 1.5rem 2rem;
}

.home__tech-lead {
  text-align: center;
  color: $color-secondary;
  max-width: 36rem;
  margin: 0 auto 1.5rem;
}

.home__tech-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;

  @include sm {
    grid-template-columns: repeat(3, 1fr);
  }

  @include lg {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
  }
}

.home__tech-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: $radius-sm;
  box-shadow: $shadow-sm;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

.home__tech-note {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: $color-secondary;
}

.home__inline-link {
  color: $color-primary;
  text-decoration: underline;
}

.home__cta {
  max-width: 42rem;
  margin-inline: auto;
  padding: 2rem 2.5rem;
  text-align: center;

  h2 {
    font-size: 1.25rem;
    font-weight: 600;

    @include sm {
      font-size: 1.5rem;
    }
  }

  p {
    margin-block: 0.75rem 1.5rem;
    color: $color-secondary;
  }
}
</style>
