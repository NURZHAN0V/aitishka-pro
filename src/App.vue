<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBuildVersion } from '@/core/composables/useBuildVersion'
import { useScreenWidth } from '@/core/composables/useScreenWidth'
import DefaultLayout from '@/core/layouts/DefaultLayout.vue'
import DrawLayout from '@/modules/draw/layouts/DrawLayout.vue'

useScreenWidth()
useBuildVersion()

const route = useRoute()
const isDrawLayout = computed(() => route.meta.layout === 'draw')
</script>

<template>
  <DrawLayout v-if="isDrawLayout" />
  <DefaultLayout v-else>
    <RouterView />
  </DefaultLayout>
</template>
