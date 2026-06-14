import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const POSTS_DIR = join(process.cwd(), 'content', 'posts')

function writePost(slug, post) {
  writeFileSync(join(POSTS_DIR, `${slug}.json`), `${JSON.stringify(post, null, 2)}\n`)
}

const nuxt = JSON.parse(readFileSync(join(POSTS_DIR, 'nuxt-schema-org-chast-1.json'), 'utf8'))
nuxt.body = nuxt.body
  .replace(
    'Как использовать Nuxt Schema.org для улучшения SEO\n## Введение\n',
    '## Как использовать Nuxt Schema.org для улучшения SEO\n\n## Введение\n\n',
  )
  .replaceAll('<script type="application/ld+json">', '`script type="application/ld+json"`')
  .replaceAll('</body>', '`body`')
  .replaceAll('<body>', '`body`')
  .replace(
    '## Установка модуля\n    npx nuxi module add schema-org\n\n',
    '## Установка модуля\n\n```bash\nnpx nuxi module add schema-org\n```\n\n',
  )
  .replace(
    '    modules: [\'nuxt-schema-org\']\n\nВажно:',
    '```javascript\nmodules: [\'nuxt-schema-org\']\n```\n\n::: important\n',
  )
  .replace(
    'используйте метод `useHead()` для добавления схемы вручную.\n\n## Проверка',
    'используйте метод `useHead()` для добавления схемы вручную.\n:::\n\n## Проверка',
  )
  .replaceAll('*   ', '- ')
writePost('nuxt-schema-org-chast-1', nuxt)

const pixel = JSON.parse(readFileSync(join(POSTS_DIR, 'pixel-art.json'), 'utf8'))
pixel.body = pixel.body
  .replace(
    '- Твоё творческое настроение! 😊\n## Пошаговая инструкция',
    '- Твоё творческое настроение! 😊\n\n---\n\n## Пошаговая инструкция',
  )
  .replace('**Если анимация дёрганная:\n', '**Если анимация дёрганная:**\n')
  .replace('**Если ходьба выглядит странно:\n', '**Если ходьба выглядит странно:**\n')
  .replace('**Цвета и детали:\n', '**Цвета и детали:**\n')
  .replace(
    '\n## **Не забудь поделиться** своей анимацией с друзьями и родителями!\n\n---\n\n## Заключение',
    '\n\n**Не забудь поделиться** своей анимацией с друзьями и родителями!\n\n---\n\n## Заключение',
  )
writePost('pixel-art', pixel)

const index = JSON.parse(readFileSync(join(POSTS_DIR, 'index.json'), 'utf8'))
for (const summary of index) {
  const post = JSON.parse(readFileSync(join(POSTS_DIR, `${summary.slug}.json`), 'utf8'))
  Object.assign(summary, { ...post, body: undefined })
}
writeFileSync(join(POSTS_DIR, 'index.json'), `${JSON.stringify(index, null, 2)}\n`)
console.log('Patched nuxt-schema-org-chast-1 and pixel-art')
