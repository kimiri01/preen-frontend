export interface Accommodation {
  id: number
  name: string
  location: string
  pricePerNight: number
  image: string
}

/** 숙박 유형 카테고리 (GET /api/categories 응답 항목) */
export interface Category {
  id: number
  /** 프론트·백엔드가 약속한 고정 코드 (예: HOTEL) */
  code: string
  name: string
}

/** 지역 (GET /api/regions 응답 항목) */
export interface Region {
  id: number
  /** 프론트·백엔드가 약속한 고정 코드 (예: SEOUL) */
  code: string
  name: string
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
  minNightlyPrice: number
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
