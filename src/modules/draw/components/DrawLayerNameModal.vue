<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import BaseIcon from '@/core/components/BaseIcon.vue'
import DrawModalShell from '@/modules/draw/components/DrawModalShell.vue'

const props = defineProps<{
  visible: boolean
  mode: 'create' | 'rename'
  initialName: string
}>()

const emit = defineEmits<{
  close: []
  submit: [name: string]
}>()

const name = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const title = computed(() => (
  props.mode === 'create' ? 'Новый слой' : 'Переименовать слой'
))

const submitLabel = computed(() => (
  props.mode === 'create' ? 'Создать' : 'Сохранить'
))

const dialogLabel = computed(() => (
  props.mode === 'create' ? 'Создание нового слоя' : 'Переименование слоя'
))

watch(
  () => [props.visible, props.initialName] as const,
  async ([visible, initialName]) => {
    if (!visible) {
      return
    }
    name.value = initialName
    await nextTick()
    inputRef.value?.focus()
    inputRef.value?.select()
  },
)

function emitClose() {
  emit('close')
}

function emitSubmit() {
  const trimmed = name.value.trim()
  if (!trimmed) {
    inputRef.value?.focus()
    return
  }
  emit('submit', trimmed)
}
</script>

<template>
  <DrawModalShell :open="visible" :dialog-label="dialogLabel" @close="emitClose">
    <form class="draw-modal-card" @submit.prevent="emitSubmit">
      <div class="draw-modal-card__head">
        <p class="draw-popover__title">
          {{ title }}
        </p>
        <button
          type="button"
          aria-label="Закрыть"
          class="draw-btn draw-btn--icon draw-btn--sm"
          @click="emitClose"
        >
          <BaseIcon name="close" size="1.25rem" />
        </button>
      </div>

      <div class="draw-modal-card__body">
        <div class="draw-popover__field">
          <label for="draw-layer-name">Название слоя</label>
          <input
            id="draw-layer-name"
            ref="inputRef"
            v-model="name"
            type="text"
            maxlength="64"
            autocomplete="off"
            class="draw-input"
            placeholder="Например, Слой 1"
          >
        </div>
      </div>

      <div class="draw-layer-name-modal__actions">
        <button type="button" class="draw-btn" @click="emitClose">
          Отмена
        </button>
        <button type="submit" class="draw-btn draw-btn--active">
          {{ submitLabel }}
        </button>
      </div>
    </form>
  </DrawModalShell>
</template>

<style scoped lang="scss">
@use '@/modules/draw/styles/draw';

.draw-layer-name-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0 1rem 1rem;

  @include sm {
    padding-inline: 1.25rem;
    padding-bottom: 1.25rem;
  }
}
</style>
