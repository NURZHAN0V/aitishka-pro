<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePageBreadcrumbs } from '@/core/composables/usePageBreadcrumbs'
import ArticlesPostGrid from '@/modules/articles/components/ArticlesPostGrid.vue'
import { usePostsCatalog } from '@/modules/articles/composables/usePostsCatalog'
import { buildCategoryBreadcrumbs } from '@/modules/articles/utils/buildArticlesCategoryBreadcrumbs'

const route = useRoute()
const { posts, taxonomy, ready, ensureLoaded } = usePostsCatalog()
const { setPageBreadcrumbs, clearPageBreadcrumbs } = usePageBreadcrumbs()
const loading = ref(!ready.value)

const categorySlug = computed(() => route.params.category as string)

const filtered = computed(() =>
  posts.value.filter(p => p.category?.slug === categorySlug.value),
)

function syncBreadcrumbs() {
  if (!taxonomy.value)
    return

  setPageBreadcrumbs(buildCategoryBreadcrumbs(taxonomy.value, categorySlug.value))
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

watch(categorySlug, syncBreadcrumbs)
onUnmounted(clearPageBreadcrumbs)
</script>

<template>
  <div class="category-view">
    <ArticlesPostGrid
      :posts="filtered"
      :loading="loading"
      empty-message="В этой категории пока нет статей."
    />
  </div>
</template>

<style scoped lang="scss">
.category-view {
  margin-top: 0.5rem;
}
</style>
