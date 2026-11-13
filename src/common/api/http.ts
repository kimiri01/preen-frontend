import type { HttpRequestOptions } from '@/common/types/api'

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: unknown,
  ) {
    super(`HTTP 요청 실패 (${status})`)
    this.name = 'HttpError'
  }
}

async function request<T>(
  path: string,
  options: HttpRequestOptions = {},
): Promise<T> {
  const { body, headers, ...init } = options
  const requestHeaders = new Headers(headers)
  if (body !== undefined) requestHeaders.set('Content-Type', 'application/json')

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL ?? ''}${path}`,
    {
      ...init,
      credentials: 'include',
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    },
  )
  const text = await response.text()
  let data: unknown = text || undefined
  if (
    text &&
    response.headers.get('content-type')?.includes('application/json')
  ) {
    data = JSON.parse(text) as unknown
  }
  if (!response.ok) throw new HttpError(response.status, data)
  return data as T
}

export const http = {
  get: <T>(path: string, options?: HttpRequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
