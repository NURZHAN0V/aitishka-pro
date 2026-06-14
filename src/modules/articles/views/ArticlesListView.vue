<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ArticlesPostGrid from '@/modules/articles/components/ArticlesPostGrid.vue'
import { usePostsCatalog } from '@/modules/articles/composables/usePostsCatalog'
import { NEWS_CATEGORY_SLUG } from '@/modules/news/constants'

const { posts, ready, ensureLoaded } = usePostsCatalog()
const loading = ref(!ready.value)

onMounted(async () => {
  try {
    await ensureLoaded()
  }
  finally {
    loading.value = false
  }
})

const sortedPosts = computed(() =>
  [...posts.value]
    .filter(p => p.category?.slug !== NEWS_CATEGORY_SLUG)
    .sort((a, b) =>
      new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime(),
    ),
)
</script>

<template>
  <div class="articles-list">
    <ArticlesPostGrid
      :posts="sortedPosts"
      :loading="loading"
      empty-message="Статьи пока не опубликованы."
    />
  </div>
</template>

<style scoped lang="scss">
.articles-list {
  margin-top: 1.5rem;
}
</style>
