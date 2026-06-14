<script setup lang="ts">
import type { PostSummary } from '@/index.d'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/core/api'
import ArticleCard from '@/modules/articles/components/ArticleCard.vue'

const route = useRoute()
const posts = ref<PostSummary[]>([])
const categoryName = ref('')

const categorySlug = computed(() => route.params.category as string)

const filtered = computed(() =>
  posts.value.filter(p => p.category?.slug === categorySlug.value),
)

onMounted(async () => {
  posts.value = await api.getPosts()
  const taxonomy = await api.getTaxonomy()
  categoryName.value = taxonomy.categories.find(c => c.slug === categorySlug.value)?.name || categorySlug.value
})
</script>

<template>
  <div class="category-view">
    <h2 class="page-title">
      {{ categoryName }}
    </h2>
    <p class="page-lead">
      Статьи в категории «{{ categoryName }}»
    </p>
    <div class="category-view__cards">
      <ArticleCard v-for="post in filtered" :key="post.id" :post="post" />
    </div>
    <p v-if="!filtered.length" class="category-view__empty">
      В этой категории пока нет статей.
    </p>
  </div>
</template>

<style scoped lang="scss">
.category-view__cards {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;

  @include sm {
    grid-template-columns: repeat(2, 1fr);
  }

  @include lg {
    grid-template-columns: repeat(3, 1fr);
  }
}

.category-view__empty {
  margin-top: 2rem;
  color: $color-secondary;
}
</style>
