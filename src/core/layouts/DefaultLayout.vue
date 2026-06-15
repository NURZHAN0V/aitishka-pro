<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import BreadcrumbsBar from '@/modules/layout/components/BreadcrumbsBar.vue'
import CategoryChipsBar from '@/modules/layout/components/CategoryChipsBar.vue'
import FabButtons from '@/modules/layout/components/FabButtons.vue'
import SiteFooter from '@/modules/layout/components/SiteFooter.vue'
import SiteHeader from '@/modules/layout/components/SiteHeader.vue'
import EnrollModal from '@/modules/modals/components/EnrollModal.vue'
import SkillTestModal from '@/modules/modals/components/SkillTestModal.vue'
import VideoModal from '@/modules/modals/components/VideoModal.vue'

const enrollModalOpen = ref(false)
const testModalOpen = ref(false)
const testSkillId = ref<string | null>(null)
const videoModalOpen = ref(false)
const videoEmbedUrl = ref<string | null>(null)

function openTest(skillId: string) {
  testSkillId.value = skillId
  testModalOpen.value = true
}

function openVideoModal(embedUrl: string) {
  videoEmbedUrl.value = embedUrl
  videoModalOpen.value = true
}

provide('enrollModalOpen', enrollModalOpen)
provide('testModalOpen', testModalOpen)
provide('testSkillId', testSkillId)
provide('openTest', openTest)
provide('videoModalOpen', videoModalOpen)
provide('videoEmbedUrl', videoEmbedUrl)
provide('openVideoModal', openVideoModal)

const route = useRoute()

const showCategoryChips = computed(() => {
  const name = route.name
  return name === 'articles' || name === 'media'
})

const showBreadcrumbs = computed(() => {
  const name = route.name
  return name === 'articles-category'
    || name === 'articles-subcategory'
    || name === 'article'
    || name === 'media-video'
})

const isNotFound = computed(() => route.name === 'not-found')
</script>

<template>
  <div class="default-layout">
    <SiteHeader />
    <CategoryChipsBar v-if="showCategoryChips" />
    <BreadcrumbsBar v-if="showBreadcrumbs" />
    <main
      class="default-layout__main"
      :class="{
        'container': !isNotFound,
        'default-layout__main--with-breadcrumbs': showBreadcrumbs,
        'default-layout__main--not-found': isNotFound,
      }"
    >
      <slot />
    </main>
    <SiteFooter />
    <FabButtons />
    <EnrollModal />
    <SkillTestModal />
    <VideoModal />
  </div>
</template>

<style scoped lang="scss">
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.default-layout__main {
  flex: 1;
  padding-block: 1rem;

  &--with-breadcrumbs {
    padding-top: 0.5rem;
  }

  &--not-found {
    padding-block: 0;
  }
}
</style>
