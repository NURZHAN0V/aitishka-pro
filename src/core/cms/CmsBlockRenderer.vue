<script setup lang="ts">
import type { CmsBlockDocument } from '@/index.d'
import { computed } from 'vue'
import { renderCmsBlocks } from '@/core/cms/renderBlocks'
import { handleArticleCodeBlockClick } from '@/modules/articles/composables/useArticleCodeBlocks'

const props = defineProps<{
  document?: CmsBlockDocument | null
}>()

const html = computed(() => renderCmsBlocks(props.document))
</script>

<template>
  <div
    v-if="html"
    class="cms-blocks prose"
    @click="handleArticleCodeBlockClick"
    v-html="html"
  />
</template>

<style scoped lang="scss">
.cms-blocks {
  :deep(.cms-block__embed) {
    position: relative;
    aspect-ratio: 16 / 9;
    margin: 1.25rem 0;
    overflow: hidden;
    border-radius: $radius-lg;
    background: $color-gray-200;

    iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
  }

  :deep(.cms-block__btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.5rem;
    padding: 0.5rem 1.25rem;
    border-radius: $radius-lg;
    background: $color-primary;
    color: $color-on-primary;
    font-weight: 600;
    text-decoration: none;
  }

  :deep(figure) {
    margin: 1.25rem 0;

    img {
      display: block;
      max-width: 100%;
      height: auto;
      border-radius: $radius-lg;
    }

    figcaption {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: $color-secondary;
    }
  }

  :deep(blockquote) {
    margin: 1.25rem 0;
    padding: 1rem 1.25rem;
    border-left: 3px solid $color-primary;
    background: $color-primary-alpha-8;
    border-radius: 0 $radius-lg $radius-lg 0;

    cite {
      display: block;
      margin-top: 0.75rem;
      font-size: 0.875rem;
      color: $color-secondary;
      font-style: normal;
    }
  }

  :deep(.cms-block__accordion-item) {
    margin: 0.5rem 0;
    border: 1px solid $color-gray-200;
    border-radius: $radius-lg;
    padding: 0.75rem 1rem;

    summary {
      cursor: pointer;
      font-weight: 600;
    }
  }
}
</style>
