<script setup lang="ts">
import type { Post } from '@/index.d'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/core/api'
import { useMarkdown } from '@/core/composables/useMarkdown'

const route = useRoute()
const { render } = useMarkdown()
const post = ref<Post | null>(null)
const html = ref('')
const loading = ref(true)

async function loadPost() {
  loading.value = true
  const slug = route.params.slug as string
  post.value = await api.getPost(slug)
  if (post.value) {
    html.value = render(post.value.body)
    document.title = `${post.value.title} — AITISHKAPRO`
    const meta = document.querySelector('meta[name="description"]')
    if (meta)
      meta.setAttribute('content', post.value.description)
  }
  else {
    html.value = '<p>Статья не найдена</p>'
  }
  loading.value = false
}

onMounted(loadPost)
watch(() => route.params.slug, loadPost)
</script>

<template>
  <div class="article-view">
    <p v-if="loading" class="article-view__status">
      Загрузка…
    </p>
    <template v-else-if="post">
      <article class="article-view__content prose">
        <h1>{{ post.title }}</h1>
        <div v-html="html" />
      </article>
    </template>
    <p v-else class="article-view__status">
      Статья не найдена
    </p>
  </div>
</template>

<style scoped lang="scss">
.article-view__content {
  margin-inline: auto;
  padding-block: 1rem;
}

.article-view__status {
  padding: 2rem 0;
  color: $color-secondary;
}
</style>
