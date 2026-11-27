export interface HttpRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
  sameOrigin?: boolean
}

/** 백엔드 공통 응답 형식 (기능명세서 COMMON-004) */
export interface ApiResponse<T> {
  success: boolean
 
  //성공할 때, 실패할 때 모두 code와 message가 문자열로 반환된다. (따라서 NULL은 제거합니다)
  code: string 
  message: string
  data: T
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
