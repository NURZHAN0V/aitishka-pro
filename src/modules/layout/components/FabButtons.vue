<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import BaseIcon from '@/core/components/BaseIcon.vue'
import { VK_COMMUNITY_CHAT_URL } from '@/core/constants/vk'

const isScrollVisible = ref(false)

const SCROLL_THRESHOLD = 800

function handleScroll() {
  isScrollVisible.value = window.scrollY > SCROLL_THRESHOLD
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <Transition name="scroll-top">
    <button
      v-if="isScrollVisible"
      type="button"
      class="scroll-top btn btn--primary"
      aria-label="Наверх"
      @click="scrollToTop"
    >
      Наверх
    </button>
  </Transition>

  <a
    :href="VK_COMMUNITY_CHAT_URL"
    target="_blank"
    rel="noopener noreferrer"
    class="fab__btn fab__btn--vk"
    aria-label="Чат сообщества ВК"
    title="Написать в сообщения"
  >
    <BaseIcon name="vk" size="1.25rem" />
  </a>
</template>

<style scoped lang="scss">
.scroll-top {
  position: fixed;
  left: 50%;
  bottom: 3.75rem;
  z-index: 40;
  transform: translateX(-50%);
  padding: 0.375rem 1rem;
  font-size: $text-xs;
  line-height: 1.25;
  border-radius: 999px;
  box-shadow: $shadow-md;
  background: #1461cd;
  transition: background-color 0.2s ease;

  &:hover {
    background: #1052ad;
  }

  &:active {
    background: #0c468f;
  }
}

.scroll-top-enter-active,
.scroll-top-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.scroll-top-enter-from,
.scroll-top-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(0.75rem);
}

.fab__btn {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border: none;
  border-radius: $radius-md;
  color: $color-on-primary;
  background: $color-primary;
  transition: background-color 0.2s;

  &:active,
  &:hover {
    background: $color-primary-hover;
  }

  &--vk {
    background: #0077ff;

    &:active,
    &:hover {
      background: #0066dd;
    }
  }
}

@media (max-width: $bp-mobile) {
  .scroll-top {
    bottom: 2.75rem;
    padding: 0.3125rem 0.875rem;
  }

  .fab__btn {
    right: 1rem;
    bottom: 1.25rem;
  }
}
</style>
