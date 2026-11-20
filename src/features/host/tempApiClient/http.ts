import { HttpError, sendRequest } from '@/features/host/tempApiClient/client'
//import { refreshAccessToken } from '@/common/auth/refresh'
//import { tokenStore } from '@/common/auth/tokenStore'
import type { HttpRequestOptions } from '@/features/host/tempApiClient/types'

export { HttpError } from '@/features/host/tempApiClient/client'

/** /api/auth/** 는 재발급을 적용하지 않는다. 단 로그인이 필요한 두 경로는 예외다. */
function canRefresh(path: string) {
  if (!path.startsWith('/api/auth/')) return true
  return path.endsWith('/signup/complete') || path.endsWith('/link')
}

// function withAuth(options: HttpRequestOptions): HttpRequestOptions {
//   const accessToken = tokenStore.getAccessToken()
//   if (!accessToken) return options
//   const headers = new Headers(options.headers)
//   headers.set('Authorization', `Bearer ${accessToken}`)
//   return { ...options, headers }
// }

async function request<T>(
  path: string,
  options: HttpRequestOptions = {},
): Promise<T> {
  try {
    //return await sendRequest<T>(path, withAuth(options))
    return await sendRequest<T>(path, options)
  } catch (error) {
    if (
      error instanceof HttpError &&
      error.status === 401 &&
      canRefresh(path)
     ) {
    //   const accessToken = await refreshAccessToken()
    //   if (accessToken) return sendRequest<T>(path, withAuth(options))
    }
    throw error
  }
}

export const http = {
  get: <T>(path: string, options?: HttpRequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: HttpRequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: HttpRequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: HttpRequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: HttpRequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
  /** multipart/form-data. 필드명은 `file`. */
  upload: <T>(path: string, file: File, signal?: AbortSignal) => {
    const form = new FormData()
    form.append('file', file)
    return request<T>(path, { method: 'POST', body: form, signal })
  },
}
