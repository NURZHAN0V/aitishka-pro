<script setup lang="ts">
import type { NavItem, NavSubItem } from '@/index.d'
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { api } from '@/core/api'
import BaseIcon from '@/core/components/BaseIcon.vue'
import { buildArticlesNavChildren } from '@/modules/articles/utils/buildArticlesNav'
import SiteLogo from '@/modules/layout/components/SiteLogo.vue'
import ThemeToggle from '@/modules/layout/components/ThemeToggle.vue'
import { isNavLinkActive } from '@/modules/layout/utils/isNavLinkActive'

const MobileMenu = defineAsyncComponent(() => import('@/modules/layout/components/MobileMenu.vue'))

const route = useRoute()
const currentPath = computed(() => route.path)

function navLinkActive(to: string) {
  return isNavLinkActive(currentPath.value, to)
}

const menuOpen = ref(false)
const navigation = ref<NavItem[]>([])
const articlesNavChildren = ref<NavSubItem[]>([])
const hasMoreArticleCategories = ref(false)

let lgQuery: MediaQueryList | null = null

onMounted(async () => {
  const [site, taxonomy] = await Promise.all([
    api.getSite(),
    api.getTaxonomy(),
  ])

  const { items, hasMore } = buildArticlesNavChildren(taxonomy.categories)
  articlesNavChildren.value = items
  hasMoreArticleCategories.value = hasMore

  navigation.value = site.navigation.map((item) => {
    if (item.label === 'Статьи' && item.to === '/articles')
      return { ...item, children: items }
    return item
  })

  lgQuery = window.matchMedia('(min-width: 1024px)')
  lgQuery.addEventListener('change', handleViewportChange)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  lgQuery?.removeEventListener('change', handleViewportChange)
  document.removeEventListener('keydown', handleEscape)
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && menuOpen.value)
    closeMenu()
}

function handleViewportChange() {
  if (lgQuery?.matches)
    closeMenu()
}
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner container">
      <RouterLink to="/" class="site-header__logo" aria-label="aitishka pro — на главную" @click="closeMenu">
        <SiteLogo />
      </RouterLink>

      <nav class="site-header__nav site-header__nav--desktop">
        <ul class="site-header__nav-list">
          <li v-for="item in navigation" :key="item.to" class="site-header__nav-item" :class="{ 'site-header__nav-item--dropdown': item.children?.length }">
            <RouterLink
              :to="item.to"
              class="site-header__link"
              :class="{ 'site-header__link--active': navLinkActive(item.to) }"
            >
              {{ item.label }}
            </RouterLink>
            <BaseIcon
              v-if="item.children?.length"
              name="arrow-down"
              class="site-header__dropdown-icon"
              :class="{ 'site-header__dropdown-icon--active': navLinkActive(item.to) }"
            />
            <nav v-if="item.children?.length" class="site-header__dropdown">
              <ul>
                <li v-for="child in item.children" :key="child.to" class="site-header__dropdown-item" :class="{ 'site-header__dropdown-item--sub': child.children?.length }">
                  <RouterLink
                    :to="child.to"
                    class="site-header__dropdown-link"
                  >
                    <span>{{ child.label }}</span>
                    <BaseIcon v-if="child.children?.length" name="arrow-right-drop" class="site-header__dropdown-icon" />
                  </RouterLink>
                  <nav v-if="child.children?.length" class="site-header__subdropdown">
                    <ul>
                      <li v-for="sub in child.children" :key="sub.to">
                        <RouterLink
                          :to="sub.to"
                          class="site-header__dropdown-link"
                        >
                          {{ sub.label }}
                        </RouterLink>
                      </li>
                    </ul>
                  </nav>
                </li>
                <li v-if="item.label === 'Статьи' && hasMoreArticleCategories" class="site-header__dropdown-item site-header__dropdown-item--all">
                  <RouterLink to="/articles" class="site-header__dropdown-link site-header__dropdown-link--all">
                    Смотреть все категории
                  </RouterLink>
                </li>
              </ul>
            </nav>
          </li>
        </ul>
      </nav>

      <nav class="site-header__cta site-header__nav--desktop">
        <ThemeToggle />
      </nav>

      <button
        type="button"
        class="site-header__burger site-header__nav--mobile"
        :aria-label="menuOpen ? 'Закрыть меню' : 'Открыть меню'"
        :aria-expanded="menuOpen"
        aria-controls="mobile-menu"
        @click="toggleMenu"
      >
        <BaseIcon :name="menuOpen ? 'close' : 'menu'" size="1.5rem" />
      </button>
    </div>

    <MobileMenu
      v-if="menuOpen"
      :is-open="menuOpen"
      :navigation="navigation"
      :articles-nav-children="articlesNavChildren"
      :has-more-article-categories="hasMoreArticleCategories"
      @close="closeMenu"
    />
  </header>
</template>

<style scoped lang="scss">
.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.75rem;

  @include lg {
    padding-block: 1rem 1.5rem;
  }
}

.site-header__logo {
  font-size: $text-xl;
  flex-shrink: 0;
  text-decoration: none;

  @include lg {
    font-size: $text-2xl;
  }
}

.site-header__nav--desktop {
  display: none;

  @include lg {
    display: block;
  }
}

.site-header__nav--mobile {
  @include lg {
    display: none;
  }
}

.site-header__nav-list {
  display: flex;
  gap: 3rem;
  align-items: center;
}

.site-header__link {
  color: $color-secondary;
  font-weight: 400;
  transition: color 0.2s;

  &:hover {
    color: $color-default;
  }

  &--active {
    color: $color-primary;
    font-weight: 500;
  }
}

.site-header__nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.125rem;

  &:hover .site-header__dropdown {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
  }
}

.site-header__dropdown-icon {
  width: 1rem;
  color: $color-secondary;

  &--active {
    color: $color-primary;
  }
}

.site-header__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 20;
  min-width: 12rem;
  margin-top: 0.5rem;
  padding: 0.25rem;
  background: $color-white;
  border: 1px solid $color-gray-200;
  border-radius: $radius-md;
  box-shadow: $shadow-xl;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px) scale(0.98);
  transition: all 0.15s ease;
}

.site-header__dropdown-item {
  position: relative;

  &:hover .site-header__subdropdown {
    opacity: 1;
    visibility: visible;
    transform: translateX(0) scale(1);
  }
}

.site-header__dropdown-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: $color-secondary;
  border-radius: $radius-sm;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background: $color-primary;
    color: $color-on-primary;
  }

  &--active {
    font-weight: 500;
    color: $color-default;
    background: $color-primary-alpha-35;
  }

  &--all {
    justify-content: flex-start;
    font-weight: 500;
    color: $color-primary;
  }
}

.site-header__dropdown-item--all {
  margin-top: 0.125rem;
  padding-top: 0.125rem;
  border-top: 1px solid $color-gray-200;
}

.site-header__subdropdown {
  position: absolute;
  top: 0;
  left: calc(100% - 0.5rem);
  z-index: 30;
  min-width: 11rem;
  padding: 0.25rem;
  background: $color-white;
  border: 1px solid $color-gray-200;
  border-radius: $radius-md;
  box-shadow: $shadow-xl;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-4px) scale(0.98);
  transition: all 0.15s ease;
}

.site-header__burger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: $radius-sm;
  color: $color-default;
  transition: background-color 0.2s ease;

  &:hover {
    background: $color-gray-200;
  }

  @include lg {
    display: none;
  }
}
</style>
