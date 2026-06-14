<script setup lang="ts">
import type { Post } from '@/index.d'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/core/api'
import { useMarkdown } from '@/core/composables/useMarkdown'
import { usePageBreadcrumbs } from '@/core/composables/usePageBreadcrumbs'
import { applyPageMeta } from '@/core/composables/usePageMeta'
import ArticleMetaRow from '@/modules/articles/components/ArticleMetaRow.vue'
import ArticleSideBanner from '@/modules/articles/components/ArticleSideBanner.vue'
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
    applyPageMeta({
      title: post.value.title,
      description: post.value.meta.description,
      ogTitle: post.value.meta.ogTitle,
      ogDescription: post.value.meta.ogDescription,
      ogImage: post.value.meta.ogImage
        || (post.value.cover !== '/media/cover.webp' ? post.value.cover : undefined),
      canonical: post.value.url,
    })
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

      <div class="article-view__layout">
        <ArticleSideBanner />

        <article
          ref="articleRef"
          class="article-view__content prose"
          @click="handleArticleCodeBlockClick"
        >
          <h1>{{ post.title }}</h1>
          <div v-html="html" />
        </article>
      </div>

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
.article-view__layout {
  @include lg {
    display: grid;
    grid-template-columns: 11.25rem minmax(0, 1fr);
    column-gap: 1.5rem;
    align-items: start;
  }
}

.article-view__banner {
  @include lg {
    grid-column: 1;
    grid-row: 1 / -1;
  }
}

.article-view__title {
  margin: 0 0 0.5em;
  max-width: 65ch;
  font-family: $font-display;
  font-size: $text-3xl;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.02em;
  text-wrap: balance;
  color: $color-default;
  scroll-margin-top: 5rem;

  @include lg {
    grid-column: 2;
    grid-row: 1;
    margin-inline: auto;
    width: 100%;
  }
}

.article-view__content {
  min-width: 0;
  margin-inline: auto;
  padding-block: 0 1rem;

  @include lg {
    grid-column: 2;
    grid-row: 2;
  }
}

.article-view__status {
  padding: 2rem 0;
  color: $color-secondary;
}
</style>
