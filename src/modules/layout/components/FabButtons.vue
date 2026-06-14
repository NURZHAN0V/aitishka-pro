<script setup lang="ts">
import type { Ref } from 'vue'
import { inject, ref } from 'vue'
import BaseIcon from '@/core/components/BaseIcon.vue'

const telegramModalOpen = inject<Ref<boolean>>('telegramModalOpen', ref(false))

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openTelegram() {
  telegramModalOpen.value = true
}
</script>

<template>
  <div class="fab">
    <button type="button" class="fab__btn" aria-label="Наверх" @click="scrollToTop">
      <BaseIcon name="chevron-up" />
    </button>
    <button type="button" class="fab__btn fab__btn--telegram" aria-label="Telegram" @click="openTelegram">
      <BaseIcon name="telegram" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.fab {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fab__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: $color-white;
  border: 1px solid $color-gray-200;
  border-radius: 50%;
  box-shadow: $shadow-md;
  color: $color-primary;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background: $color-primary;
    color: $color-white;
  }

  &--telegram {
    background: #34aae5;
    border-color: #34aae5;
    color: $color-white;

    &:hover {
      background: #299fda;
    }
  }
}
</style>
