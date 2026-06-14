<script setup lang="ts">
import { provide, ref } from 'vue'
import FabButtons from '@/modules/layout/components/FabButtons.vue'
import SiteFooter from '@/modules/layout/components/SiteFooter.vue'
import SiteHeader from '@/modules/layout/components/SiteHeader.vue'
import EnrollModal from '@/modules/modals/components/EnrollModal.vue'
import SkillTestModal from '@/modules/modals/components/SkillTestModal.vue'
import TelegramModal from '@/modules/modals/components/TelegramModal.vue'
import VideoModal from '@/modules/modals/components/VideoModal.vue'

const telegramModalOpen = ref(false)
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

provide('telegramModalOpen', telegramModalOpen)
provide('enrollModalOpen', enrollModalOpen)
provide('testModalOpen', testModalOpen)
provide('testSkillId', testSkillId)
provide('openTest', openTest)
provide('videoModalOpen', videoModalOpen)
provide('videoEmbedUrl', videoEmbedUrl)
provide('openVideoModal', openVideoModal)
</script>

<template>
  <div class="default-layout">
    <SiteHeader />
    <main class="default-layout__main container">
      <slot />
    </main>
    <SiteFooter />
    <FabButtons />
    <TelegramModal />
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
}
</style>
