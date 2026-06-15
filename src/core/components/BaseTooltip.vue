<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  text: string
  position?: 'top' | 'bottom'
}>(), {
  position: 'top',
})

const triggerRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const tooltipStyle = ref<Record<string, string>>({
  left: '0px',
  top: '0px',
})

const GAP = 8
const EDGE = 8

async function updatePosition() {
  if (!isVisible.value || !triggerRef.value || !tooltipRef.value) {
    return
  }

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
  left = Math.max(EDGE, Math.min(left, viewportWidth - tooltipRect.width - EDGE))

  const topCandidate = triggerRect.top - tooltipRect.height - GAP
  const bottomCandidate = triggerRect.bottom + GAP

  let top = props.position === 'bottom' ? bottomCandidate : topCandidate
  if (top < EDGE) {
    top = bottomCandidate
  }
  if (top + tooltipRect.height > viewportHeight - EDGE) {
    top = topCandidate
  }
  if (top < EDGE) {
    top = EDGE
  }

  tooltipStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
  }
}

async function showTooltip() {
  isVisible.value = true
  await nextTick()
  await updatePosition()
}

function hideTooltip() {
  isVisible.value = false
}

function onViewportChange() {
  if (isVisible.value) {
    void updatePosition()
  }
}

onMounted(() => {
  if (typeof window === 'undefined') {
    return
  }
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') {
    return
  }
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange, true)
})
</script>

<template>
  <span
    ref="triggerRef"
    class="base-tooltip__trigger"
    v-bind="$attrs"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focusin="showTooltip"
    @focusout="hideTooltip"
  >
    <slot />
  </span>
  <Teleport to="body">
    <span
      v-if="isVisible"
      ref="tooltipRef"
      class="base-tooltip__bubble"
      :style="tooltipStyle"
      role="tooltip"
    >
      {{ text }}
    </span>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/core/styles/variables' as *;

.base-tooltip__trigger {
  display: inline-flex;
}

.base-tooltip__bubble {
  position: fixed;
  z-index: 1000;
  max-width: 12rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: var(--color-surface-elevated);
  box-shadow: $shadow-md;
  font-size: 0.6875rem;
  line-height: 1.3;
  color: $color-default;
  pointer-events: none;
}
</style>
