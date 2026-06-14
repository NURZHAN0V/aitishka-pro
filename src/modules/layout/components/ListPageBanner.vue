<script setup lang="ts">
import AffiliateBanner from '@/modules/layout/components/AffiliateBanner.vue'
</script>

<template>
  <div class="list-page-banner">
    <AffiliateBanner
      partner="host"
      format="leaderboard"
    />
  </div>
</template>

<style scoped lang="scss">
.list-page-banner {
  margin-bottom: 1.5rem;
}
</style>
