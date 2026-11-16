export interface HttpRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

/** 백엔드 공통 응답 형식 (기능명세서 COMMON-004) */
export interface ApiResponse<T> {
  success: boolean
  data: T
  code: string | null
  message: string | null
}