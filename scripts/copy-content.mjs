import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'content')
const dest = join(root, 'public', 'content')

const contentSource = (process.env.VITE_CONTENT_SOURCE || 'local').trim().toLowerCase()

if (contentSource === 'comers' && !existsSync(src)) {
  console.log('content/ missing — skip copy (comers mode)')
  process.exit(0)
}

if (existsSync(dest))
  rmSync(dest, { recursive: true, force: true })

mkdirSync(join(root, 'public'), { recursive: true })

if (!existsSync(src)) {
  console.warn('content/ not found — skip copy')
  process.exit(0)
}

cpSync(src, dest, { recursive: true })
console.log('Copied content/ → public/content/')
