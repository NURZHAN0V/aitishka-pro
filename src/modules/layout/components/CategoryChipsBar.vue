<script setup lang="ts">
import type { CategoryChip } from '@/modules/articles/utils/buildCategoryChips'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { api } from '@/core/api'
import BaseIcon from '@/core/components/BaseIcon.vue'
import { buildCategoryChips, isCategoryChipActive } from '@/modules/articles/utils/buildCategoryChips'
import { useVideosCatalog } from '@/modules/media/composables/useVideosCatalog'
import { buildVideoCategoryChips, isMediaSection, isVideoCategoryChipActive } from '@/modules/media/utils/buildVideoCategoryChips'

const route = useRoute()
const chips = ref<CategoryChip[]>([])
const { videos, ensureLoaded: ensureVideosLoaded } = useVideosCatalog()
const activeSection = computed(() => (isMediaSection(route.name) ? 'media' : 'articles'))
const scrollEl = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function isActive(chip: CategoryChip) {
  if (isMediaSection(route.name))
    return isVideoCategoryChipActive(chip, route.name, route.params, route.query, videos.value)

  return isCategoryChipActive(chip, route.name, route.params, route.path)
}

async function loadChips(section: 'articles' | 'media') {
  if (section === 'media') {
    await ensureVideosLoaded()
    const videoTaxonomy = await api.getVideoTaxonomy()
    chips.value = buildVideoCategoryChips(videoTaxonomy.categories, videos.value)
    return
  }

  const taxonomy = await api.getTaxonomy()
  chips.value = buildCategoryChips(taxonomy.categories)
}

function updateScrollState() {
  const el = scrollEl.value
  if (!el) {
    canScrollLeft.value = false
    canScrollRight.value = false
    return
  }

  const maxScroll = el.scrollWidth - el.clientWidth
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = maxScroll - el.scrollLeft > 4
}

function scrollBy(direction: -1 | 1) {
  scrollEl.value?.scrollBy({ left: direction * 240, behavior: 'smooth' })
}

function scrollActiveChipIntoView() {
  const el = scrollEl.value
  if (!el)
    return

  const active = el.querySelector<HTMLElement>('.category-chips__chip--active')
  active?.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' })
}

function onScroll() {
  updateScrollState()
}

watch(activeSection, async (section) => {
  await loadChips(section)
  await nextTick()
  updateScrollState()
  scrollActiveChipIntoView()
})

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    updateScrollState()
    scrollActiveChipIntoView()
  },
)

onMounted(async () => {
  await loadChips(activeSection.value)
  await nextTick()
  updateScrollState()
  scrollActiveChipIntoView()

  scrollEl.value?.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', updateScrollState)
})

onUnmounted(() => {
  scrollEl.value?.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', updateScrollState)
})
</script>

<template>
  <nav class="category-chips" aria-label="Категории контента">
    <div class="category-chips__inner container">
      <button
        v-show="canScrollLeft"
        type="button"
        class="category-chips__arrow category-chips__arrow--left"
        aria-label="Прокрутить влево"
        @click="scrollBy(-1)"
      >
        <BaseIcon name="arrow-left-drop" />
      </button>

      <div ref="scrollEl" class="category-chips__scroll">
        <RouterLink
          v-for="chip in chips"
          :key="chip.id"
          :to="chip.to"
          class="category-chips__chip"
          :class="{ 'category-chips__chip--active': isActive(chip) }"
        >
          {{ chip.label }}
        </RouterLink>
      </div>

      <button
        v-show="canScrollRight"
        type="button"
        class="category-chips__arrow category-chips__arrow--right"
        aria-label="Прокрутить вправо"
        @click="scrollBy(1)"
      >
        <BaseIcon name="arrow-right-drop" />
      </button>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.category-chips {
  background: transparent;
}

.category-chips__inner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding-block: 0.625rem;
}

.category-chips__scroll {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  flex: 1;
  min-width: 0;
  padding-inline: 0.125rem;

  &::-webkit-scrollbar {
    display: none;
  }
}

.category-chips__chip {
  flex-shrink: 0;
  padding: 0.4375rem 0.75rem;
  font-size: $text-sm;
  font-weight: 500;
  line-height: 1.25;
  color: $color-secondary;
  background: transparent;
  border-radius: $radius-sm;
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover:not(.category-chips__chip--active) {
    color: $color-default;
  }

  &--active {
    color: $color-on-primary;
    font-weight: 600;
    background: $color-primary;
  }

  @include focus-ring;
}

.category-chips__arrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: $color-secondary;
  border-radius: $radius-sm;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: $color-gray-200;
    color: $color-default;
  }

  @include focus-ring;
}
</style>
