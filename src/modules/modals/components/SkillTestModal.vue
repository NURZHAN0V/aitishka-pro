<script setup lang="ts">
import type { Ref } from 'vue'
import type { SkillId, TestQuestion } from '@/index.d'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { api } from '@/core/api'
import BaseButton from '@/core/components/BaseButton.vue'
import BaseIcon from '@/core/components/BaseIcon.vue'

const testModalOpen = inject<Ref<boolean>>('testModalOpen', ref(false))
const testSkillId = inject<Ref<string | null>>('testSkillId', ref(null))

const questions = ref<TestQuestion[]>([])
const skillLabels = ref<Record<string, string>>({})
const currentIndex = ref(0)
const selectedIndex = ref<number | null>(null)
const score = ref(0)
const finished = ref(false)

const skillLabel = computed(() => skillLabels.value[testSkillId.value || ''] || testSkillId.value || '')
const currentQuestion = computed(() => questions.value[currentIndex.value])
const total = computed(() => questions.value.length)

watch(testModalOpen, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open && testSkillId.value) {
    const site = await api.getSite()
    skillLabels.value = site.skillLabels
    questions.value = site.testQuestions[testSkillId.value as SkillId] || []
    currentIndex.value = 0
    selectedIndex.value = null
    score.value = 0
    finished.value = false
  }
})

onMounted(async () => {
  const site = await api.getSite()
  skillLabels.value = site.skillLabels
})

function close() {
  testModalOpen.value = false
}

function selectOption(index: number) {
  if (selectedIndex.value !== null)
    return
  selectedIndex.value = index
  if (currentQuestion.value && index === currentQuestion.value.correctIndex)
    score.value++
}

function next() {
  if (currentIndex.value < total.value - 1) {
    currentIndex.value++
    selectedIndex.value = null
  }
  else {
    finished.value = true
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="testModalOpen" class="modal" role="dialog" aria-modal="true" :aria-label="`Тест: ${skillLabel}`">
        <div class="modal__overlay" @click="close" />
        <div class="modal__panel modal__panel--wide">
          <header class="modal__head">
            <span>Тест: {{ skillLabel }}</span>
            <button type="button" aria-label="Закрыть" @click="close">
              <BaseIcon name="close" />
            </button>
          </header>
          <div class="modal__body">
            <template v-if="!finished && currentQuestion">
              <p class="modal__progress">
                Вопрос {{ currentIndex + 1 }} из {{ total }}
              </p>
              <p class="modal__question">
                {{ currentQuestion.question }}
              </p>
              <ul class="modal__options">
                <li v-for="(option, i) in currentQuestion.options" :key="i">
                  <button
                    type="button"
                    class="modal__option"
                    :class="{
                      'modal__option--correct': selectedIndex !== null && i === currentQuestion.correctIndex,
                      'modal__option--wrong': selectedIndex === i && i !== currentQuestion.correctIndex,
                    }"
                    :disabled="selectedIndex !== null"
                    @click="selectOption(i)"
                  >
                    {{ option }}
                  </button>
                </li>
              </ul>
              <BaseButton v-if="selectedIndex !== null" block @click="next">
                {{ currentIndex < total - 1 ? 'Далее' : 'Завершить' }}
              </BaseButton>
            </template>
            <div v-else-if="finished" class="modal__result">
              <p>Результат: {{ score }} из {{ total }}</p>
              <BaseButton block @click="close">
                Закрыть
              </BaseButton>
            </div>
            <p v-else class="modal__empty">
              Вопросы для этой технологии пока не добавлены.
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
  max-height: 90vh;
  overflow-y: auto;
  background: $color-white;
  border-radius: $radius-2xl;
  box-shadow: $shadow-xl;

  &--wide {
    width: min(100%, 28rem);
  }
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

.modal__progress {
  font-size: 0.75rem;
  color: $color-secondary;
  margin-bottom: 0.5rem;
}

.modal__question {
  font-weight: 500;
  margin-bottom: 1rem;
}

.modal__options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.modal__option {
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  border: 1px solid $color-gray-200;
  border-radius: $radius-sm;
  transition: border-color 0.2s, background-color 0.2s;

  &:hover:not(:disabled) {
    border-color: $color-primary;
  }

  &--correct {
    border-color: #22c55e;
    background: $color-success-alpha-8;
  }

  &--wrong {
    border-color: #ef4444;
    background: $color-error-alpha-10;
  }
}

.modal__result {
  text-align: center;

  p {
    margin-bottom: 1rem;
    font-size: 1.125rem;
    font-weight: 500;
  }
}

.modal__empty {
  color: $color-secondary;
  font-size: 0.875rem;
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
