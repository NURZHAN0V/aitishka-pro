<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePageBreadcrumbs } from '@/core/composables/usePageBreadcrumbs'
import ArticlesPostGrid from '@/modules/articles/components/ArticlesPostGrid.vue'
import { usePostsCatalog } from '@/modules/articles/composables/usePostsCatalog'
import { buildSubcategoryBreadcrumbs } from '@/modules/articles/utils/buildArticlesCategoryBreadcrumbs'
import ListPageBanner from '@/modules/layout/components/ListPageBanner.vue'

const route = useRoute()
const { posts, taxonomy, ready, ensureLoaded } = usePostsCatalog()
const { setPageBreadcrumbs, clearPageBreadcrumbs } = usePageBreadcrumbs()
const loading = ref(!ready.value)

const categorySlug = computed(() => route.params.category as string)
const subcategorySlug = computed(() => route.params.subcategory as string)

const filtered = computed(() =>
  posts.value.filter(
    p => p.category?.slug === categorySlug.value && p.subcategory?.slug === subcategorySlug.value,
  ),
)

function syncBreadcrumbs() {
  if (!taxonomy.value)
    return

  setPageBreadcrumbs(buildSubcategoryBreadcrumbs(
    taxonomy.value,
    categorySlug.value,
    subcategorySlug.value,
  ))
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

watch([categorySlug, subcategorySlug], syncBreadcrumbs)
onUnmounted(clearPageBreadcrumbs)
</script>

<template>
  <div class="subcategory-view">
    <ListPageBanner />
    <ArticlesPostGrid
      :posts="filtered"
      :loading="loading"
      empty-message="В этой подкатегории пока нет статей."
    />
  </div>
</template>

<style scoped lang="scss">
.subcategory-view {
  margin-top: 0.5rem;
}
</style>
