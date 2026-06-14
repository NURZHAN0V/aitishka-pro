<script setup lang="ts">
import type { NavItem, NavSubItem } from '@/index.d'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import BaseIcon from '@/core/components/BaseIcon.vue'
import { lockModalScroll, unlockModalScroll } from '@/core/composables/useModalScrollLock'
import ThemeToggle from '@/modules/layout/components/ThemeToggle.vue'
import { isNavLinkActive } from '@/modules/layout/utils/isNavLinkActive'

const props = defineProps<{
  isOpen: boolean
  navigation: NavItem[]
  articlesNavChildren: NavSubItem[]
  hasMoreArticleCategories: boolean
}>()

const emit = defineEmits<{ close: [] }>()

const route = useRoute()
const articlesOpen = ref(false)
const sheetRef = ref<HTMLElement | null>(null)
const dragOffset = ref(0)
const isDragging = ref(false)
const isAnimating = ref(false)
const pointerStartY = ref(0)
const activePointerId = ref<number | null>(null)
const prefersReducedMotion = ref(false)

let reducedMotionQuery: MediaQueryList | null = null

const flatNavItems = computed(() =>
  props.navigation.filter(item => !item.children?.length),
)

const articlesItemIndex = computed(() => flatNavItems.value.length)
const themeItemIndex = computed(() => articlesItemIndex.value + 1)

const sheetStyle = computed(() => {
  const style: Record<string, string> = {}

  if (dragOffset.value > 0)
    style.transform = `translateY(${dragOffset.value}px)`

  if (isAnimating.value && !prefersReducedMotion.value)
    style.transition = 'transform 0.28s cubic-bezier(0.4, 0, 1, 1)'

  return Object.keys(style).length ? style : undefined
})

function navActive(to: string) {
  return isNavLinkActive(route.path, to)
}

function closeMenu() {
  emit('close')
}

function onNavClick() {
  closeMenu()
}

function getSheetHeight(): number {
  return sheetRef.value?.offsetHeight ?? 0
}

function onDragStart(event: PointerEvent) {
  if (event.button !== 0 || isAnimating.value)
    return

  isDragging.value = true
  pointerStartY.value = event.clientY
  activePointerId.value = event.pointerId
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onDragMove(event: PointerEvent) {
  if (!isDragging.value || event.pointerId !== activePointerId.value)
    return

  const delta = event.clientY - pointerStartY.value
  if (delta > 0) {
    dragOffset.value = delta
    event.preventDefault()
  }
}

function snapBack() {
  if (dragOffset.value <= 0)
    return

  if (prefersReducedMotion.value) {
    dragOffset.value = 0
    return
  }

  isAnimating.value = true
  dragOffset.value = 0
  window.setTimeout(() => {
    isAnimating.value = false
  }, 280)
}

function closeViaDrag() {
  const sheetHeight = getSheetHeight()

  if (prefersReducedMotion.value || sheetHeight <= 0) {
    dragOffset.value = 0
    closeMenu()
    return
  }

  isAnimating.value = true
  dragOffset.value = sheetHeight
  window.setTimeout(() => {
    isAnimating.value = false
    dragOffset.value = 0
    closeMenu()
  }, 280)
}

function onDragEnd(event: PointerEvent) {
  if (!isDragging.value || event.pointerId !== activePointerId.value)
    return

  isDragging.value = false
  activePointerId.value = null

  const threshold = getSheetHeight() * 0.65
  if (dragOffset.value > threshold)
    closeViaDrag()
  else
    snapBack()
}

function onDragCancel(event: PointerEvent) {
  if (event.pointerId !== activePointerId.value)
    return

  isDragging.value = false
  activePointerId.value = null
  snapBack()
}

function handleReducedMotionChange(event: MediaQueryListEvent) {
  prefersReducedMotion.value = event.matches
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    lockModalScroll()
    if (navActive('/articles') || route.path.startsWith('/articles'))
      articlesOpen.value = true
  }
  else {
    unlockModalScroll()
    articlesOpen.value = false
    dragOffset.value = 0
    isDragging.value = false
    isAnimating.value = false
    activePointerId.value = null
  }
})

