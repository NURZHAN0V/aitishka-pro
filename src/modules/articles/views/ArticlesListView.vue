<script setup lang="ts">
import type { PostSummary } from '@/index.d'
import { computed, onMounted, ref } from 'vue'
import { api } from '@/core/api'
import ArticleCard from '@/modules/articles/components/ArticleCard.vue'
import ArticlesAside from '@/modules/articles/components/ArticlesAside.vue'

const posts = ref<PostSummary[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    posts.value = await api.getPosts()
  }
  finally {
    loading.value = false
  }
})

const sortedPosts = computed(() =>
  [...posts.value].sort((a, b) =>
    new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime(),
  ),
)
</script>

<template>
  <div class="articles-list">
    <h2 class="page-title">
      Статьи
    </h2>
    <p class="page-lead">
      Здесь находятся различные учебные материалы и полезные статьи
    </p>

    <div class="articles-list__grid">
      <section class="articles-list__main">
        <p v-if="loading" class="articles-list__status">
          Загрузка…
        </p>
        <p v-else-if="!sortedPosts.length" class="articles-list__status">
          Статьи пока не опубликованы.
        </p>
        <div v-else class="articles-list__cards">
          <ArticleCard v-for="post in sortedPosts" :key="post.id" :post="post" />
        </div>
      </section>
      <ArticlesAside class="articles-list__aside" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.articles-list__grid {
  display: grid;
  gap: 1.5rem;
  margin-top: 1rem;

  @include lg {
    grid-template-columns: 9fr 3fr;
    gap: 2.5rem;
  }
}

.articles-list__main {
  order: 1;
  min-width: 0;
}

.articles-list__aside {
  order: 2;
}

.articles-list__cards {
  display: grid;
  gap: 1rem;

  @include sm {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @include lg {
    grid-template-columns: repeat(3, 1fr);
  }
}

.articles-list__status {
  color: $color-secondary;
  padding: 2rem 0;
}
</style>
