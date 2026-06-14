<script setup lang="ts">
import type { Ref } from 'vue'
import { inject, ref } from 'vue'
import BaseButton from '@/core/components/BaseButton.vue'

const openTest = inject<(skillId: string) => void>('openTest', () => {})
const enrollModalOpen = inject<Ref<boolean>>('enrollModalOpen', ref(false))

const skills = [
  { id: 'git', label: 'Git', color: '#EF4444' },
  { id: 'html', label: 'HTML', color: '#FB923C' },
  { id: 'css', label: 'CSS', color: '#0284C7' },
  { id: 'javascript', label: 'JavaScript', color: '#FACC15', textColor: '#0F0F0F' },
  { id: 'typescript', label: 'TypeScript', color: '#2563EB' },
  { id: 'nodejs', label: 'Node.js', color: '#22C55E' },
  { id: 'python', label: 'Python', color: '#0EA5E9' },
]

function startTest(skillId: string) {
  openTest(skillId)
}

function openEnroll() {
  enrollModalOpen.value = true
}
</script>

<template>
  <aside class="aside">
    <section class="aside__block card">
      <h3>Проверьте уровень</h3>
      <p>Выберите технологию и пройдите короткий тест.</p>
      <div class="aside__skills">
        <button
          v-for="skill in skills"
          :key="skill.id"
          type="button"
          class="aside__skill"
          :style="{ backgroundColor: skill.color, color: skill.textColor || '#fff' }"
          @click="startTest(skill.id)"
        >
          {{ skill.label }}
        </button>
      </div>
    </section>

    <section class="aside__block card">
      <h3>Готовы к профессии?</h3>
      <p>Оставьте заявку — поможем выбрать направление.</p>
      <div class="aside__cta-row">
        <BaseButton class="aside__cta-btn" @click="openEnroll">
          Да
        </BaseButton>
        <a href="https://t.me/aitishka_pro" target="_blank" rel="noopener noreferrer" class="btn btn--outline aside__cta-btn">
          Спросить
        </a>
      </div>
    </section>
  </aside>
</template>

<style scoped lang="scss">
.aside {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.aside__block {
  padding: 1rem 1.25rem;

  h3 {
    font-size: 1rem;
    font-weight: 600;
  }

  p {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: $color-secondary;
  }
}

.aside__skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.aside__skill {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: $radius-sm;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

.aside__cta-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.aside__cta-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
</style>
