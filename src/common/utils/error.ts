import { HttpError } from '@/common/api/http'

export const GENERIC_ERROR_MESSAGE = '잠시 후 다시 시도해 주세요.'

/** 공통 에러 코드 안내 문구 */
export const commonErrorMessages: Record<string, string> = {
  'COMMON-002': '로그인이 필요합니다.',
  'COMMON-003': '접근 권한이 없습니다.',
  'COMMON-004': '요청한 대상을 찾을 수 없습니다.',
  'COMMON-006': '요청 크기가 허용 범위를 넘었습니다.',
  'STORAGE-001': '비어 있는 파일은 올릴 수 없습니다.',
  'STORAGE-002': 'JPEG, PNG, GIF, WebP 이미지만 올릴 수 있습니다.',
  'STORAGE-003': '5MB 이하의 이미지만 올릴 수 있습니다.',
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

/** COMMON-001의 필드 오류를 돌려준다. */
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
