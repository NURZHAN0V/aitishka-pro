import { createApp } from 'vue'
import App from '@/App.vue'
import { api } from '@/core/api'
import router from '@/router'
import '@/core/styles/main.scss'

api.init()

const app = createApp(App)
app.use(router)
app.mount('#app')

const boot = document.getElementById('app-boot')
if (boot)
  boot.classList.add('is-hidden')
