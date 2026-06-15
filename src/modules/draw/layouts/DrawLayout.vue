<script setup lang="ts">
import DrawToast from '@/modules/draw/components/DrawToast.vue'
</script>

<template>
  <div class="draw-layout">
    <RouterView />
    <DrawToast />
  </div>
</template>

<style lang="scss">
@use '@/modules/draw/styles/draw';
</style>
