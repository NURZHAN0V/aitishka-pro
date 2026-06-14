<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'outline'
  block?: boolean
  type?: 'button' | 'submit'
}>(), {
  variant: 'primary',
  block: false,
  type: 'button',
})
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, { 'btn--block': block }]"
  >
    <slot />
  </button>
</template>
