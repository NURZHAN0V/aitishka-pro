<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseIcon from '@/core/components/BaseIcon.vue'
import BaseTooltip from '@/core/components/BaseTooltip.vue'
import { DRAW_PALETTE_QUICK_SWATCHES, normalizeDrawHex } from '@/modules/draw/composables/draw/useDrawProjectPalette'

const props = defineProps<{
  primaryColor: string
  secondaryColor: string
}>()

const emit = defineEmits<{
  'update:primaryColor': [value: string]
  'update:secondaryColor': [value: string]
  'swapColors': []
  'resetColors': []
}>()

const quickSwatches = DRAW_PALETTE_QUICK_SWATCHES

const normPrimary = computed(() => normalizeDrawHex(props.primaryColor))
const normSecondary = computed(() => normalizeDrawHex(props.secondaryColor))

function swatchClass(hex: string) {
  const n = normalizeDrawHex(hex)
  if (n === normPrimary.value) {
    return 'draw-swatch draw-swatch--primary'
  }
  if (n === normSecondary.value) {
    return 'draw-swatch draw-swatch--secondary'
  }
  return 'draw-swatch'
}

const shiftHeldFromKeys = ref(false)

function syncShiftHeldKeyDown(e: KeyboardEvent) {
  shiftHeldFromKeys.value = e.shiftKey || e.code === 'ShiftLeft' || e.code === 'ShiftRight'
}

function syncShiftHeldKeyUp(e: KeyboardEvent) {
  shiftHeldFromKeys.value = e.shiftKey
}

function resetShiftHeldOnWindowBlur() {
  shiftHeldFromKeys.value = false
}

function pickSecondaryFromPointer(event: PointerEvent): boolean {
  if (shiftHeldFromKeys.value) {
    return true
  }
  if (event.shiftKey) {
    return true
  }
  try {
    return event.getModifierState('Shift')
  }
  catch {
    return false
  }
}

function onQuickSwatchPointerDown(event: PointerEvent, hex: string) {
  if (event.button === 2) {
    event.preventDefault()
    emit('update:secondaryColor', normalizeDrawHex(hex))
    return
  }
  if (event.button !== 0) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  const value = normalizeDrawHex(hex)
  if (pickSecondaryFromPointer(event)) {
    emit('update:secondaryColor', value)
  }
  else {
    emit('update:primaryColor', value)
  }
}

onMounted(() => {
  window.addEventListener('keydown', syncShiftHeldKeyDown, true)
  window.addEventListener('keyup', syncShiftHeldKeyUp, true)
  window.addEventListener('blur', resetShiftHeldOnWindowBlur)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', syncShiftHeldKeyDown, true)
  window.removeEventListener('keyup', syncShiftHeldKeyUp, true)
  window.removeEventListener('blur', resetShiftHeldOnWindowBlur)
})
</script>

<template>
  <div class="draw-panel">
    <p class="draw-panel__title" style="margin-bottom: 0.5rem">
      <span>Цвета</span>
    </p>
    <div class="draw-palette-picker">
      <div class="draw-palette-picker__stack">
        <button
          type="button"
          class="draw-palette-picker__color draw-palette-picker__color--primary"
          :style="{ backgroundColor: primaryColor }"
          title="Основной цвет"
        >
          <input
            :value="primaryColor"
            type="color"
            @input="emit('update:primaryColor', ($event.target as HTMLInputElement).value)"
          >
        </button>
        <button
          type="button"
          class="draw-palette-picker__color draw-palette-picker__color--secondary"
          :style="{ backgroundColor: secondaryColor }"
          title="Вторичный цвет"
        >
          <input
            :value="secondaryColor"
            type="color"
            @input="emit('update:secondaryColor', ($event.target as HTMLInputElement).value)"
          >
        </button>
      </div>
      <div class="draw-palette-picker__actions">
        <BaseTooltip text="Поменять основной и вторичный цвет">
          <button
            type="button"
            aria-label="Поменять цвета местами"
            class="draw-btn draw-btn--icon draw-btn--sm"
            @click="emit('swapColors')"
          >
            <BaseIcon name="draw-exchange" size="1rem" />
          </button>
        </BaseTooltip>
        <BaseTooltip text="Сбросить цвета к стандартным">
          <button
            type="button"
            aria-label="Сбросить цвета"
            class="draw-btn draw-btn--icon draw-btn--sm"
            @click="emit('resetColors')"
          >
            <BaseIcon name="draw-reset" size="1rem" />
          </button>
        </BaseTooltip>
      </div>
    </div>

    <p class="draw-palette-section__label" style="margin-top: 0.625rem">
      Быстрый выбор
    </p>
    <div class="draw-swatch-grid">
      <button
        v-for="hex in quickSwatches"
        :key="`q-${hex}`"
        type="button"
        :class="swatchClass(hex)"
        :style="{ backgroundColor: hex }"
        :title="`${hex}: ЛКМ — основной; Shift+ЛКМ или ПКМ — вторичный`"
        :aria-label="`Цвет ${hex}`"
        @pointerdown="onQuickSwatchPointerDown($event, hex)"
        @contextmenu.prevent="emit('update:secondaryColor', normalizeDrawHex(hex))"
      />
    </div>
    <p class="draw-panel__hint">
      Квадраты — системный выбор цвета. Пресеты и цвета с холста — вкладка «Палитра» справа.
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '@/modules/draw/styles/draw';
</style>
