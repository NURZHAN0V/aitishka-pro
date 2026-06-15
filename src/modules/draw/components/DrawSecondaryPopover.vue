<script setup lang="ts">
import type { SecondaryTab } from '@/modules/draw/types/draw-editor'
import BaseIcon from '@/core/components/BaseIcon.vue'
import BaseTooltip from '@/core/components/BaseTooltip.vue'
import { secondaryTabTitle } from '@/modules/draw/types/draw-editor'

defineProps<{
  visible: boolean
  tab: SecondaryTab
  fps: number
  resizeWidth: number
  resizeHeight: number
  maintainAspectRatio: boolean
  spriteTitle: string
  spriteDescription: string
  exportScale: number
  scaledExportWidth: number
  scaledExportHeight: number
}>()

const emit = defineEmits<{
  'close': []
  'update:fps': [value: number]
  'flipHorizontal': []
  'flipVertical': []
  'rotateRight': []
  'cropToSelection': []
  'resizeWidthInput': [event: Event]
  'resizeHeightInput': [event: Event]
  'toggleMaintainAspectRatio': []
  'resizeCanvas': []
  'update:spriteTitle': [value: string]
  'update:spriteDescription': [value: string]
  'saveDraft': []
  'exportProject': []
  'update:exportScale': [value: number]
  'exportPNG': []
  'exportGIF': []
  'exportZIP': []
  'restoreDraft': []
  'importProject': []
  'importImage': []
}>()
</script>

