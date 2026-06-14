<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseButton from '@/core/components/BaseButton.vue'
</script>

<template>
  <div class="not-found">
    <h1 class="not-found__code">
      404
    </h1>
    <p class="not-found__text">
      Страница не найдена
    </p>
    <RouterLink to="/">
      <BaseButton>На главную</BaseButton>
    </RouterLink>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 50vh;
  text-align: center;
}

.not-found__code {
  font-size: 4rem;
  font-weight: 700;
  color: $color-primary;
}

.not-found__text {
  color: $color-secondary;
  margin-bottom: 0.5rem;
}
</style>
