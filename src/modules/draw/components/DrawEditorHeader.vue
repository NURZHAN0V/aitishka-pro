<script setup lang="ts">
import type { DrawTool } from '@/modules/draw/types/draw-editor'
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseIcon from '@/core/components/BaseIcon.vue'
import BaseTooltip from '@/core/components/BaseTooltip.vue'
import { toolIconById } from '@/modules/draw/types/draw-editor'

defineProps<{
  activeTool: DrawTool
  activeToolLabel: string
  isReady: boolean
  isDirty: boolean
  lastSavedLabel: string
}>()

const emit = defineEmits<{
  openInNewTab: []
}>()

const isFullscreen = ref(false)

function syncFullscreenFlag() {
  isFullscreen.value = Boolean(document.fullscreenElement)
}

async function toggleFullscreen() {
  const root = document.documentElement
  try {
    if (!document.fullscreenElement) {
      await root.requestFullscreen()
    }
    else {
      await document.exitFullscreen()
    }
  }
  catch {
    /* нет жеста пользователя или запрет браузера */
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreenFlag)
  syncFullscreenFlag()
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', syncFullscreenFlag)
})
</script>

<template>
  <section class="draw-header">
    <div class="draw-header__inner">
      <div class="draw-header__actions">
        <BaseTooltip text="Вернуться на сайт">
          <RouterLink to="/" aria-label="Вернуться на сайт" class="draw-btn draw-btn--icon">
            <BaseIcon name="draw-back" size="1rem" />
          </RouterLink>
        </BaseTooltip>
        <BaseTooltip text="Открыть редактор в новой вкладке">
          <button
            type="button"
            aria-label="Открыть редактор в новой вкладке"
            class="draw-btn draw-btn--icon"
            @click="emit('openInNewTab')"
          >
            <BaseIcon name="draw-external" size="1rem" />
          </button>
        </BaseTooltip>
        <BaseTooltip :text="isFullscreen ? 'Выйти из полноэкранного режима' : 'Развернуть на весь экран'">
          <button
            type="button"
            class="draw-btn draw-btn--icon"
            :aria-label="isFullscreen ? 'Выйти из полноэкранного режима' : 'Развернуть на весь экран'"
            :aria-pressed="isFullscreen"
            @click="toggleFullscreen"
          >
            <BaseIcon :name="isFullscreen ? 'draw-fullscreen-exit' : 'draw-fullscreen'" size="1rem" />
          </button>
        </BaseTooltip>
      </div>
      <div class="draw-header__tool-badge">
        <BaseIcon :name="toolIconById[activeTool]" size="1rem" class="draw-panel-icon-md" />
        <p>
          Активный инструмент: <span class="draw-header__tool-label">{{ activeToolLabel }}</span>
        </p>
      </div>
      <div class="draw-header__status">
        <span class="draw-chip" :class="isReady ? 'draw-chip--ready' : 'draw-chip--init'">
          {{ isReady ? 'Редактор готов' : 'Инициализация…' }}
        </span>
        <span class="draw-chip" :class="isDirty ? 'draw-chip--dirty' : ''">
          {{ isDirty ? 'Есть несохраненные изменения' : 'Все сохранено' }}
        </span>
        <span class="draw-chip draw-chip--saved">
          Последнее сохранение: {{ lastSavedLabel }}
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/modules/draw/styles/draw';
</style>
