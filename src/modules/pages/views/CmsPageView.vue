<script setup lang="ts">
import type { Post } from '@/index.d'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/core/api'
import CmsBlockRenderer from '@/core/cms/CmsBlockRenderer.vue'
import { useMarkdown } from '@/core/composables/useMarkdown'
import { usePageBreadcrumbs } from '@/core/composables/usePageBreadcrumbs'
import { applyPageMeta } from '@/core/composables/usePageMeta'
import { handleArticleCodeBlockClick } from '@/modules/articles/composables/useArticleCodeBlocks'

const route = useRoute()
const { render } = useMarkdown()
const { setPageBreadcrumbs, clearPageBreadcrumbs } = usePageBreadcrumbs()
const page = ref<Post | null>(null)
const html = ref('')
const loading = ref(true)

const useBlocks = computed(() => Boolean(page.value?.contentBlocks?.blocks?.length))

async function loadPage() {
  loading.value = true
  const slug = route.params.slug as string
  page.value = await api.getPage(slug)
  if (page.value) {
    html.value = useBlocks.value ? '' : render(page.value.body)
    setPageBreadcrumbs([
      { label: 'Главная', to: '/' },
      { label: page.value.title },
    ])
    applyPageMeta({
      title: page.value.title,
      description: page.value.meta.description,
      ogTitle: page.value.meta.ogTitle,
      ogDescription: page.value.meta.ogDescription,
      ogImage: page.value.meta.ogImage,
      canonical: page.value.url,
    })
  }
  else {
    html.value = ''
    clearPageBreadcrumbs()
  }
  loading.value = false
}

onMounted(loadPage)
onUnmounted(clearPageBreadcrumbs)
watch(() => route.params.slug, loadPage)
</script>

<template>
  <div class="cms-page">
    <p v-if="loading" class="cms-page__status">
      Загрузка…
    </p>
    <template v-else-if="page">
      <h1 class="page-title">
        {{ page.title }}
      </h1>
      <p
        v-if="page.excerpt"
        class="page-lead"
      >
        {{ page.excerpt }}
      </p>
      <div
        class="cms-page__body prose"
        @click="handleArticleCodeBlockClick"
      >
        <CmsBlockRenderer
          v-if="useBlocks"
          :document="page.contentBlocks"
        />
        <div
          v-else
          v-html="html"
        />
      </div>
    </template>
    <p v-else class="cms-page__status">
      Страница не найдена
    </p>
  </div>
</template>

<style scoped lang="scss">
.cms-page__body {
  margin-top: 1.5rem;
  max-width: 65ch;
}

.cms-page__status {
  padding: 2rem 0;
  color: $color-secondary;
}
</style>
