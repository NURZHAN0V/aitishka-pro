<script setup lang="ts">
const BANNER_URL = '/twcloud'
const BANNER_IMAGE = 'https://wm.timeweb.ru/images/posters/180x320/180x320.jpg'
</script>

<template>
  <aside class="article-side-banner">
    <a
      :href="BANNER_URL"
      class="article-side-banner__link"
      rel="noopener sponsored"
      aria-label="Timeweb Cloud — перейти на сайт"
    >
      <img
        :src="BANNER_IMAGE"
        alt="Timeweb Cloud — хостинг с бесплатным периодом на 10 дней"
        class="article-side-banner__image"
        width="180"
        height="320"
        loading="lazy"
        decoding="async"
      >
    </a>
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

.article-side-banner__link {
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

.article-side-banner__image {
  display: block;
  width: 180px;
  height: auto;
}
</style>
