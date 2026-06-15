<script setup lang="ts">
import type { DrawHistoryEntry, DrawLayer } from '@/modules/draw/types/draw-editor'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BaseIcon from '@/core/components/BaseIcon.vue'
import BaseTooltip from '@/core/components/BaseTooltip.vue'
import { DRAW_PALETTE_PRESETS, normalizeDrawHex } from '@/modules/draw/composables/draw/useDrawProjectPalette'

const props = defineProps<{
  layers: DrawLayer[]
  activeLayerIndex: number
  undoStack: DrawHistoryEntry[]
  redoCount: number
  historySelectedIndex: number
  primaryColor: string
  secondaryColor: string
  projectColors: string[]
}>()

const emit = defineEmits<{
  'update:activeLayerIndex': [index: number]
  'addLayer': []
  'duplicateLayerAt': [index: number]
  'removeLayerAt': [index: number]
  'renameLayer': [index: number]
  'toggleLayerVisibility': [index: number]
  'reorderLayer': [from: number, to: number]
  'mergeLayers': []
  'historyJump': [checkpointIndex: number]
  'historyDelete': [checkpointIndex: number]
  'update:primaryColor': [hex: string]
  'update:secondaryColor': [hex: string]
}>()

const presetColors = DRAW_PALETTE_PRESETS

const historyDeleteAllowed = computed(
  () => props.undoStack.length > 0 && props.historySelectedIndex >= 0 && props.historySelectedIndex < props.undoStack.length,
)

function emitHistoryDeleteSelected() {
  if (!historyDeleteAllowed.value) {
    return
  }
  emit('historyDelete', props.historySelectedIndex)
}

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

function palettePickSecondaryFromPointer(event: PointerEvent): boolean {
  if (shiftHeldFromKeys.value || event.shiftKey) {
    return true
  }
  try {
    return event.getModifierState('Shift')
  }
  catch {
    return false
  }
}

function onPaletteSwatchPointerDown(event: PointerEvent, hex: string) {
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
  if (palettePickSecondaryFromPointer(event)) {
    emit('update:secondaryColor', value)
  }
  else {
    emit('update:primaryColor', value)
  }
}

function onPaletteSwatchContextMenu(_event: MouseEvent, hex: string) {
  emit('update:secondaryColor', normalizeDrawHex(hex))
}

function pickPalettePrimary(hex: string) {
  emit('update:primaryColor', normalizeDrawHex(hex))
}

function pickPaletteSecondary(hex: string) {
  emit('update:secondaryColor', normalizeDrawHex(hex))
}

const isDragging = ref(false)
const layerDragFromIndex = ref<number | null>(null)

