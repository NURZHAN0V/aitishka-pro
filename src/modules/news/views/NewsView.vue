<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '@/core/api'

const title = ref('Новости')
const lead = ref('')

onMounted(async () => {
  const site = await api.getSite()
  title.value = site.news.title
  lead.value = site.news.lead
})
</script>

<template>
  <div class="news">
    <h2 class="page-title">
      {{ title }}
    </h2>
    <p class="page-lead">
      {{ lead }}
    </p>
  </div>
</template>
