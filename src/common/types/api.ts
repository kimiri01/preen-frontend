/** 백엔드 목록(페이지) 응답 형식. page는 0부터 시작합니다. */
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}
