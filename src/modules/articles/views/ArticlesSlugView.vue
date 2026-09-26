<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePageBreadcrumbs } from '@/core/composables/usePageBreadcrumbs'
import ArticlesPostGrid from '@/modules/articles/components/ArticlesPostGrid.vue'
import { usePostsCatalog } from '@/modules/articles/composables/usePostsCatalog'
import { buildCategoryBreadcrumbs } from '@/modules/articles/utils/buildArticlesCategoryBreadcrumbs'
import ArticleView from '@/modules/articles/views/ArticleView.vue'
import { NEWS_CATEGORY_SLUG } from '@/modules/news/constants'

const route = useRoute()
const { posts, taxonomy, ready, ensureLoaded } = usePostsCatalog()
const { setPageBreadcrumbs, clearPageBreadcrumbs } = usePageBreadcrumbs()
const loading = ref(true)

const slug = computed(() => route.params.slug as string)

const isCategory = computed(() => {
  if (!taxonomy.value)
    return false
  return taxonomy.value.categories.some(c => c.slug === slug.value && c.slug !== NEWS_CATEGORY_SLUG)
})

const filtered = computed(() =>
  posts.value.filter(p => p.category?.slug === slug.value),
)

const decided = computed(() => ready.value && Boolean(taxonomy.value))

function syncBreadcrumbs() {
  if (!taxonomy.value || !isCategory.value)
    return
  setPageBreadcrumbs(buildCategoryBreadcrumbs(taxonomy.value, slug.value))
}

onMounted(async () => {
  try {
    await ensureLoaded()
    syncBreadcrumbs()
  }
  finally {
    loading.value = false
  }
})

watch(slug, async () => {
  loading.value = true
  await ensureLoaded()
  if (isCategory.value)
    syncBreadcrumbs()
  else
    clearPageBreadcrumbs()
  loading.value = false
})

onUnmounted(clearPageBreadcrumbs)
</script>

<template>
  <div v-if="loading || !decided" class="articles-slug-view__status">
    Загрузка…
  </div>
  <ArticlesPostGrid
    v-else-if="isCategory"
    :posts="filtered"
    :loading="false"
    empty-message="В этой категории пока нет статей."
  />
  <ArticleView v-else />
</template>

<style scoped lang="scss">
.articles-slug-view__status {
  padding: 2rem 0;
  color: $color-secondary;
}
</style>
