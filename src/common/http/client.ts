import { authSession } from '@/common/auth/accessToken'
import type { ApiError } from './ApiError'
import { normalizeError } from './normalizeError'
import { unwrap } from './unwrap'
import type { HttpRequestOptions } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

/** 백엔드(SecurityErrorCode)가 401과 함께 보내는 인증 에러 코드 */
const AUTH_ERROR_CODE = {
  ACCESS_TOKEN_EXPIRED: 'ACCESS_TOKEN_EXPIRED', // 토큰 만료 → refresh
  SESSION_INVALID: 'SESSION_INVALID', // 세션 무효 → 로그아웃
} as const

type InitOptions = Omit<HttpRequestOptions, 'auth' | 'sameOrigin'>

/** body 종류에 따라 Content-Type과 직렬화를 정하고, 토큰이 있으면 붙인다. */
function buildInit(
  { body, headers, ...init }: InitOptions,
  token: string | null,
): RequestInit {
  const requestHeaders = new Headers(headers)
  let requestBody: BodyInit | undefined

  if (body === undefined || body === null) {
    requestBody = undefined
  } else if (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    typeof body === 'string'
  ) {
    // FormData는 브라우저가 boundary 포함 Content-Type을 직접 채운다
    requestBody = body
  } else {
    requestHeaders.set('Content-Type', 'application/json')
    requestBody = JSON.stringify(body)
  }

  if (token) requestHeaders.set('Authorization', `Bearer ${token}`)

  return {
    credentials: 'include', // refresh token 쿠키 주고받기
    ...init,
    headers: requestHeaders,
    body: requestBody,
  }
}

/** 요청 한 번 보내기. 실패는 항상 ApiError로 던진다. */
async function send<T>(
  url: string,
  init: InitOptions,
  token: string | null,
): Promise<T> {
  try {
    const res = await fetch(url, buildInit(init, token))
    return await unwrap<T>(res)
  } catch (error) {
    throw normalizeError(error)
  }
}

function isAuthError(error: ApiError, code: string): boolean {
  return error.status === 401 && error.code === code
}

/** 모든 요청이 지나가는 공통 함수 */
export async function request<T>(
  path: string,
  options: HttpRequestOptions = {},
): Promise<T> {
  const { auth = false, sameOrigin = false, ...init } = options
  const baseUrl = auth || sameOrigin ? '' : API_BASE_URL
  const url = `${baseUrl}${path}`

  // 공개 요청: 토큰 없이 한 번만
  if (!auth) return send<T>(url, init, null)

  const token = authSession.getToken()
  const version = authSession.getVersion()
  // 요청 도중 로그아웃·재로그인이 일어났는지 (이전 요청이 새 세션을 건드리지 않게)
  const sessionChanged = () => authSession.getVersion() !== version

  try {
    return await send<T>(url, init, token)
  } catch (cause) {
    const error = normalizeError(cause)
    if (sessionChanged() || !token) throw error

    // 세션 무효 → 로그아웃
    if (isAuthError(error, AUTH_ERROR_CODE.SESSION_INVALID)) {
      if (authSession.getToken() === token) authSession.clear()
      throw error
    }

    // 토큰 만료가 아니면 그대로
    if (!isAuthError(error, AUTH_ERROR_CODE.ACCESS_TOKEN_EXPIRED)) throw error

    // 다른 요청이 이미 갱신했으면 그 토큰을 쓰고, 아니면 refresh
    const current = authSession.getToken()
    if (!current) throw error

    let nextToken: string
    try {
      nextToken = current === token ? await authSession.refresh() : current
    } catch {
      throw error // refresh 실패는 useLoginSession이 세션 정리. 화면에는 원래 401
    }
    if (sessionChanged()) throw error

    // 새 토큰으로 한 번만 재시도
    try {
      return await send<T>(url, init, nextToken)
    } catch (retryCause) {
      const retryError = normalizeError(retryCause)
      if (
        !sessionChanged() &&
        isAuthError(retryError, AUTH_ERROR_CODE.SESSION_INVALID) &&
        authSession.getToken() === nextToken
      ) {
        authSession.clear()
      }
      throw retryError
    }
  }
}
