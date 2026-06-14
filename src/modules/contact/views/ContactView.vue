<script setup lang="ts">
import type { Ref } from 'vue'
import { inject, onMounted, ref } from 'vue'
import { api } from '@/core/api'
import BaseButton from '@/core/components/BaseButton.vue'
import BaseIcon from '@/core/components/BaseIcon.vue'

const enrollModalOpen = inject<Ref<boolean>>('enrollModalOpen', ref(false))
const phone = ref('')
const email = ref('')
const address = ref('')
const social = ref<{ label: string, url: string, icon: string }[]>([])

onMounted(async () => {
  const site = await api.getSite()
  phone.value = site.contact.phone
  email.value = site.contact.email
  address.value = site.contact.address
  social.value = site.contact.social
})

function openEnrollModal() {
  enrollModalOpen.value = true
}
</script>

<template>
  <div class="contact">
    <h2 class="page-title">
      Контакты
    </h2>
    <p class="page-lead">
      Свяжитесь с нами по телефону, почте или в мессенджерах.
    </p>

    <section class="contact__cards">
      <a :href="`tel:${phone.replace(/\D/g, '')}`" class="contact__card card">
        <div class="contact__card-icon">
          <BaseIcon name="phone" />
        </div>
        <div>
          <h3>Телефон</h3>
          <p>{{ phone }}</p>
        </div>
      </a>
      <a :href="`mailto:${email}`" class="contact__card card">
        <div class="contact__card-icon">
          <BaseIcon name="mail" />
        </div>
        <div>
          <h3>Email</h3>
          <p>{{ email }}</p>
        </div>
      </a>
      <div class="contact__card card">
        <div class="contact__card-icon">
          <BaseIcon name="map-pin" />
        </div>
        <div>
          <h3>Адрес</h3>
          <p>{{ address }}</p>
        </div>
      </div>
    </section>

    <section class="contact__social">
      <h3>Мы в соцсетях</h3>
      <div class="contact__social-links">
        <a
          v-for="item in social"
          :key="item.url"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="contact__social-link card"
        >
          <BaseIcon :name="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </div>
    </section>

    <section class="contact__cta card">
      <h3>Хотите начать обучение?</h3>
      <p>Оставьте заявку — мы свяжемся с вами и подберём подходящий формат.</p>
      <BaseButton @click="openEnrollModal">
        Оставить заявку
      </BaseButton>
    </section>
  </div>
</template>

<style scoped lang="scss">
.contact__cards {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;

  @include sm {
    grid-template-columns: repeat(2, 1fr);
  }

  @include lg {
    grid-template-columns: repeat(3, 1fr);
  }
}

.contact__card {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  transition: border-color 0.2s;

  &:hover {
    border-color: rgb(209 125 77 / 30%);
  }

  h3 {
    font-weight: 500;
  }

  p {
    margin-top: 0.125rem;
    font-size: 0.875rem;
    color: $color-secondary;
    word-break: break-all;
  }
}

.contact__card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  background: rgb(209 125 77 / 10%);
  border-radius: $radius-sm;
  color: $color-primary;

  @include sm {
    width: 3rem;
    height: 3rem;
  }
}

.contact__social {
  margin-top: 2rem;

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
}

.contact__social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.contact__social-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 500;
  color: $color-primary;
  transition: border-color 0.2s, background-color 0.2s;

  &:hover {
    border-color: $color-primary;
    background: rgb(209 125 77 / 5%);
  }
}

.contact__cta {
  margin-top: 2rem;
  padding: 1.5rem 2rem;
  text-align: center;

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
  }

  p {
    margin-block: 0.5rem 1rem;
    font-size: 0.875rem;
    color: $color-secondary;
    max-width: 28rem;
    margin-inline: auto;
  }
}
</style>
