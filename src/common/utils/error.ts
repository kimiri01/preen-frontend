import { HttpError } from '@/common/api/http'

export const GENERIC_ERROR_MESSAGE = '잠시 후 다시 시도해 주세요.'

/** 공통 에러 코드 안내 문구 (백엔드 CommonErrorCode Enum name) */
export const commonErrorMessages: Record<string, string> = {
  INVALID_INPUT: '입력값이 올바르지 않습니다.',
  TOO_MANY_REQUESTS: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  INTERNAL_ERROR: '요청 처리 중 오류가 발생했습니다.',
}

/** 서버 오류 응답 본문 { success, code, message, data }. 형식이 다르면 빈 객체로 본다. */
function bodyOf(error: HttpError): Record<string, unknown> {
  return typeof error.data === 'object' && error.data !== null
    ? (error.data as Record<string, unknown>)
    : {}
}

export function errorCodeOf(error: unknown): string | undefined {
  if (!(error instanceof HttpError)) return undefined
  const { code } = bodyOf(error)
  return typeof code === 'string' ? code : undefined
}

export function isErrorCode(error: unknown, ...codes: string[]): boolean {
  const code = errorCodeOf(error)
  return code !== undefined && codes.includes(code)
}

export function isServerError(error: unknown): boolean {
  return error instanceof HttpError && error.status >= 500
}

export function statusOf(error: unknown): number | undefined {
  return error instanceof HttpError ? error.status : undefined
}

/** 에러 코드별 문구 → 서버 message → 일반 문구 순으로 안내 문구를 고른다. */
export function getErrorMessage(
  error: unknown,
  messages: Record<string, string> = {},
): string {
  if (!(error instanceof HttpError)) return GENERIC_ERROR_MESSAGE
  if (isServerError(error)) return GENERIC_ERROR_MESSAGE
  const code = errorCodeOf(error)
  const { message } = bodyOf(error)
  return (
    (code !== undefined ? messages[code] : undefined) ??
    (code !== undefined ? commonErrorMessages[code] : undefined) ??
    (typeof message === 'string' && message ? message : GENERIC_ERROR_MESSAGE)
  )
}

/** INVALID_INPUT의 필드 오류를 돌려준다. */
export function fieldErrorsOf(error: unknown): Record<string, string> {
  if (!(error instanceof HttpError)) return {}
  const { data } = bodyOf(error)
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return {}
  }
  return Object.fromEntries(
    Object.entries(data).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  )
}
