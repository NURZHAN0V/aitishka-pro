<script setup lang="ts">
import type { ToolOption } from '@/modules/draw/types/draw-editor'
import BaseIcon from '@/core/components/BaseIcon.vue'
import DrawModalShell from '@/modules/draw/components/DrawModalShell.vue'
import { toolIconById } from '@/modules/draw/types/draw-editor'

defineProps<{
  visible: boolean
  toolOptions: ToolOption[]
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <DrawModalShell :open="visible" dialog-label="Горячие клавиши редактора" @close="emit('close')">
    <div class="draw-modal-card draw-modal-card--wide">
      <div class="draw-modal-card__head">
        <p id="draw-shortcuts-title" class="draw-popover__title">
          Горячие клавиши редактора
        </p>
        <button
          type="button"
          aria-label="Закрыть шпаргалку"
          class="draw-btn draw-btn--icon draw-btn--sm"
          @click="emit('close')"
        >
          <BaseIcon name="close" size="1.25rem" />
        </button>
      </div>

      <div class="draw-modal-card__body draw-scrollbar">
        <div class="draw-shortcuts-layout">
          <section class="draw-shortcuts-section draw-shortcuts-section--tools" aria-labelledby="draw-shortcuts-title">
            <p class="draw-palette-section__label">
              Инструменты
            </p>
            <div class="draw-shortcuts-grid">
              <div
                v-for="tool in toolOptions"
                :key="tool.id"
                class="draw-shortcut-row"
              >
                <span class="draw-shortcut-key">{{ tool.hotkey }}</span>
                <BaseIcon
                  :name="toolIconById[tool.id]"
                  size="1rem"
                  class="draw-shortcut-row__icon"
                />
                <span class="draw-shortcut-row__label">{{ tool.label }}</span>
              </div>
            </div>
          </section>

          <div class="draw-shortcuts-side">
            <section class="draw-shortcuts-section">
              <p class="draw-palette-section__label">
                Общие
              </p>
              <div class="draw-shortcuts-list">
                <div class="draw-shortcut-row">
                  <span class="draw-shortcut-key">Ctrl+S</span>
                  <span class="draw-shortcut-row__label">Сохранить черновик</span>
                </div>
                <div class="draw-shortcut-row">
                  <span class="draw-shortcut-key">Ctrl+Z</span>
                  <span class="draw-shortcut-row__label">Отменить действие</span>
                </div>
                <div class="draw-shortcut-row">
                  <span class="draw-shortcut-key">Ctrl+Y</span>
                  <span class="draw-shortcut-row__label">Повторить действие</span>
                </div>
                <div class="draw-shortcut-row">
                  <span class="draw-shortcut-key">[ / ]</span>
                  <span class="draw-shortcut-row__label">Уменьшить / увеличить размер пера</span>
                </div>
                <div class="draw-shortcut-row">
                  <span class="draw-shortcut-key">?</span>
                  <span class="draw-shortcut-row__label">Открыть / закрыть эту шпаргалку</span>
                </div>
              </div>
            </section>

            <section class="draw-shortcuts-section">
              <p class="draw-palette-section__label">
                Выделение и слои
              </p>
              <div class="draw-shortcuts-list">
                <div class="draw-shortcut-row">
                  <span class="draw-shortcut-key">Ctrl+J</span>
                  <span class="draw-shortcut-row__label">Дублировать активный слой</span>
                </div>
                <div class="draw-shortcut-row">
                  <span class="draw-shortcut-key">Del</span>
                  <span class="draw-shortcut-row__label">Очистить пиксели в выделении (активный слой)</span>
                </div>
                <div class="draw-shortcut-row">
                  <span class="draw-shortcut-key">Esc</span>
                  <span class="draw-shortcut-row__label">Снять прямоугольное выделение</span>
                </div>
                <div class="draw-shortcut-row">
                  <span class="draw-shortcut-key">M + drag</span>
                  <span class="draw-shortcut-row__label">Перенести содержимое выделения (клик внутри рамки)</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </DrawModalShell>
</template>

<style scoped lang="scss">
@use '@/modules/draw/styles/draw';
</style>
