import { resolve } from 'node:path'
import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL?.trim() || 'https://aitishka.pro').replace(/\/$/, '')

  return {
    plugins: [
      vue(),
      {
        name: 'html-site-url',
        transformIndexHtml(html) {
          return html.replaceAll('%SITE_URL%', siteUrl)
        },
      },
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/core/styles/variables" as *;\n`,
        },
      },
    },
    server: {
      port: 3400,
      host: '0.0.0.0',
    },
    preview: {
      port: 3400,
      host: '0.0.0.0',
    },
    build: {
      target: 'esnext',
    },
  }
})
