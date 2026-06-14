<script setup lang="ts">
import { useBuildVersion } from '@/core/composables/useBuildVersion'
import { useScreenWidth } from '@/core/composables/useScreenWidth'
import DefaultLayout from '@/core/layouts/DefaultLayout.vue'

useScreenWidth()
useBuildVersion()
</script>

<template>
  <DefaultLayout>
    <RouterView />
  </DefaultLayout>
</template>
