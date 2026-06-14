export function formatExcerpt(text: string, maxLength = 140): string {
  const plain = text
    .replace(/#{1,6}\s*/g, '')
    .replace(/[*_`>-]/g, '')
    .replace(/\n+/g, ' ')
    .trim()

  if (plain.length <= maxLength)
    return plain

  return `${plain.slice(0, maxLength).trim()}…`
}
