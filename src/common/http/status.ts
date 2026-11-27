import { isApiError } from './ApiError'

/**
 * 에러의 HTTP 상태코드. ApiError가 아니면 undefined.
 * (ApiError는 서버 응답이 없는 실패면 0)
 */
export function statusOf(error: unknown): number | undefined {
  return isApiError(error) ? error.status : undefined
}

/** 조회한 대상이 없음(404) */
export function isNotFound(error: unknown): boolean {
  return statusOf(error) === 404
}
