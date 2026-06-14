<script setup lang="ts">
import type { PostSummary } from '@/index.d'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/core/api'
import ArticleCard from '@/modules/articles/components/ArticleCard.vue'

const route = useRoute()
const posts = ref<PostSummary[]>([])
const subcategoryName = ref('')

const categorySlug = computed(() => route.params.category as string)
const subcategorySlug = computed(() => route.params.subcategory as string)

const filtered = computed(() =>
  posts.value.filter(
    p => p.category?.slug === categorySlug.value && p.subcategory?.slug === subcategorySlug.value,
  ),
)

onMounted(async () => {
  posts.value = await api.getPosts()
  const taxonomy = await api.getTaxonomy()
  const category = taxonomy.categories.find(c => c.slug === categorySlug.value)
  subcategoryName.value = category?.subcategories.find(s => s.slug === subcategorySlug.value)?.name || subcategorySlug.value
})
</script>

<template>
  <div class="subcategory-view">
    <h2 class="page-title">
      {{ subcategoryName }}
    </h2>
    <p class="page-lead">
      Статьи в подкатегории «{{ subcategoryName }}»
    </p>
    <div class="subcategory-view__cards">
      <ArticleCard v-for="post in filtered" :key="post.id" :post="post" />
    </div>
    <p v-if="!filtered.length" class="subcategory-view__empty">
      В этой подкатегории пока нет статей.
    </p>
  </div>
</template>

<style scoped lang="scss">
.subcategory-view__cards {
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

.subcategory-view__empty {
  margin-top: 2rem;
  color: $color-secondary;
}
</style>
