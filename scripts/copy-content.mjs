import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'content')
const dest = join(root, 'public', 'content')

if (existsSync(dest))
  rmSync(dest, { recursive: true, force: true })

mkdirSync(join(root, 'public'), { recursive: true })
cpSync(src, dest, { recursive: true })
console.log('Copied content/ → public/content/')
