import { onBeforeUnmount, ref } from 'vue'

const FEEDBACK_MS = 2500

function fallbackCopy(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    return document.execCommand('copy')
  }
  catch {
    return false
  }
  finally {
    document.body.removeChild(textarea)
  }
}

async function writeClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText)
    return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text))

  return fallbackCopy(text)
}

export function useSharePage() {
  const shareFeedback = ref('')
  let feedbackTimer: ReturnType<typeof setTimeout> | undefined

  function clearFeedbackTimer() {
    if (feedbackTimer) {
      clearTimeout(feedbackTimer)
      feedbackTimer = undefined
    }
  }

  function showFeedback(message: string) {
    clearFeedbackTimer()
    shareFeedback.value = message
    feedbackTimer = setTimeout(() => {
      shareFeedback.value = ''
      feedbackTimer = undefined
    }, FEEDBACK_MS)
  }

  async function sharePage(title: string, url: string) {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      }
      catch (error) {
        if (error instanceof Error && error.name === 'AbortError')
          return
      }
    }

    const copied = await writeClipboard(url)
    showFeedback(copied ? 'Ссылка скопирована' : 'Не удалось скопировать ссылку')
  }

  onBeforeUnmount(clearFeedbackTimer)

  return {
    shareFeedback,
    sharePage,
  }
}
