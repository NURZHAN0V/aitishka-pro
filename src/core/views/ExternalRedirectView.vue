<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
  const url = route.meta.redirectUrl
  if (typeof url === 'string')
    window.location.replace(url)
})
</script>

<template>
  <p class="external-redirect">
    Переход…
  </p>
</template>

<style scoped lang="scss">
.external-redirect {
  padding: 2rem 0;
  color: $color-secondary;
  text-align: center;
}
</style>
