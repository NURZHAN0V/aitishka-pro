/**
 * Fix markdown artifacts from setext conversion and remaining issues.
 * Run: node scripts/fix-markdown-artifacts.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const POSTS_DIR = join(process.cwd(), 'content', 'posts')

function fixSetextArtifacts(body) {
  return body
    .replace(/^## - /gm, '- ')
    .replace(/^## (\d+)\\. /gm, '$1. ')
    .replace(/^## \[([^\]]+)\]\(([^)]+)\)$/gm, '[$1]($2)')
    .replace(/^## (https?:\/\/\S+)$/gm, '$1')
}

function removeManualToc(body) {
  return body.replace(/^\d+\.\s+\[[^\]]+\]\(#[^)]+\)\n/m, '').replace(/^(?:\d+\.\s+\[[^\]]+\]\(#[^)]+\)\n)+/m, '')
}

function htmlBlocksToMarkdown(body) {
  return body
    .replace(/<iframe[^>]*src="([^"]+)"[^>]*><\/iframe>/gi, (_, src) => `::: tip\nВидео: [смотреть](${src})\n:::\n`)
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '## $1\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<button[^>]*>([\s\S]*?)<\/button>/gi, '**$1**\n')
    .replace(/<template[^>]*>[\s\S]*?<\/template>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
}

function demoteChecklistHeaders(body) {
  return body.replace(/^### ✅ /gm, '**')
}

function fixPixelArt(body) {
  if (!body.includes('Piskel'))
    return body

  return body
    .replace(
      /- Сайт Piskel: https:\/\/piskelapp\.github\.io\/piskel\/\n## - Твоё творческое настроение! 😊\n## Пошаговая инструкция/,
      '- Сайт Piskel: https://piskelapp.github.io/piskel/\n- Твоё творческое настроение! 😊\n\n---\n\n## Пошаговая инструкция',
    )
    .replace(
      /3\. Нажми кнопку \*\*Play\*\* \(▶️\)\n## 4\. Смотри, как твой персонаж ожил!\n## Полезные советы/,
      '3. Нажми кнопку **Play** (▶️)\n4. Смотри, как твой персонаж ожил!\n\n---\n\n## Полезные советы',
    )
    .replace(/^### ✅ (.+):$/gm, '**$1:**')
    .replace(/^## - /gm, '- ')
    .replace(/\n## Заключение\n/, '\n\n---\n\n## Заключение\n')
    .replace(/\n## \*\*Не забудь поделиться\*\*[^\n]+\n## Заключение/, '\n\n## Заключение')
    .replace(/\n## Горячие клавиши/, '\n\n---\n\n## Горячие клавиши')
    .replace(/\n## Что дальше\?/, '\n\n---\n\n## Что дальше?')
}

function fixProgrammaNejroset(body, slug) {
  if (slug !== 'programma-dlya-obshheniya-s-nejrosetyu')
    return body

  return body
    .replace(/!\n---\n## 🛠 Шаг 1/, '!\n\n---\n\n## Шаг 1: Установи Python')
    .replace(/## 🛠 Шаг 1: Установи Python\n\n/, '## Шаг 1: Установи Python\n\n')
    .replace(/## \[https:\/\/www\.python\.org\/downloads\/\]\(https:\/\/www\.python\.org\/downloads\/\)\n## 📝 Шаг 2/, '[Python downloads](https://www.python.org/downloads/)\n\n---\n\n## Шаг 2')
    .replace(/## 📝 Шаг 2: Открой редактор кода/, '## Шаг 2: Открой редактор кода')
    .replace(/## 🧠 Шаг 3:/, '## Шаг 3:')
    .replace(/^## 📋 Что ты узнаешь:\n/m, '## Что ты узнаешь\n\n')
}

function cleanupBody(body, slug) {
  let result = body
  result = removeManualToc(result)
  result = htmlBlocksToMarkdown(result)
  result = fixSetextArtifacts(result)
  result = demoteChecklistHeaders(result)
  result = fixPixelArt(result)
  result = fixProgrammaNejroset(result, slug)
  return result.replace(/\n{3,}/g, '\n\n').trim()
}

function main() {
  const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json')
  const summaries = JSON.parse(readFileSync(join(POSTS_DIR, 'index.json'), 'utf8'))

  for (const file of files) {
    const path = join(POSTS_DIR, file)
    const post = JSON.parse(readFileSync(path, 'utf8'))
    post.body = cleanupBody(post.body || '', post.slug)
    writeFileSync(path, `${JSON.stringify(post, null, 2)}\n`)
  }

  for (const summary of summaries) {
    const path = join(POSTS_DIR, `${summary.slug}.json`)
    const post = JSON.parse(readFileSync(path, 'utf8'))
    Object.assign(summary, { ...post, body: undefined })
  }

  writeFileSync(join(POSTS_DIR, 'index.json'), `${JSON.stringify(summaries, null, 2)}\n`)
  console.log(`Fixed markdown artifacts in ${files.length} posts`)
}

main()
