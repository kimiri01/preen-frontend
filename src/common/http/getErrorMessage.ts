import { ApiError, CLIENT_ERROR_CODE, isApiError } from './ApiError'

export const GENERIC_ERROR_MESSAGE = '잠시 후 다시 시도해 주세요.'

/** 서버 응답이 없을 때 쓰는 문구 */
const clientErrorMessages: Record<string, string> = {
  [CLIENT_ERROR_CODE.NETWORK_ERROR]: '네트워크 연결을 확인해 주세요.',
  [CLIENT_ERROR_CODE.TIMEOUT]: '응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.',
  [CLIENT_ERROR_CODE.CANCELED]: '요청이 취소되었습니다.',
  [CLIENT_ERROR_CODE.INVALID_RESPONSE]: GENERIC_ERROR_MESSAGE,
  [CLIENT_ERROR_CODE.UNKNOWN]: GENERIC_ERROR_MESSAGE,
}

/** 공통 ErrorCode 문구 (feature 문구 표에 없을 때 사용) */
export const commonErrorMessages: Record<string, string> = {
  // CommonErrorCode (INVALID_INPUT은 서버가 첫 번째 필드 오류를 message로 주므로 넣지 않음)
  TOO_MANY_REQUESTS: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',

  // SecurityErrorCode
  SESSION_INVALID: '다시 로그인해 주세요.',
  ACCESS_DENIED: '이 기능에 접근할 권한이 없어요.',
  SESSION_LOOKUP_UNAVAILABLE:
    '로그인 상태를 확인할 수 없어요. 잠시 후 다시 시도해 주세요.', // 503이라 표에 있어야 노출됨

  // ResponseStatusException → status.name()
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 대상을 찾을 수 없습니다.',

  // StorageErrorCode
  EMPTY_FILE: '비어 있는 파일은 올릴 수 없습니다.',
  UNSUPPORTED_IMAGE_TYPE: 'JPEG, PNG, GIF, WebP 이미지만 올릴 수 있습니다.',
  IMAGE_TOO_LARGE: '5MB 이하의 이미지만 올릴 수 있습니다.',
}



export function getErrorMessage(
    error: unknown,
    messages: Record<string, string> ={},
): string {
    // http 밖에서 난 에러(코드 버그 등)는 일반 문구
    if(!isApiError(error)) return GENERIC_ERROR_MESSAGE

    const {code, status, message } = error
    if(status ===0) return clientErrorMessages[code] ?? GENERIC_ERROR_MESSAGE

  const mapped = messages[code] ?? commonErrorMessages[code]
  if (mapped) return mapped
  if (status >= 500) return GENERIC_ERROR_MESSAGE
  return message || GENERIC_ERROR_MESSAGE
}

export function isErrorCode(error: unknown, ...codes: string[]): boolean {
  return isApiError(error) && codes.includes(error.code)
}

/**
 * 검증 실패(INVALID_INPUT) 시 data에 담긴 필드별 오류를 { field: message }로 바꾼다.
 * 백엔드는 [{ field, message }, ...] 배열로 보낸다. 같은 필드가 여러 번 오면 첫 번째만 쓴다.
 */
export function fieldErrorsOf(error: unknown): Record<string, string> {
  if (!isApiError(error) || !Array.isArray(error.data)) return {}

  const result: Record<string, string> = {}
  for (const item of error.data as unknown[]) {
    if (typeof item !== 'object' || item === null) continue
    const { field, message } = item as Record<string, unknown>
    if (typeof field === 'string' && typeof message === 'string') {
      result[field] ??= message
    }
  }
  return result
}

export type { ApiError }

