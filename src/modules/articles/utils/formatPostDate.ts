export function formatPostPublishedAt(date?: string): string {
  if (!date)
    return ''

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime()))
    return ''

  const isCurrentYear = parsed.getFullYear() === new Date().getFullYear()

  if (isCurrentYear) {
    const datePart = parsed.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    })
    const timePart = parsed.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${datePart} в ${timePart}`
  }

  return parsed.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
