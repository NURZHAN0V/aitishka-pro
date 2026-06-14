<script setup lang="ts">
import { computed } from 'vue'
import { getIcon } from '@/core/icons'

const props = withDefaults(defineProps<{
  name: string
  size?: string | number
}>(), {
  size: '1.25rem',
})

const svg = computed(() => getIcon(props.name))
</script>

<template>
  <span
    class="base-icon"
    :style="{ width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }"
    aria-hidden="true"
    v-html="svg"
  />
</template>

<style scoped lang="scss">
.base-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  :deep(svg) {
    width: 100%;
    height: 100%;
    display: block;
  }
}
</style>
