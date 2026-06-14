<script setup lang="ts">
import type { Ref } from 'vue'
import type { NavItem } from '@/index.d'
import { inject, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '@/core/api'
import BaseIcon from '@/core/components/BaseIcon.vue'

const enrollModalOpen = inject<Ref<boolean>>('enrollModalOpen', ref(false))
const menuOpen = ref(false)
const articlesOpen = ref(false)
const navigation = ref<NavItem[]>([])

onMounted(async () => {
  const site = await api.getSite()
  navigation.value = site.navigation
})

function openEnrollModal() {
  enrollModalOpen.value = true
}

watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner container">
      <RouterLink to="/" class="site-header__logo" @click="menuOpen = false">
        <strong>AITISHKA<span class="site-header__logo-accent">PRO</span></strong>
      </RouterLink>

      <nav class="site-header__nav site-header__nav--desktop">
        <ul class="site-header__nav-list">
          <li v-for="item in navigation" :key="item.to" class="site-header__nav-item" :class="{ 'site-header__nav-item--dropdown': item.children?.length }">
            <RouterLink :to="item.to" class="site-header__link">
              {{ item.label }}
            </RouterLink>
            <BaseIcon v-if="item.children?.length" name="arrow-down" class="site-header__dropdown-icon" />
            <nav v-if="item.children?.length" class="site-header__dropdown">
              <ul>
                <li v-for="child in item.children" :key="child.to" class="site-header__dropdown-item" :class="{ 'site-header__dropdown-item--sub': child.children?.length }">
                  <RouterLink :to="child.to" class="site-header__dropdown-link">
                    <span>{{ child.label }}</span>
                    <BaseIcon v-if="child.children?.length" name="arrow-right-drop" />
                  </RouterLink>
                  <nav v-if="child.children?.length" class="site-header__subdropdown">
                    <ul>
                      <li v-for="sub in child.children" :key="sub.to">
                        <RouterLink :to="sub.to" class="site-header__dropdown-link">
                          {{ sub.label }}
                        </RouterLink>
                      </li>
                    </ul>
                  </nav>
                </li>
              </ul>
            </nav>
          </li>
        </ul>
      </nav>

      <nav class="site-header__cta site-header__nav--desktop">
        <button type="button" class="btn btn--primary" @click="openEnrollModal">
          Начать обучение
        </button>
      </nav>

      <button
        type="button"
        class="site-header__burger site-header__nav--mobile"
        aria-label="Открыть меню"
        :aria-expanded="menuOpen"
        @click="menuOpen = true"
      >
        <BaseIcon name="menu" size="1.5rem" />
      </button>
    </div>

    <Teleport to="body">
      <Transition name="menu">
        <div v-if="menuOpen" class="mobile-menu" aria-modal="true" role="dialog">
          <div class="mobile-menu__overlay" @click="menuOpen = false" />
          <div class="mobile-menu__panel">
            <div class="mobile-menu__head">
              <span>Меню</span>
              <button type="button" aria-label="Закрыть меню" @click="menuOpen = false">
                <BaseIcon name="close" size="1.5rem" />
              </button>
            </div>
            <nav class="mobile-menu__nav">
              <RouterLink
                v-for="item in navigation.filter(i => !i.children?.length)"
                :key="item.to"
                :to="item.to"
                class="mobile-menu__link"
                @click="menuOpen = false"
              >
                {{ item.label }}
              </RouterLink>
              <div class="mobile-menu__accordion">
                <button type="button" class="mobile-menu__link mobile-menu__accordion-btn" @click="articlesOpen = !articlesOpen">
                  <span>Статьи</span>
                  <BaseIcon :name="articlesOpen ? 'arrow-down' : 'arrow-right-drop'" />
                </button>
                <ul v-if="articlesOpen" class="mobile-menu__sub">
                  <template v-for="item in navigation.find(n => n.label === 'Статьи')?.children ?? []" :key="item.to">
                    <li>
                      <RouterLink :to="item.to" class="mobile-menu__sublink" @click="menuOpen = false">
                        {{ item.label }}
                      </RouterLink>
                    </li>
                    <li v-for="sub in item.children ?? []" :key="sub.to">
                      <RouterLink :to="sub.to" class="mobile-menu__sublink mobile-menu__sublink--nested" @click="menuOpen = false">
                        {{ sub.label }}
                      </RouterLink>
                    </li>
                  </template>
                </ul>
              </div>
              <button type="button" class="btn btn--primary btn--block" @click="openEnrollModal(); menuOpen = false">
                Начать обучение
              </button>
            </nav>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<style scoped lang="scss">
.site-header {
  background: $color-white;
}

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
  font-size: 1.5rem;
  font-weight: 500;
  color: $color-default;
  flex-shrink: 0;

  @include lg {
    font-size: 2rem;
  }
}

.site-header__logo-accent {
  color: $color-primary;
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
  gap: 1rem;
  align-items: center;
}

.site-header__link {
  color: $color-secondary;
  transition: color 0.2s;

  &:hover {
    color: $color-default;
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
  border-radius: $radius-2xl;
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
    color: $color-default;
  }
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
  border-radius: $radius-2xl;
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
  width: 2.5rem;
  height: 2.5rem;
  border-radius: $radius-sm;
  color: $color-default;

  &:hover {
    background: $color-gray-200;
  }
}

.mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 50;

  @include lg {
    display: none;
  }
}

.mobile-menu__overlay {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 40%);
}

.mobile-menu__panel {
  position: absolute;
  top: 0;
  right: 0;
  width: min(100%, 20rem);
  height: 100%;
  background: $color-white;
  box-shadow: $shadow-xl;
  overflow-y: auto;
}

.mobile-menu__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid $color-gray-200;
  font-weight: 500;
}

.mobile-menu__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
}

.mobile-menu__link {
  display: block;
  padding: 0.75rem 1rem;
  color: $color-secondary;
  border-radius: $radius-sm;
  transition: background-color 0.2s;

  &:hover {
    background: $color-primary;
    color: $color-default;
  }
}

.mobile-menu__accordion-btn {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}

.mobile-menu__sub {
  padding-left: 1rem;
  margin-bottom: 0.5rem;
}

.mobile-menu__sublink {
  display: block;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: $color-secondary;
  border-radius: $radius-sm;

  &--nested {
    padding-left: 1.5rem;
  }

  &:hover {
    background: $color-primary;
    color: $color-default;
  }
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.2s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}
</style>
