<script setup lang="ts">
import BaseIcon from '@/core/components/BaseIcon.vue'
import { useTheme } from '@/core/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :class="{ 'theme-toggle--dark': isDark }"
    :aria-label="isDark ? 'Включить светлую тему' : 'Включить тёмную тему'"
    :aria-pressed="isDark"
    @click="toggleTheme"
  >
    <span class="theme-toggle__track">
      <span class="theme-toggle__thumb" aria-hidden="true" />
      <span class="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">
        <BaseIcon name="sun" size="1rem" />
      </span>
      <span class="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">
        <BaseIcon name="moon" size="1rem" />
      </span>
    </span>
  </button>
</template>

<style scoped lang="scss">
.theme-toggle {
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;

  @include focus-ring;
}

.theme-toggle__track {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  width: 4.25rem;
  height: 2.125rem;
  padding: 0.1875rem;
  overflow: hidden;
  background: $color-gray-200;
  border: 1px solid $color-gray-300;
  border-radius: 999px;
}

.theme-toggle__thumb {
  position: absolute;
  top: 0.1875rem;
  left: 0.1875rem;
  z-index: 0;
  width: calc((100% - 0.375rem) / 2);
  height: calc(100% - 0.375rem);
  background: $color-primary;
  border-radius: 999px;
  box-shadow: $shadow-sm;
  transition: transform 0.32s cubic-bezier(0.34, 1.2, 0.64, 1);
  will-change: transform;
}

.theme-toggle--dark .theme-toggle__thumb {
  transform: translateX(100%);
}

.theme-toggle__icon {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: $color-secondary;
  pointer-events: none;
  transition: color 0.25s ease;

  :deep(svg) {
    display: block;
  }
}

.theme-toggle:not(.theme-toggle--dark) .theme-toggle__icon--sun {
  color: $color-on-primary;
}

.theme-toggle--dark .theme-toggle__icon--moon {
  color: $color-on-primary;
}

@media (prefers-reduced-motion: reduce) {
  .theme-toggle__thumb {
    transition: none;
  }

  .theme-toggle__icon {
    transition: color 0.2s ease;
  }
}
</style>
