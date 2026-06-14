import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const date = new Date().toISOString()

writeFileSync(
  join(root, 'public', 'build.json'),
  JSON.stringify({ date, version: '1.0.0' }, null, 2),
)
console.log('Generated build.json')
