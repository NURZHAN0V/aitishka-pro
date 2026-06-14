const COPY_LABEL = 'Скопировать код'
const COPIED_LABEL = 'Скопировано'
const RESET_MS = 2000

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

function markCopied(button: HTMLButtonElement) {
  button.classList.add('code-block__copy--copied')
  button.setAttribute('data-tooltip', COPIED_LABEL)
  button.setAttribute('aria-label', COPIED_LABEL)
}

function resetCopyButton(button: HTMLButtonElement) {
  button.classList.remove('code-block__copy--copied')
  button.setAttribute('data-tooltip', 'Скопировать')
  button.setAttribute('aria-label', COPY_LABEL)
}

export async function copyArticleCodeBlock(button: HTMLButtonElement) {
  const code = button.closest('.code-block')?.querySelector('code')
  if (!code)
    return

  const text = code.textContent ?? ''
  if (!text)
    return

  const copied = await writeClipboard(text)
  if (!copied)
    return

  markCopied(button)

  if (button.dataset.copyTimeout)
    window.clearTimeout(Number(button.dataset.copyTimeout))

  const timeoutId = window.setTimeout(() => {
    resetCopyButton(button)
    delete button.dataset.copyTimeout
  }, RESET_MS)

  button.dataset.copyTimeout = String(timeoutId)
}

export function handleArticleCodeBlockClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element))
    return

  const button = target.closest<HTMLButtonElement>('.code-block__copy')
  if (!button)
    return

  event.preventDefault()
  void copyArticleCodeBlock(button)
}
