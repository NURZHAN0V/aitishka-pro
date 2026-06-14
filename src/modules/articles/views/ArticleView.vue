<script setup lang="ts">
import type { Post } from '@/index.d'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/core/api'
import { useMarkdown } from '@/core/composables/useMarkdown'
import { usePageBreadcrumbs } from '@/core/composables/usePageBreadcrumbs'
import ArticleMetaRow from '@/modules/articles/components/ArticleMetaRow.vue'
import ArticleTocSticks from '@/modules/articles/components/ArticleTocSticks.vue'
import { handleArticleCodeBlockClick } from '@/modules/articles/composables/useArticleCodeBlocks'
import { useArticleToc } from '@/modules/articles/composables/useArticleToc'
import { buildArticleBreadcrumbs } from '@/modules/articles/utils/buildArticleBreadcrumbs'

const route = useRoute()
const { render } = useMarkdown()
const { setPageBreadcrumbs, clearPageBreadcrumbs } = usePageBreadcrumbs()
const post = ref<Post | null>(null)
const html = ref('')
const loading = ref(true)
const articleRef = ref<HTMLElement | null>(null)
const { sections, activeId, scrollToSection } = useArticleToc(articleRef, html)

async function loadPost() {
  loading.value = true
  const slug = route.params.slug as string
  post.value = await api.getPost(slug)
  if (post.value) {
    html.value = render(post.value.body)
    setPageBreadcrumbs(buildArticleBreadcrumbs(post.value))
    document.title = `${post.value.title} — AITISHKAPRO`
    const meta = document.querySelector('meta[name="description"]')
    if (meta)
      meta.setAttribute('content', post.value.description)
  }
  else {
    html.value = '<p>Статья не найдена</p>'
    clearPageBreadcrumbs()
  }
  loading.value = false
}

onMounted(loadPost)
onUnmounted(clearPageBreadcrumbs)
watch(() => route.params.slug, loadPost)
</script>

<template>
  <div class="article-view">
    <p v-if="loading" class="article-view__status">
      Загрузка…
    </p>
    <template v-else-if="post">
      <ArticleMetaRow :post="post" />

      <article
        ref="articleRef"
        class="article-view__content prose"
        @click="handleArticleCodeBlockClick"
      >
        <h1>{{ post.title }}</h1>
        <div v-html="html" />
      </article>

      <ArticleTocSticks
        :sections="sections"
        :active-id="activeId"
        @navigate="scrollToSection"
      />
    </template>
    <p v-else class="article-view__status">
      Статья не найдена
    </p>
  </div>
</template>

<style scoped lang="scss">
.article-view__content {
  margin-inline: auto;
  padding-block: 0 1rem;
}

.article-view__status {
  padding: 2rem 0;
  color: $color-secondary;
}
</style>
