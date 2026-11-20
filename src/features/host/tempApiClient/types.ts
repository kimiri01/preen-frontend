export interface ApiResponse<T> {
    success: boolean
    code: string
    message?:string
    data?: T
}

/** COMMON-001의 `data`. { 필드명: 메시지 } */
export type FieldErrors = Record<string, string>

export type QueryValue = string | number | boolean | null | undefined

export interface HttpRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** 값이 없는(null, undefined, 빈 문자열) 조건은 보내지 않는다. */
  query?: Record<string, QueryValue>
}
