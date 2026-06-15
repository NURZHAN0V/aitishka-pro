<script setup lang="ts">
import type { AffiliatePartnerId, BannerFormat } from '@/core/affiliates/timewebBanners'
import { computed } from 'vue'
import { AFFILIATE_PARTNERS, getBannerAssets } from '@/core/affiliates/timewebBanners'

const props = defineProps<{
  partner: AffiliatePartnerId
  format: BannerFormat
}>()

const partnerData = computed(() => AFFILIATE_PARTNERS[props.partner])
const assets = computed(() => getBannerAssets(props.partner, props.format))
const sources = computed(() => assets.value.filter(asset => asset.media))
const fallback = computed(() => assets.value.find(asset => !asset.media) ?? assets.value.at(-1))
</script>

<template>
  <div
    v-if="fallback"
    class="affiliate-banner"
    :class="`affiliate-banner--${format}`"
  >
    <a
      :href="partnerData.externalUrl"
      class="affiliate-banner__link"
      target="_blank"
      rel="noopener noreferrer sponsored"
      :aria-label="partnerData.ariaLabel"
    >
      <picture v-if="sources.length">
        <source
          v-for="source in sources"
          :key="source.src"
          :media="source.media"
          :srcset="source.src"
          :width="source.width"
          :height="source.height"
        >
        <img
          :src="fallback.src"
          :alt="partnerData.alt"
          class="affiliate-banner__image"
          :width="fallback.width"
          :height="fallback.height"
          loading="lazy"
          decoding="async"
        >
      </picture>
      <img
        v-else
        :src="fallback.src"
        :alt="partnerData.alt"
        class="affiliate-banner__image"
        :width="fallback.width"
        :height="fallback.height"
        loading="lazy"
        decoding="async"
      >
    </a>
  </div>
</template>

<style scoped lang="scss">
.affiliate-banner {
  display: flex;
  flex-direction: column;
}

.affiliate-banner__link {
  display: block;
  overflow: hidden;
  border-radius: $radius-sm;
  box-shadow: $shadow-md;
  transition: opacity 0.2s ease, transform 0.2s ease;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  @include focus-ring;
}

.affiliate-banner__image {
  display: block;
  max-width: 100%;
  height: auto;
}

.affiliate-banner--sidebar .affiliate-banner__image {
  width: 180px;
}

.affiliate-banner--leaderboard,
.affiliate-banner--inline {
  align-items: center;

  .affiliate-banner__link {
    width: fit-content;
    max-width: 100%;
    margin-inline: auto;
  }
}

.affiliate-banner--badge .affiliate-banner__image {
  width: 168px;
}
</style>