<template>
  <Transition name="draw-popover-panel">
    <div
      v-if="visible"
      data-draw-secondary-popover
      class="draw-popover"
      role="region"
      :aria-label="secondaryTabTitle[tab]"
    >
      <div class="draw-popover__head">
        <p class="draw-popover__title">
          {{ secondaryTabTitle[tab] }}
        </p>
        <button type="button" aria-label="Закрыть панель" class="draw-btn draw-btn--icon draw-btn--sm" @click="emit('close')">
          <BaseIcon name="close" size="1rem" />
        </button>
      </div>

      <div v-if="tab === 'settings'" class="draw-popover__body">
        <div class="draw-popover__field">
          <label for="draw-fps-range">Макс. FPS предпросмотра</label>
          <input
            id="draw-fps-range"
            :value="fps"
            type="range"
            min="1"
            max="24"
            class="draw-range__input"
            @input="emit('update:fps', Number(($event.target as HTMLInputElement).value))"
          >
          <div style="margin-top: 0.25rem; text-align: right; color: var(--color-text-secondary)">
            {{ fps }}
          </div>
        </div>
      </div>

      <div v-else-if="tab === 'resize'" class="draw-popover__body">
        <div class="draw-popover__grid draw-popover__grid--2">
          <BaseTooltip text="Отразить по горизонтали" style="display: flex; min-width: 0; width: 100%">
            <button type="button" aria-label="Отразить X" class="draw-btn" style="width: 100%" @click="emit('flipHorizontal')">
              <BaseIcon name="draw-flip-h" size="1.25rem" />
            </button>
          </BaseTooltip>
          <BaseTooltip text="Отразить по вертикали" style="display: flex; min-width: 0; width: 100%">
            <button type="button" aria-label="Отразить Y" class="draw-btn" style="width: 100%" @click="emit('flipVertical')">
              <BaseIcon name="draw-flip-v" size="1.25rem" />
            </button>
          </BaseTooltip>
          <BaseTooltip text="Повернуть на 90 градусов" style="display: flex; min-width: 0; width: 100%">
            <button type="button" aria-label="Повернуть на 90 градусов" class="draw-btn" style="width: 100%" @click="emit('rotateRight')">
              <BaseIcon name="draw-rotate" size="1.25rem" />
            </button>
          </BaseTooltip>
          <BaseTooltip text="Кадрировать по выделению" style="display: flex; min-width: 0; width: 100%">
            <button type="button" aria-label="Кадрировать" class="draw-btn" style="width: 100%" @click="emit('cropToSelection')">
              <BaseIcon name="draw-crop" size="1.25rem" />
            </button>
          </BaseTooltip>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem">
          <label class="draw-sr-only" for="draw-resize-w">Ширина холста</label>
          <input id="draw-resize-w" :value="resizeWidth" type="number" min="8" max="256" class="draw-input" @input="emit('resizeWidthInput', $event)">
          <span style="color: var(--color-text-secondary)">×</span>
          <label class="draw-sr-only" for="draw-resize-h">Высота холста</label>
          <input id="draw-resize-h" :value="resizeHeight" type="number" min="8" max="256" class="draw-input" @input="emit('resizeHeightInput', $event)">
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem">
          <button
            type="button"
            class="draw-popover__toggle"
            :class="{ 'draw-popover__toggle--active': maintainAspectRatio }"
            @click="emit('toggleMaintainAspectRatio')"
          >
            <span style="line-height: 1.3">Сохранять пропорции</span>
            <BaseIcon
              :name="maintainAspectRatio ? 'draw-check' : 'draw-circle'"
              size="1rem"
              :style="maintainAspectRatio ? undefined : { opacity: '0.45' }"
            />
          </button>
          <BaseTooltip text="Применить размер холста">
            <button type="button" aria-label="Применить размер" class="draw-btn draw-btn--icon" @click="emit('resizeCanvas')">
              <BaseIcon name="draw-expand" size="1.25rem" />
            </button>
          </BaseTooltip>
        </div>
      </div>

      <div v-else-if="tab === 'save'" class="draw-popover__body">
        <p class="draw-popover__hint">
          Черновик хранится только в IndexedDB этого браузера — на сервер не отправляется. В другом браузере или на другом устройстве его не будет: экспортируйте проект JSON. Холст 8–256 px, до 200 кадров.
        </p>
        <div class="draw-popover__field">
          <label for="draw-sprite-title">Название</label>
          <input
            id="draw-sprite-title"
            :value="spriteTitle"
            type="text"
            placeholder="Название спрайта"
            class="draw-input"
            @input="emit('update:spriteTitle', ($event.target as HTMLInputElement).value)"
          >
        </div>
        <div class="draw-popover__field">
          <label for="draw-sprite-desc">Описание</label>
          <textarea
            id="draw-sprite-desc"
            :value="spriteDescription"
            rows="3"
            placeholder="Описание"
            class="draw-textarea"
            @input="emit('update:spriteDescription', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
        <div class="draw-popover__grid draw-popover__grid--2">
          <BaseTooltip text="Сохранить черновик в IndexedDB" style="display: flex; min-width: 0; width: 100%">
            <button type="button" class="draw-btn" style="width: 100%" @click="emit('saveDraft')">
              <BaseIcon name="draw-save" size="1.25rem" />
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">Сохранить</span>
            </button>
          </BaseTooltip>
          <BaseTooltip text="Скачать проект JSON" style="display: flex; min-width: 0; width: 100%">
            <button type="button" class="draw-btn" style="width: 100%" @click="emit('exportProject')">
              <BaseIcon name="draw-download" size="1.25rem" />
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">JSON</span>
            </button>
          </BaseTooltip>
        </div>
      </div>

      <div v-else-if="tab === 'export'" class="draw-popover__body">
        <p class="draw-popover__hint">
          Масштаб — размер файла относительно сетки холста. PNG / GIF / ZIP — сразу скачивание в браузер (нажмите кнопку формата).
        </p>
        <div class="draw-popover__field">
          <label for="draw-export-scale">Масштаб экспорта {{ exportScale.toFixed(1) }}×</label>
          <input
            id="draw-export-scale"
            :value="exportScale"
            type="range"
            min="1"
            max="8"
            step="0.5"
            class="draw-range__input"
            @input="emit('update:exportScale', Number(($event.target as HTMLInputElement).value))"
          >
        </div>
        <div class="draw-popover__stat">
          <span>Разрешение файла</span>
          <span>{{ scaledExportWidth }} × {{ scaledExportHeight }}</span>
        </div>
        <div class="draw-popover__grid draw-popover__grid--3">
          <BaseTooltip text="Скачать PNG (текущий кадр)" style="display: flex; min-width: 0; width: 100%">
            <button type="button" class="draw-btn" style="width: 100%; height: 2.75rem" @click="emit('exportPNG')">
              <BaseIcon name="draw-image" size="1.25rem" />
              <span style="font-size: 0.6875rem; font-weight: 500">PNG</span>
            </button>
          </BaseTooltip>
          <BaseTooltip text="Анимированный GIF всех кадров (задержка по FPS проекта)" style="display: flex; min-width: 0; width: 100%">
            <button type="button" class="draw-btn" style="width: 100%; height: 2.75rem" @click="emit('exportGIF')">
              <BaseIcon name="draw-video" size="1.25rem" />
              <span style="font-size: 0.6875rem; font-weight: 500">GIF</span>
            </button>
          </BaseTooltip>
          <BaseTooltip text="Все кадры в ZIP" style="display: flex; min-width: 0; width: 100%">
            <button type="button" class="draw-btn" style="width: 100%; height: 2.75rem" @click="emit('exportZIP')">
              <BaseIcon name="draw-zip" size="1.25rem" />
              <span style="font-size: 0.6875rem; font-weight: 500">ZIP</span>
            </button>
          </BaseTooltip>
        </div>
      </div>

      <div v-else class="draw-popover__body">
        <p class="draw-popover__hint">
          Восстановление перезапишет текущий проект. JSON — полный проект из «Сохранение» / экспорта.
        </p>
        <div class="draw-popover__grid draw-popover__grid--3">
          <button type="button" class="draw-popover__load-btn" @click="emit('restoreDraft')">
            <BaseIcon name="draw-history" size="1.25rem" />
            <span>Черновик</span>
          </button>
          <button type="button" class="draw-popover__load-btn" @click="emit('importProject')">
            <BaseIcon name="draw-folder" size="1.25rem" />
            <span>JSON</span>
          </button>
          <button type="button" class="draw-popover__load-btn" @click="emit('importImage')">
            <BaseIcon name="draw-image" size="1.25rem" />
            <span>Изображение</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use '@/modules/draw/styles/draw';
</style>
