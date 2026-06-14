<script setup lang="ts">
import AffiliateBanner from '@/modules/layout/components/AffiliateBanner.vue'
</script>

<template>
  <section class="footer-partner-strip">
    <div class="footer-partner-strip__inner container">
      <AffiliateBanner
        partner="host"
        format="leaderboard"
        class="footer-partner-strip__banner footer-partner-strip__banner--desktop"
      />
      <AffiliateBanner
        partner="cloud"
        format="inline"
        class="footer-partner-strip__banner footer-partner-strip__banner--mobile"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.footer-partner-strip {
  background: rgb(255 255 255 / 4%);
  border-block: 1px solid $color-inverse-divider;
}

.footer-partner-strip__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-block: 1.25rem;
}

.footer-partner-strip__banner--desktop {
  display: none;

  @include lg {
    display: flex;
  }
}

.footer-partner-strip__banner--mobile {
  @include lg {
    display: none;
  }
}
</style>
