export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

let apiBaseUrl = ''
let storefrontKey = ''

export function configureComersHttp(baseUrl: string, key: string) {
  apiBaseUrl = baseUrl.replace(/\/$/, '')
  storefrontKey = key
}

export function getComersApiBase(): string {
  return apiBaseUrl
}

export function resolveMediaUrl(url: string): string {
  if (!url)
    return url
  if (/^https?:\/\//i.test(url))
    return url
  if (url.startsWith('/') && apiBaseUrl)
    return `${apiBaseUrl}${url}`
  return url
}

export async function comersFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (!headers.has('Accept'))
    headers.set('Accept', 'application/json')
  if (storefrontKey)
    headers.set('X-Comers-Storefront-Key', storefrontKey)
  if (init?.body && !headers.has('Content-Type'))
    headers.set('Content-Type', 'application/json')

  const url = apiBaseUrl ? `${apiBaseUrl}${path}` : path
  const response = await fetch(url, {
    ...init,
    headers,
  })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.json() as { error?: string, message?: string }
      detail = body.error || body.message || detail
    }
    catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(detail || `Request failed: ${response.status}`, response.status, path)
  }

  if (response.status === 204)
    return undefined as T

  return response.json() as Promise<T>
}
