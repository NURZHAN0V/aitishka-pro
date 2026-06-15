<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  dialogLabel: string
}>()

const emit = defineEmits<{
  close: []
}>()

const rootRef = ref<HTMLElement | null>(null)

function emitClose() {
  emit('close')
}

let escOff: (() => void) | null = null

function lockBody(v: boolean) {
  if (typeof window === 'undefined') {
    return
  }
  document.documentElement.classList.toggle('overflow-hidden', v)
}

watch(
  () => props.open,
  async (v) => {
    lockBody(v)
    if (escOff) {
      escOff()
      escOff = null
    }
    if (v) {
      const onEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          emitClose()
        }
      }
      window.addEventListener('keydown', onEsc, true)
      escOff = () => window.removeEventListener('keydown', onEsc, true)
      await nextTick()
      rootRef.value?.focus()
    }
  },
)

onBeforeUnmount(() => {
  lockBody(false)
  if (escOff) {
    escOff()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="draw-modal-backdrop">
      <div
        v-if="open"
        ref="rootRef"
        class="draw-modal-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-label="dialogLabel"
        tabindex="-1"
        @click.self="emitClose"
      >
        <div class="draw-modal-panel" role="presentation" @click.stop>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/modules/draw/styles/draw';
</style>
