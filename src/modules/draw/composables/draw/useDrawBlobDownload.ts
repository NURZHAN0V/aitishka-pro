/**
 * Синтетический `click()` по ссылке: держим цепочку в том же стеке, что и пользовательский жест.
 * `display: none` + мгновенное удаление якоря ломают или глотают загрузку в Safari и части Chromium.
 */
function clickDownloadLink(a: HTMLAnchorElement) {
  const name = (a.getAttribute('download') || a.download || 'download').trim() || 'download'
  a.setAttribute('download', name)
  a.rel = 'noopener'
  a.setAttribute('aria-hidden', 'true')
  a.tabIndex = -1
  a.style.cssText
    = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0.01;overflow:hidden;pointer-events:none'
  document.body.appendChild(a)
  a.click()
  window.setTimeout(() => {
    a.remove()
  }, 2_000)
}

/** Скачивание из blob: в той же синхронной цепочке, что и клик (без await/toBlob), иначе браузер блокирует файл. */
export function triggerBlobDownload(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.rel = 'noopener'
  clickDownloadLink(a)
  /* revoke сразу рвёт загрузку в части браузеров */
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/** Скачивание по data URL — полностью синхронно после отрисовки на canvas. */
export function triggerDataUrlDownload(name: string, dataUrl: string): void {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = name
  a.rel = 'noopener'
  clickDownloadLink(a)
}
