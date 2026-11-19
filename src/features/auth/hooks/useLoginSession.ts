import { useSyncExternalStore } from 'react'
import { getApiError } from '@/common/api/getApiError'
import { authSession } from '@/common/auth/accessToken'
import { loginApi } from '@/features/auth/api/login'
import type { CurrentMember, LoginRequest } from '@/features/auth/types'

type Session = {
  restoring: boolean
  member: CurrentMember | null
  notice?: string
}
let session: Session = { restoring: true, member: null }
let refreshRequest: Promise<string> | undefined
let restoration: Promise<void> | undefined
const listeners = new Set<() => void>()

function updateSession(next: Session) {
  session = next
  listeners.forEach((listener) => listener())
}

function clearSession(notice?: string) {
  authSession.replaceToken(null)
  updateSession({ restoring: false, member: null, notice })
}

function markSessionInvalid() {
  clearSession(
    session.member
      ? '로그인 세션이 만료됐어요. 다시 로그인해 주세요.'
      : undefined,
  )
}

// 재발급 응답이 같은 로그인 세션에 속하는지만 비교한다. JWT 검증은 백엔드에서 한다.
function sessionId(token: string) {
  const payload = token.split('.')[1]
  const claims: { sid?: string } = JSON.parse(
    atob(payload.replaceAll('-', '+').replaceAll('_', '/')),
  )
  return claims.sid
}

// 여러 요청에서 토큰이 동시에 만료돼도 재발급 요청 하나를 공유한다.
function refreshAccessToken() {
  if (refreshRequest) return refreshRequest
  const startingGeneration = authSession.getVersion()
  const previousToken = authSession.getToken()
  refreshRequest = loginApi
    .refresh()
    .then(({ accessToken }) => {
      if (startingGeneration !== authSession.getVersion())
        throw new Error('로그인 상태가 바뀌었습니다.')
      if (
        previousToken &&
        sessionId(previousToken) !== sessionId(accessToken)
      ) {
        markSessionInvalid()
        throw new Error('로그인 상태가 바뀌었습니다.')
      }
      authSession.setToken(accessToken)
      return accessToken
    })
    .catch((error) => {
      if (startingGeneration === authSession.getVersion()) {
        const failure = getApiError(error)
        if (failure.code === 'SESSION_INVALID') {
          markSessionInvalid()
        } else {
          clearSession(session.member ? failure.message : undefined)
        }
      }
      throw error
    })
    .finally(() => {
      refreshRequest = undefined
    })
  return refreshRequest
}

authSession.configure(refreshAccessToken, markSessionInvalid)

export function restoreLogin() {
  restoration ??= (async () => {
    const startingGeneration = authSession.getVersion()
    try {
      await refreshAccessToken()
      const member = await loginApi.me()
      if (authSession.getVersion() === startingGeneration)
        updateSession({ restoring: false, member })
    } catch {
      if (authSession.getVersion() === startingGeneration) clearSession()
    }
  })()
  return restoration
}

export async function signIn(request: LoginRequest) {
  await restoreLogin()
  const { accessToken } = await loginApi.login(request)
  authSession.replaceToken(accessToken)
  const currentGeneration = authSession.getVersion()
  try {
    const member = await loginApi.me()
    if (authSession.getVersion() === currentGeneration)
      updateSession({ restoring: false, member })
  } catch (error) {
    if (authSession.getVersion() === currentGeneration) clearSession()
    throw error
  }
}

export async function signOut() {
  await loginApi.logout()
  clearSession()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useLoginSession() {
  return useSyncExternalStore(subscribe, () => session)
}
