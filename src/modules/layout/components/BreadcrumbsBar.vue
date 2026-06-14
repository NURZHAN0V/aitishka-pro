<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { usePageBreadcrumbsState } from '@/core/composables/usePageBreadcrumbs'

const pageBreadcrumbs = usePageBreadcrumbsState()
const items = computed(() => pageBreadcrumbs.value)
</script>

<template>
  <nav v-if="items.length" class="breadcrumbs" aria-label="Хлебные крошки">
    <div class="breadcrumbs__inner container">
      <ol class="breadcrumbs__list">
        <li
          v-for="(item, index) in items"
          :key="`${item.label}-${index}`"
          class="breadcrumbs__item"
        >
          <span v-if="index > 0" class="breadcrumbs__sep" aria-hidden="true">›</span>
          <RouterLink v-if="item.to" :to="item.to" class="breadcrumbs__link">
            {{ item.label }}
          </RouterLink>
          <span v-else class="breadcrumbs__current" aria-current="page">
            {{ item.label }}
          </span>
        </li>
      </ol>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.breadcrumbs__inner {
  padding-block: 1.25rem 0.875rem;
}

.breadcrumbs__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumbs__item {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  font-size: $text-sm;
  line-height: 1.35;
}

.breadcrumbs__sep {
  margin-inline: 0.375rem;
  color: $color-gray-400;
  user-select: none;
}

.breadcrumbs__link {
  color: $color-secondary;
  text-decoration: none;
  transition: color 0.15s ease;

  &:hover {
    color: $color-primary;
  }

  @include focus-ring;
}

.breadcrumbs__current {
  color: $color-default;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
