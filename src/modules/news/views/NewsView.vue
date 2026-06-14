<script setup lang="ts">
import type { PostSummary } from '@/index.d'
import { computed, onMounted, ref } from 'vue'
import { api } from '@/core/api'
import ArticleCard from '@/modules/articles/components/ArticleCard.vue'
import ListPageBanner from '@/modules/layout/components/ListPageBanner.vue'
import { NEWS_CATEGORY_SLUG } from '@/modules/news/constants'

const posts = ref<PostSummary[]>([])
const loading = ref(true)

const newsPosts = computed(() =>
  [...posts.value]
    .filter(p => p.category?.slug === NEWS_CATEGORY_SLUG)
    .sort((a, b) =>
      new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime(),
    ),
)

onMounted(async () => {
  try {
    posts.value = await api.getPosts()
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="news">
    <ListPageBanner />
    <p v-if="loading" class="news__status">
      Загрузка…
    </p>
    <p v-else-if="!newsPosts.length" class="news__status">
      Новостей пока нет.
    </p>
    <div v-else class="news__cards">
      <ArticleCard v-for="post in newsPosts" :key="post.id" :post="post" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.news__cards {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;

  @include sm {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @include md {
    grid-template-columns: repeat(3, 1fr);
  }

  @include lg {
    grid-template-columns: repeat(4, 1fr);
  }
}

.news__status {
  margin-top: 2rem;
  color: $color-secondary;
}
</style>
