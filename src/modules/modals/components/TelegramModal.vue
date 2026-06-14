<script setup lang="ts">
import type { Ref } from 'vue'
import { inject, ref, watch } from 'vue'
import BaseIcon from '@/core/components/BaseIcon.vue'

const telegramModalOpen = inject<Ref<boolean>>('telegramModalOpen', ref(false))

watch(telegramModalOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

function close() {
  telegramModalOpen.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="telegramModalOpen" class="modal" role="dialog" aria-modal="true" aria-label="Telegram">
        <div class="modal__overlay" @click="close" />
        <div class="modal__panel modal__panel--telegram">
          <header class="modal__head modal__head--telegram">
            <span>AITISHKA PRO</span>
            <button type="button" aria-label="Закрыть" @click="close">
              <BaseIcon name="close" />
            </button>
          </header>
          <div class="modal__body modal__body--telegram">
            <p class="modal__message modal__message--bot">
              Привет! Напишите нам в Telegram — мы ответим на ваши вопросы по обучению.
            </p>
          </div>
          <footer class="modal__foot">
            <a
              href="https://t.me/aitishka_pro"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn--primary btn--block"
            >
              Открыть Telegram
            </a>
          </footer>
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
  background: rgb(0 0 0 / 40%);
}

.modal__panel {
  position: relative;
  width: min(100%, 24rem);
  background: $color-white;
  border-radius: $radius-2xl;
  box-shadow: $shadow-xl;
  overflow: hidden;

  &--telegram {
    width: min(100%, 22rem);
  }
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid $color-gray-200;
  font-weight: 600;

  &--telegram {
    background: #34aae5;
    color: $color-white;
    border-bottom: none;
  }
}

.modal__body {
  padding: 1.25rem;

  &--telegram {
    min-height: 8rem;
    background: #e8f4fc;
  }
}

.modal__message {
  max-width: 85%;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border-radius: $radius-md;

  &--bot {
    background: $color-white;
    box-shadow: $shadow-sm;
  }
}

.modal__foot {
  padding: 1rem 1.25rem;
  border-top: 1px solid $color-gray-200;
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
