<script setup lang="ts">
import type { Feature } from '@/index.d'
import { onMounted, ref } from 'vue'
import { api } from '@/core/api'
import BaseIcon from '@/core/components/BaseIcon.vue'
import SiteLogo from '@/modules/layout/components/SiteLogo.vue'

const title = ref('О нас')
const lead = ref('')
const paragraphs = ref<string[]>([])
const features = ref<Feature[]>([])

onMounted(async () => {
  const site = await api.getSite()
  title.value = site.about.title
  lead.value = site.about.lead
  paragraphs.value = site.about.paragraphs
  features.value = site.about.features
})
</script>

<template>
  <div class="about">
    <h2 class="page-title">
      {{ title }}
    </h2>
    <p class="page-lead">
      {{ lead }}
    </p>

    <section class="about__intro card">
      <p v-for="(p, i) in paragraphs" :key="i" class="about__paragraph">
        <strong v-if="i === 0" class="about__brand"><SiteLogo /></strong>
        {{ i === 0 ? p.replace('AITISHKAPRO —', '—') : p }}
      </p>
    </section>

    <section class="about__features">
      <h3>Чем мы занимаемся</h3>
      <ul class="about__features-grid">
        <li v-for="item in features" :key="item.title" class="about__feature card">
          <div class="about__feature-icon">
            <BaseIcon :name="item.icon" />
          </div>
          <div>
            <h4>{{ item.title }}</h4>
            <p>{{ item.text }}</p>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="scss">
.about__intro {
  margin-top: 1.5rem;
  padding: 1.5rem 2rem;
}

.about__paragraph {
  line-height: 1.7;
  color: $color-default;

  & + & {
    margin-top: 1rem;
    color: $color-secondary;
  }
}

.about__brand {
  font-size: 1.125rem;
  font-weight: normal;
}

.about__features {
  margin-top: 2rem;

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;

    @include sm {
      font-size: 1.25rem;
    }
  }
}

.about__features-grid {
  display: grid;
  gap: 1rem;

  @include sm {
    grid-template-columns: repeat(2, 1fr);
  }

  @include lg {
    grid-template-columns: repeat(3, 1fr);
  }
}

.about__feature {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  transition: border-color 0.2s;

  &:hover {
    border-color: $color-primary-alpha-30;
  }

  h4 {
    font-weight: 500;
  }

  p {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: $color-secondary;
  }
}

.about__feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  background: $color-primary-alpha-10;
  border-radius: $radius-sm;
  color: $color-primary;

  @include sm {
    width: 3rem;
    height: 3rem;
  }
}
</style>
