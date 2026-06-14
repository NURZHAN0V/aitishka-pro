<script setup lang="ts">
import type { Ref } from 'vue'
import { inject, ref, watch } from 'vue'
import BaseButton from '@/core/components/BaseButton.vue'
import BaseIcon from '@/core/components/BaseIcon.vue'

const enrollModalOpen = inject<Ref<boolean>>('enrollModalOpen', ref(false))
const name = ref('')
const phone = ref('')
const submitted = ref(false)

watch(enrollModalOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (!open) {
    name.value = ''
    phone.value = ''
    submitted.value = false
  }
})

function close() {
  enrollModalOpen.value = false
}

function submit() {
  if (!name.value.trim() || !phone.value.trim())
    return
  submitted.value = true
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="enrollModalOpen" class="modal" role="dialog" aria-modal="true" aria-label="Заявка на обучение">
        <div class="modal__overlay" @click="close" />
        <div class="modal__panel">
          <header class="modal__head">
            <span>Заявка на обучение</span>
            <button type="button" aria-label="Закрыть" @click="close">
              <BaseIcon name="close" />
            </button>
          </header>
          <div class="modal__body">
            <template v-if="!submitted">
              <p class="modal__lead">
                Оставьте контакты — мы свяжемся с вами.
              </p>
              <form class="form" @submit.prevent="submit">
                <div class="form-field">
                  <label for="enroll-name" class="form-field__label">Имя</label>
                  <input
                    id="enroll-name"
                    v-model="name"
                    type="text"
                    required
                    class="form-field__input"
                    placeholder="Ваше имя"
                  >
                </div>
                <div class="form-field">
                  <label for="enroll-phone" class="form-field__label">Телефон</label>
                  <input
                    id="enroll-phone"
                    v-model="phone"
                    type="tel"
                    required
                    class="form-field__input"
                    placeholder="+7 (999) 999-99-99"
                  >
                </div>
                <BaseButton type="submit" block>
                  Отправить
                </BaseButton>
              </form>
            </template>
            <p v-else class="modal__success">
              Спасибо! Мы свяжемся с вами в ближайшее время.
            </p>
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
  width: min(100%, 24rem);
  background: $color-white;
  border-radius: $radius-2xl;
  box-shadow: $shadow-xl;
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid $color-gray-200;
  font-weight: 600;
}

.modal__body {
  padding: 1.25rem;
}

.modal__lead {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: $color-secondary;
}

.modal__success {
  font-size: 0.875rem;
  line-height: 1.6;
  color: $color-secondary;

  a {
    color: $color-primary;
    text-decoration: underline;
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
