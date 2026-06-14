<script setup lang="ts">
import type { Ref } from 'vue'
import { inject, ref, watch } from 'vue'
import BaseIcon from '@/core/components/BaseIcon.vue'

const videoModalOpen = inject<Ref<boolean>>('videoModalOpen', ref(false))
const videoEmbedUrl = inject<Ref<string | null>>('videoEmbedUrl', ref(null))

watch(videoModalOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

function close() {
  videoModalOpen.value = false
  videoEmbedUrl.value = null
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="videoModalOpen && videoEmbedUrl" class="modal" role="dialog" aria-modal="true" aria-label="Видео">
        <div class="modal__overlay" @click="close" />
        <div class="modal__panel modal__panel--video">
          <header class="modal__head">
            <span>Видео</span>
            <button type="button" aria-label="Закрыть" @click="close">
              <BaseIcon name="close" />
            </button>
          </header>
          <div class="modal__body modal__body--video">
            <iframe
              :src="videoEmbedUrl"
              title="Видео"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.modal {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal__overlay {
  position: absolute;
  inset: 0;
  background: $color-overlay;
}

.modal__panel {
  position: relative;
  width: min(100%, 56rem);
  background: $color-white;
  border-radius: $radius-2xl;
  box-shadow: $shadow-xl;
  overflow: hidden;
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid $color-gray-200;
  font-weight: 600;
}

.modal__body--video {
  padding: 0;
  aspect-ratio: 16 / 9;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