watch(() => route.fullPath, () => {
  if (props.isOpen)
    closeMenu()
})

onMounted(() => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = reducedMotionQuery.matches
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange)
})

onUnmounted(() => {
  reducedMotionQuery?.removeEventListener('change', handleReducedMotionChange)
  if (props.isOpen)
    unlockModalScroll()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="mobile-menu-backdrop">
      <div
        v-if="isOpen"
        class="mobile-menu__backdrop"
        aria-hidden="true"
        @click="closeMenu"
      />
    </Transition>

    <Transition name="mobile-menu-panel">
      <nav
        v-if="isOpen"
        id="mobile-menu"
        ref="sheetRef"
        class="mobile-menu"
        aria-label="Мобильная навигация"
        :style="sheetStyle"
      >
        <div
          class="mobile-menu__drag-zone"
          @pointerdown="onDragStart"
          @pointermove="onDragMove"
          @pointerup="onDragEnd"
          @pointercancel="onDragCancel"
        >
          <div class="mobile-menu__handle" aria-hidden="true" />
        </div>

        <div class="mobile-menu__content">
          <ul class="mobile-menu__list">
            <li
              v-for="(item, index) in flatNavItems"
              :key="item.to"
              class="mobile-menu__item"
              :style="{ '--item-index': index }"
            >
              <RouterLink
                :to="item.to"
                class="mobile-menu__link"
                :class="{ 'mobile-menu__link--active': navActive(item.to) }"
                @click="onNavClick"
              >
                {{ item.label }}
              </RouterLink>
            </li>

            <li
              class="mobile-menu__item mobile-menu__item--accordion"
              :style="{ '--item-index': articlesItemIndex }"
            >
              <button
                type="button"
                class="mobile-menu__link mobile-menu__accordion-btn"
                :class="{ 'mobile-menu__link--active': navActive('/articles') }"
                :aria-expanded="articlesOpen"
                @click="articlesOpen = !articlesOpen"
              >
                <span>Статьи</span>
                <BaseIcon :name="articlesOpen ? 'chevron-up' : 'arrow-down'" size="1.125rem" />
              </button>

              <ul v-show="articlesOpen" class="mobile-menu__sublist">
                <template v-for="item in articlesNavChildren" :key="item.to">
                  <li>
                    <RouterLink
                      :to="item.to"
                      class="mobile-menu__sublink"
                      :class="{ 'mobile-menu__sublink--active': navActive(item.to) }"
                      @click="onNavClick"
                    >
                      {{ item.label }}
                    </RouterLink>
                  </li>
                  <li v-for="sub in item.children ?? []" :key="sub.to">
                    <RouterLink
                      :to="sub.to"
                      class="mobile-menu__sublink mobile-menu__sublink--nested"
                      :class="{ 'mobile-menu__sublink--active': navActive(sub.to) }"
                      @click="onNavClick"
                    >
                      {{ sub.label }}
                    </RouterLink>
                  </li>
                </template>
                <li v-if="hasMoreArticleCategories">
                  <RouterLink
                    to="/articles"
                    class="mobile-menu__sublink mobile-menu__sublink--all"
                    @click="onNavClick"
                  >
                    Смотреть все категории
                  </RouterLink>
                </li>
              </ul>
            </li>

            <li
              class="mobile-menu__item mobile-menu__item--theme"
              :style="{ '--item-index': themeItemIndex }"
            >
              <div class="mobile-menu__theme-row">
                <span class="mobile-menu__theme-label">Тема</span>
                <ThemeToggle />
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@mixin nav-no-select {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.mobile-menu__backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: $color-overlay;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);

  @include lg {
    display: none;
  }
}

.mobile-menu {
  @include nav-no-select;

  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 45;
  display: flex;
  flex-direction: column;
  height: min(75dvh, 32rem);
  max-height: 75dvh;
  padding: 0 1rem calc(1.25rem + env(safe-area-inset-bottom, 0px));
  overflow: hidden;
  border: 1px solid var(--mobile-menu-border);
  border-bottom: 0;
  border-radius: calc(#{$radius-xl} + 0.5rem) calc(#{$radius-xl} + 0.5rem) 0 0;
  background: var(--mobile-menu-bg);
  box-shadow: var(--mobile-menu-shadow);
  will-change: transform;

  @supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    backdrop-filter: blur(16px) saturate(160%);
    -webkit-backdrop-filter: blur(16px) saturate(160%);
  }

  @include lg {
    display: none;
  }
}

.mobile-menu__drag-zone {
  @include nav-no-select;

  flex-shrink: 0;
  padding: 0.75rem 1rem 0.5rem;
  touch-action: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.mobile-menu__handle {
  width: 2.5rem;
  height: 0.25rem;
  margin-inline: auto;
  border-radius: 999px;
  background: $color-primary;
  opacity: 0.85;
}

.mobile-menu__content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.mobile-menu__list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin: 0;
  padding: 0 0 0.5rem;
  list-style: none;
}

.mobile-menu__link {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 3rem;
  padding: 0.875rem 1rem;
  border: 0;
  border-radius: $radius-md;
  background: transparent;
  color: $color-secondary;
  font: inherit;
  font-size: $text-base;
  font-weight: 500;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.25s ease, background-color 0.25s ease;

  &:hover,
  &:active {
    color: $color-primary;
    background: $color-primary-alpha-8;
  }

  &--active {
    color: $color-primary;
    background: $color-primary-alpha-10;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0.375rem;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(135deg, $color-primary 0%, $color-primary-hover 100%);
    transform: translateX(-50%);
    transition: width 0.3s ease;
  }

  &:hover::after,
  &--active::after {
    width: calc(100% - 2rem);
  }
}

.mobile-menu__accordion-btn {
  gap: 0.5rem;
}

.mobile-menu__sublist {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin: 0.25rem 0 0;
  padding: 0 0 0 0.75rem;
  list-style: none;
  border-left: 2px solid $color-primary-alpha-28;
}

.mobile-menu__sublink {
  display: block;
  padding: 0.625rem 0.875rem;
  border-radius: $radius-sm;
  color: $color-secondary;
  font-size: $text-sm;
  text-decoration: none;
  transition: color 0.2s ease, background-color 0.2s ease;

  &--nested {
    padding-left: 1.25rem;
    font-size: $text-xs;
    color: $color-gray-400;
  }

  &--all {
    margin-top: 0.25rem;
    padding-top: 0.75rem;
    border-top: 1px solid $color-gray-200;
    font-weight: 500;
    color: $color-primary;
  }

  &--active {
    color: $color-primary;
    font-weight: 500;
    background: $color-primary-alpha-8;
  }

  &:hover {
    color: $color-primary;
    background: $color-primary-alpha-8;
  }
}

.mobile-menu__theme-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 3rem;
  padding: 0.625rem 1rem;
}

.mobile-menu__theme-label {
  font-size: $text-sm;
  font-weight: 500;
  color: $color-secondary;
}

.mobile-menu-backdrop-enter-active,
.mobile-menu-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.mobile-menu-backdrop-enter-from,
.mobile-menu-backdrop-leave-to {
  opacity: 0;
}

.mobile-menu-panel-enter-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-menu-panel-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 1, 1);
}

.mobile-menu-panel-enter-from,
.mobile-menu-panel-leave-to {
  transform: translateY(100%);
}

@keyframes mobile-menu-item-in {
  from {
    opacity: 0;
    transform: translateY(0.75rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-menu-panel-enter-active .mobile-menu__item {
  animation: mobile-menu-item-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(0.08s * var(--item-index) + 0.12s);
}

@media (prefers-reduced-motion: reduce) {
  .mobile-menu-backdrop-enter-active,
  .mobile-menu-backdrop-leave-active,
  .mobile-menu-panel-enter-active,
  .mobile-menu-panel-leave-active {
    transition: none;
  }

  .mobile-menu-panel-enter-active .mobile-menu__item {
    animation: none;
  }

  .mobile-menu-panel-enter-from,
  .mobile-menu-panel-leave-to {
    transform: none;
  }
}
</style>
