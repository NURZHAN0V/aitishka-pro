<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

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
</template>

<style scoped lang="scss">
.scroll-top {
  position: fixed;
  left: 50%;
  bottom: 2rem;
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

@media (max-width: $bp-mobile) {
  .scroll-top {
    bottom: 1.25rem;
    padding: 0.3125rem 0.875rem;
  }
}
</style>
