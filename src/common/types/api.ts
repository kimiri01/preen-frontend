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

/** 백엔드 목록(페이지) 응답 형식. page는 0부터 시작합니다. */
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}

