/** 서버 응답이 없을 때 프론트에서 쓰는 코드 */
export const CLIENT_ERROR_CODE = {
  /** 서버에 닿지 못함 (fetch TypeError) */
  NETWORK_ERROR: 'NETWORK_ERROR',
  /** 시간 초과 (TimeoutError) */
  TIMEOUT: 'TIMEOUT',
  /** 요청 취소 (AbortError) */
  CANCELED: 'CANCELED',
  /** JSON이 아닌 응답 (nginx 502 HTML 등) */
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  /** 서버가 code를 안 보냈거나 분류 불가 */
  UNKNOWN: 'UNKNOWN',
} as const

/** CLIENT_ERROR_CODE 값 중 하나 */
export type ClientErrorCode = (typeof CLIENT_ERROR_CODE)[keyof typeof CLIENT_ERROR_CODE]

/**
 * 모든 HTTP 실패를 담는 하나의 에러.
 * 서버 응답이 있으면 status/code/message는 서버 값, 없으면 프론트가 정한 값이 들어간다.
 */
export class ApiError extends Error {
    /** HTTP 상태 코드. 서버 응답이 없으면 0 */
    readonly status: number
    /** 백엔드 ErrorCode 이름 또는 ClientErrorCode */
    readonly code: string
    /** 서버 응답의 data (예: 검증 실패 시 필드별 오류) */
    readonly data: unknown

    constructor(status:number, code:string, message:string, data?:unknown){
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.code = code
        this.data = data

    }

    /** 서버에 닿지 못한 실패인지 (네트워크, 타임아웃, 취소) */
    get isClientError(): boolean {
        return this.status === 0
    }
}

/** error가 ApiError인지 확인하고, 맞으면 타입을 ApiError로 좁힌다 */
export function isApiError(error: unknown): error is ApiError{
    return error instanceof ApiError
}