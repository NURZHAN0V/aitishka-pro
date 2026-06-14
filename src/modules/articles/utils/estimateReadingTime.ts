const WORDS_PER_MINUTE = 200

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#*_~>`|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function countWords(text: string): number {
  const stripped = stripMarkdown(text)
  if (!stripped)
    return 0
  return stripped.split(/\s+/).filter(Boolean).length
}

export function estimateReadingTime(body: string): number {
  const words = countWords(body)
  if (!words)
    return 1
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} мин`
}
