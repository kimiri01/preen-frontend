import { authSession } from '@/common/auth/accessToken'
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

async function send<T>(
  path: string,
  options: HttpRequestOptions = {},
): Promise<T> {
  const { body, headers, auth, sameOrigin, ...init } = options
  const baseUrl =
    auth || sameOrigin ? '' : (import.meta.env.VITE_API_BASE_URL ?? '')
  const requestHeaders = new Headers(headers)
  if (body !== undefined) requestHeaders.set('Content-Type', 'application/json')

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  let data: unknown = text || undefined
  if (
    text &&
    response.headers.get('content-type')?.includes('application/json')
  ) {
    try {
      data = JSON.parse(text) as unknown
    } catch (cause) {
      if (response.ok) throw cause
    }
  }
  if (!response.ok) throw new HttpError(response.status, data)
  return data as T
}

function authErrorCode(error: unknown) {
  if (!(error instanceof HttpError) || error.status !== 401) return undefined
  const data = error.data
  return typeof data === 'object' && data !== null && 'code' in data
    ? data.code
    : undefined
}

async function request<T>(
  path: string,
  options: HttpRequestOptions = {},
): Promise<T> {
  if (!options.auth) return send<T>(path, options)

  const token = authSession.getToken()
  const version = authSession.getVersion()
  const headers = new Headers(options.headers)
  const sendWithToken = (value: string | null) => {
    if (value) headers.set('Authorization', `Bearer ${value}`)
    return send<T>(path, { ...options, headers })
  }

  try {
    return await sendWithToken(token)
  } catch (error) {
    if (authSession.getVersion() !== version) throw error
    const code = authErrorCode(error)
    if (code === 'ACCESS_TOKEN_EXPIRED' && token) {
      const current = authSession.getToken()
      if (!current) throw error
      const nextToken =
        current === token ? await authSession.refresh() : current
      if (authSession.getVersion() !== version) throw error
      try {
        return await sendWithToken(nextToken)
      } catch (retryError) {
        if (
          authSession.getVersion() === version &&
          authErrorCode(retryError) === 'SESSION_INVALID' &&
          authSession.getToken() === nextToken
        ) {
          authSession.clear()
        }
        throw retryError
      }
    }
    if (
      code === 'SESSION_INVALID' &&
      token &&
      authSession.getToken() === token
    ) {
      authSession.clear()
    }
    throw error
  }
}

export const http = {
  // GET: 지정한 경로에서 데이터를 조회.
  get: <T>(path: string, options?: HttpRequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  //  POST: 지정한 경로로 데이터를 보내 등록이나 인증번호 검증 등을 요청.
  post: <T>(path: string, body?: unknown, options?: HttpRequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),

  // PUT: 지정한 경로의 리소스를 보낸 데이터로 교체하도록 요청.
  put: <T>(path: string, body?: unknown, options?: HttpRequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  // PATCH: 지정한 경로의 리소스에서 일부 항목만 수정하도록 요청.
  patch: <T>(path: string, body?: unknown, options?: HttpRequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  // DELETE: 지정한 경로의 리소스를 삭제하도록 요청.
  delete: <T>(path: string, options?: HttpRequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
