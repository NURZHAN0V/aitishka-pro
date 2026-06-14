let lockCount = 0

export function lockModalScroll(): void {
  lockCount += 1
  if (lockCount !== 1)
    return

  document.documentElement.classList.add('modal-scroll-lock')
  document.body.classList.add('modal-scroll-lock')
}

export function unlockModalScroll(): void {
  if (lockCount === 0)
    return

  lockCount -= 1
  if (lockCount !== 0)
    return

  document.documentElement.classList.remove('modal-scroll-lock')
  document.body.classList.remove('modal-scroll-lock')
}
