<script setup lang="ts">
import AffiliateBanner from '@/modules/layout/components/AffiliateBanner.vue'
</script>

<template>
  <aside class="article-side-banner">
    <AffiliateBanner
      partner="cloud"
      format="sidebar"
    />
  </aside>
</template>

<style scoped lang="scss">
.article-side-banner {
  display: none;

  @include lg {
    display: block;
    position: sticky;
    top: 5rem;
    align-self: start;
  }
}
</style>
