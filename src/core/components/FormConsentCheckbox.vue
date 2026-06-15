<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  id: string
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label class="form-consent" :for="id">
    <input
      :id="id"
      class="form-consent__input"
      type="checkbox"
      :checked="modelValue"
      required
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
    <span class="form-consent__text">
      Я принимаю
      <RouterLink to="/terms" target="_blank" rel="noopener" @click.stop>
        Пользовательское соглашение
      </RouterLink>
      и даю согласие на обработку персональных данных в соответствии с
      <RouterLink to="/privacy" target="_blank" rel="noopener" @click.stop>
        Политикой конфиденциальности
      </RouterLink>
    </span>
  </label>
</template>
