export interface Accommodation {
  id: number
  name: string
  location: string
  /** 판매 중인 객실이 없으면 서버가 null을 준다. */
  pricePerNight: number | null
  image: string
  /** 지역 이름 (예: 제주도). 카드에 주소와 함께 표시 */
  regionName: string
  /** 카테고리 이름 (예: 호텔). 카드 이미지 위 배지로 표시 */
  categoryName: string
}

/** 숙박 유형 카테고리 (GET /api/categories 응답 항목) */
export interface Category {
  id: number
  /** 프론트·백엔드가 약속한 고정 코드 (예: HOTEL) */
  code: string | null
  name: string
}

/** 지역 (GET /api/regions 응답 항목) */
export interface Region {
  id: number
  parentId? : number | null
  /** 프론트·백엔드가 약속한 고정 코드 (예: SEOUL) */
  code: string | null
  name: string
  level: number
}

/** 숙소 목록 항목 (GET /api/accommodations 응답 항목) */
export interface AccommodationSummaryResponse {
  id: number
  name: string
  address: string
  regionId: number
  regionName: string
  categoryId: number
  categoryName: string
  thumbnailUrl: string | null
  minNightlyPrice: number | null
}

/** 카테고리 묶음 하나 (GET /api/accommodations/by-category 응답 항목) */
export interface CategoryAccommodationsResponse {
  categoryId: number
  categoryCode: string
  categoryName: string
  accommodations: AccommodationSummaryResponse[]
}

/**
 * 카테고리 바에서 고른 조회 조건입니다. 한 번에 하나만 적용됩니다.
 * - all      : 전체 숙소
 * - category : 숙박 유형 하나 (categoryCode 예: HOTEL)
 * - region   : "지역으로 찾기". regionCode가 null이면 아직 지역을 고르지 않은 상태
 */
export type AccommodationFilter =
  | { type: 'all' }
  | { type: 'category'; categoryCode: string }
  | { type: 'region'; regionCode: string | null }



  
/** URL 쿼리 스트링이 유일한 상태다. page는 1부터. */
export interface SearchConditions {
  regionId?: number
  categoryId?: number
  keyword?: string
  checkIn?: string
  checkOut?: string
  guestCount?: number
  /** 타일로 들어온 탐색 화면. 서버로는 보내지 않는다. */
  view?: SearchView
  page: number
}
export interface SearchRequest {
  categoryId?: number
  regionId?: number
  keyword?: string
  guestCount?: number
  checkIn?: string  // yyyy-MM-dd
  checkOut?: string // yyyy-MM-dd
  page: number      // 0부터
  size: number
}

export type SearchView = 'weekend' | 'region'


/** 찜 상태와 토글 핸들러. 카드와 상세는 props로 받는다. */
export interface FavoriteBinding {
  isFavorite: (accommodationId: number) => boolean
  toggle: (accommodationId: number) => void
}

export interface RefundRule {
  /** 체크인 N일 전까지 */
  daysBefore: number
  /** 0~1 */
  refundRate: number
=======
/** [kny] 숙소 상세페이지 (GET /api/accommodations/{id} 응답) */
export interface AccommodationDetailResponse {
  id: number
  name: string
  /** 숙소 소개. 첫 줄은 강조 문구로 보여 준다. 없으면 null */
  description: string | null
  address: string
  regionId: number
  regionName: string | null
  categoryId: number
  categoryName: string | null
  /** 첫 번째가 대표 사진. 사진이 없으면 빈 배열 */
  imageUrls: string[]
  /** 시설/서비스 이름 목록 (예: 와이파이). 없으면 빈 배열 */
  amenities: string[]
>>>>>>> origin/test/accommo-detail-page
}
