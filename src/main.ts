import { createApp } from 'vue'
import App from '@/App.vue'
import { api } from '@/core/api'
import { initTheme } from '@/core/composables/useTheme'
import router from '@/router'
import '@/core/styles/main.scss'

function hideBootSplash() {
  const boot = document.getElementById('app-boot')
  if (boot)
    boot.classList.add('is-hidden')
}

initTheme()
api.init()

try {
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
}
catch (error) {
  console.error('Failed to mount app:', error)
}
finally {
  hideBootSplash()
}