function onLayerDragStart(index: number, event: DragEvent) {
  layerDragFromIndex.value = index
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

function onLayerDrop(index: number) {
  if (layerDragFromIndex.value === null) {
    onLayerDragEnd()
    return
  }
  emit('reorderLayer', layerDragFromIndex.value, index)
  onLayerDragEnd()
}

function onLayerDragEnd() {
  isDragging.value = false
  layerDragFromIndex.value = null
}

type PanelTab = 'layers' | 'history' | 'palette'
const panelTab = ref<PanelTab>('layers')

const tabListRef = ref<HTMLElement | null>(null)
const layersTabRef = ref<HTMLElement | null>(null)
const historyTabRef = ref<HTMLElement | null>(null)
const paletteTabRef = ref<HTMLElement | null>(null)

const tabPillStyle = ref<Record<string, string>>({
  left: '0px',
  top: '0px',
  width: '0px',
  height: '0px',
  opacity: '0',
})

function syncTabPill() {
  const list = tabListRef.value
  const btn
    = panelTab.value === 'layers'
      ? layersTabRef.value
      : panelTab.value === 'history'
        ? historyTabRef.value
        : paletteTabRef.value
  if (!list || !btn) {
    return
  }
  const lr = list.getBoundingClientRect()
  const br = btn.getBoundingClientRect()
  tabPillStyle.value = {
    left: `${br.left - lr.left}px`,
    top: `${br.top - lr.top}px`,
    width: `${br.width}px`,
    height: `${br.height}px`,
    opacity: '1',
  }
}

let tabListResizeObserver: ResizeObserver | null = null

onMounted(() => {
  window.addEventListener('keydown', syncShiftHeldKeyDown, true)
  window.addEventListener('keyup', syncShiftHeldKeyUp, true)
  window.addEventListener('blur', resetShiftHeldOnWindowBlur)
  void nextTick(() => {
    syncTabPill()
    const el = tabListRef.value
    if (el && typeof ResizeObserver !== 'undefined') {
      tabListResizeObserver = new ResizeObserver(() => syncTabPill())
      tabListResizeObserver.observe(el)
    }
    window.addEventListener('resize', syncTabPill)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', syncShiftHeldKeyDown, true)
  window.removeEventListener('keyup', syncShiftHeldKeyUp, true)
  window.removeEventListener('blur', resetShiftHeldOnWindowBlur)
  tabListResizeObserver?.disconnect()
  tabListResizeObserver = null
  window.removeEventListener('resize', syncTabPill)
})

watch(panelTab, () => {
  void nextTick(syncTabPill)
})

const historyIndicesNewestFirst = computed(() => {
  const n = props.undoStack.length
  return Array.from({ length: n }, (_, i) => n - 1 - i)
})

function historyEntryLabel(checkpointIndex: number) {
  return props.undoStack[checkpointIndex]?.label ?? 'Состояние'
}

const redoStepsLabel = computed(() => {
  const n = props.redoCount
  if (n === 1) {
    return 'шаг'
  }
  if (n >= 2 && n <= 4) {
    return 'шага'
  }
  return 'шагов'
})

function layerRowActionsClass(layerIndex: number) {
  if (props.activeLayerIndex === layerIndex) {
    return 'draw-layer-row__actions draw-layer-row__actions--visible'
  }
  return 'draw-layer-row__actions'
}
</script>

<template>
  <div class="draw-panel draw-panel--wide" style="padding: 0">
    <div
      ref="tabListRef"
      class="draw-tabs"
      role="tablist"
      aria-label="Слои, история и палитра"
    >
      <div class="draw-tabs__pill" :style="tabPillStyle" aria-hidden="true" />
      <button
        ref="layersTabRef"
        type="button"
        role="tab"
        :aria-selected="panelTab === 'layers'"
        class="draw-tabs__btn"
        :class="{ 'draw-tabs__btn--active': panelTab === 'layers' }"
        @click="panelTab = 'layers'"
      >
        Слои
      </button>
      <button
        ref="historyTabRef"
        type="button"
        role="tab"
        :aria-selected="panelTab === 'history'"
        class="draw-tabs__btn"
        :class="{ 'draw-tabs__btn--active': panelTab === 'history' }"
        @click="panelTab = 'history'"
      >
        История
      </button>
      <button
        ref="paletteTabRef"
        type="button"
        role="tab"
        :aria-selected="panelTab === 'palette'"
        class="draw-tabs__btn"
        :class="{ 'draw-tabs__btn--active': panelTab === 'palette' }"
        @click="panelTab = 'palette'"
      >
        Палитра
      </button>
    </div>

    <div v-show="panelTab === 'layers'" class="draw-layers-tab">
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem">
        <BaseIcon name="draw-stack" class="draw-panel-icon-md" />
        <p class="draw-panel__title" style="margin: 0">
          Слои
        </p>
      </div>
      <div
        class="draw-layers-drop draw-scrollbar"
        :class="{ 'draw-layers-drop--dragging': isDragging }"
        style="display: flex; flex-direction: column; gap: 0.25rem"
        @dragover.prevent
      >
        <div
          v-for="(layer, layerIndex) in layers"
          :key="layer.id"
          class="group"
          @dragenter.prevent
          @dragover.prevent
        >
          <div
            draggable="true"
            class="draw-layer-row"
            :class="{ 'draw-layer-row--active': activeLayerIndex === layerIndex }"
            @click="emit('update:activeLayerIndex', layerIndex)"
            @dragstart="onLayerDragStart(layerIndex, $event)"
            @dragend="onLayerDragEnd"
            @drop.prevent="onLayerDrop(layerIndex)"
          >
            <BaseIcon name="draw-move" class="draw-panel-icon-sm" style="color: var(--color-text-secondary)" />
            <span class="draw-layer-row__name">{{ layer.name }}</span>
            <button
              type="button"
              class="draw-btn draw-btn--xs"
              :class="layerRowActionsClass(layerIndex)"
              title="Переименовать слой"
              @click.stop="emit('renameLayer', layerIndex)"
            >
              <BaseIcon name="draw-edit" class="draw-panel-icon-sm" />
            </button>
            <button
              type="button"
              class="draw-btn draw-btn--xs"
              :class="layerRowActionsClass(layerIndex)"
              :title="layer.visible ? 'Скрыть' : 'Показать'"
              @click.stop="emit('toggleLayerVisibility', layerIndex)"
            >
              <BaseIcon :name="layer.visible ? 'draw-eye' : 'draw-eye-off'" class="draw-panel-icon-sm" />
            </button>
            <button
              type="button"
              class="draw-btn draw-btn--xs"
              :class="layerRowActionsClass(layerIndex)"
              title="Дублировать слой"
              @click.stop="emit('duplicateLayerAt', layerIndex)"
            >
              <BaseIcon name="draw-copy" class="draw-panel-icon-sm" />
            </button>
            <button
              type="button"
              class="draw-btn draw-btn--xs draw-btn--danger"
              :class="layerRowActionsClass(layerIndex)"
              :disabled="layers.length <= 1"
              title="Удалить слой"
              @click.stop="emit('removeLayerAt', layerIndex)"
            >
              <BaseIcon name="draw-delete" class="draw-panel-icon-sm" />
            </button>
          </div>
        </div>
      </div>
      <div class="draw-layers-footer">
        <button type="button" class="draw-layers-footer__btn" title="Новый слой" @click="emit('addLayer')">
          <BaseIcon name="draw-add" class="draw-panel-icon-xs" />
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">Слой</span>
        </button>
        <BaseTooltip text="Объединить видимые слои" class="draw-layers-footer__btn" style="padding: 0; border: none; background: transparent">
          <button
            type="button"
            aria-label="Объединить видимые слои"
            class="draw-layers-footer__btn"
            style="width: 100%"
            @click="emit('mergeLayers')"
          >
            <BaseIcon name="draw-merge" class="draw-panel-icon-xs" />
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">Объединить</span>
          </button>
        </BaseTooltip>
      </div>
    </div>

    <div v-show="panelTab === 'palette'" style="display: flex; min-height: 0; flex-direction: column; padding: 0.75rem 0.75rem 0.5rem">
      <p class="draw-panel__title" style="margin-bottom: 0.5rem">
        <BaseIcon name="draw-palette" class="draw-panel-icon-md" />
        <span>Палитра</span>
      </p>
      <p class="draw-panel__hint" style="margin-top: 0; margin-bottom: 0.75rem">
        ЛКМ — основной цвет, Shift+ЛКМ или ПКМ — вторичный; Enter/Пробел и с Shift — то же с клавиатуры. Пресеты — нейтрали и ряды оттенков (тени → блики). Ниже — цвета с холста («В проекте»).
      </p>
      <div class="draw-scrollbar draw-palette-scroll" style="display: flex; flex-direction: column; gap: 1rem">
        <section>
          <p class="draw-palette-section__label">
            Готовые
          </p>
          <div class="draw-swatch-grid" style="grid-template-columns: repeat(6, 1fr); gap: 0.5rem">
            <button
              v-for="hex in presetColors"
              :key="`p-${hex}`"
              type="button"
              :class="swatchClass(hex)"
              :style="{ backgroundColor: hex }"
              :title="`${hex}: ЛКМ — основной; Shift+ЛКМ или ПКМ — вторичный`"
              :aria-label="`Цвет ${hex}`"
              @pointerdown="onPaletteSwatchPointerDown($event, hex)"
              @keydown.enter.exact.prevent="pickPalettePrimary(hex)"
              @keydown.enter.shift.prevent="pickPaletteSecondary(hex)"
              @keydown.space.exact.prevent="pickPalettePrimary(hex)"
              @keydown.space.shift.prevent="pickPaletteSecondary(hex)"
              @contextmenu.prevent="onPaletteSwatchContextMenu($event, hex)"
            />
          </div>
        </section>
        <section>
          <p class="draw-palette-section__label">
            В проекте
          </p>
          <div v-if="projectColors.length === 0" class="draw-history-empty" style="border: 1px solid var(--color-border); border-radius: 0.5rem">
            Пока нет заливки — нарисуйте или импортируйте изображение.
          </div>
          <div v-else class="draw-swatch-grid" style="grid-template-columns: repeat(6, 1fr); gap: 0.5rem">
            <button
              v-for="hex in projectColors"
              :key="`c-${hex}`"
              type="button"
              :class="swatchClass(hex)"
              :style="{ backgroundColor: hex }"
              :title="`${hex}: ЛКМ — основной; Shift+ЛКМ или ПКМ — вторичный`"
              :aria-label="`Цвет из проекта ${hex}`"
              @pointerdown="onPaletteSwatchPointerDown($event, hex)"
              @keydown.enter.exact.prevent="pickPalettePrimary(hex)"
              @keydown.enter.shift.prevent="pickPaletteSecondary(hex)"
              @keydown.space.exact.prevent="pickPalettePrimary(hex)"
              @keydown.space.shift.prevent="pickPaletteSecondary(hex)"
              @contextmenu.prevent="onPaletteSwatchContextMenu($event, hex)"
            />
          </div>
        </section>
      </div>
    </div>

    <div v-show="panelTab === 'history'" style="display: flex; flex-direction: column; padding: 0.75rem 0.75rem 0.5rem">
      <p class="draw-panel__title" style="margin-bottom: 0.5rem">
        <BaseIcon name="draw-history" class="draw-panel-icon-md" />
        <span>История</span>
      </p>
      <p class="draw-panel__hint" style="margin-top: 0; margin-bottom: 0.5rem">
        Новые шаги выше в списке. Выберите шаг — остальные слабее (50%). «Вперёд» к более новым — Ctrl+Y. Удаление только кнопкой внизу: убирает выбранный шаг и все более новые. Черновик в IndexedDB хранит baseline и цепочку снимков.
      </p>
      <div v-if="redoCount > 0" class="draw-history-notice">
        Вперёд доступно {{ redoCount }} {{ redoStepsLabel }} — Ctrl+Y или Ctrl+Shift+Z.
      </div>
      <div class="draw-history-list draw-scrollbar">
        <template v-if="undoStack.length === 0">
          <p class="draw-history-empty">
            История появится после первого штриха на холсте.
          </p>
        </template>
        <button
          v-for="idx in historyIndicesNewestFirst"
          :key="`h-${idx}`"
          type="button"
          class="draw-history-item"
          :class="[
            idx === historySelectedIndex ? 'draw-history-item--selected' : 'draw-history-item--dimmed',
          ]"
          @click="emit('historyJump', idx)"
        >
          <BaseIcon name="draw-brush-tool" class="draw-panel-icon-sm" style="opacity: 0.7" />
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ historyEntryLabel(idx) }}</span>
        </button>
      </div>
      <div class="draw-layers-footer">
        <button
          type="button"
          class="draw-layers-footer__btn draw-btn--danger"
          style="width: 100%"
          title="Удалить выбранный шаг и все более новые"
          :disabled="!historyDeleteAllowed"
          aria-label="Удалить выбранную запись истории и более новые шаги"
          @click="emitHistoryDeleteSelected"
        >
          <BaseIcon name="draw-delete" class="draw-panel-icon-xs" />
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">Удалить</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/modules/draw/styles/draw';
</style>
