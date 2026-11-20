/* ───────── 호스트(Host) 임시 Mock 타입 정의 ───────── */

/** 숙소 공개 상태 */
export type MockListingStatus = 'DRAFT' | 'LISTED' | 'HIDDEN'

/** 객실 판매 상태 */
export type MockRoomStatus = 'ACTIVE' | 'INACTIVE'

/** 환불 규정 룰 */
export interface MockRefundRule {
  /** 체크인 N일 전까지 */
  daysBefore: number
  /** 환불 비율 (0 ~ 1, 예: 1 = 100%, 0.5 = 50%) */
  refundRate: number
}

/** 환불 정책 */
export interface MockRefundPolicy {
  id?: number
  version?: string
  policyText?: string
  rules: MockRefundRule[]
}

/** 객실 정보 */
export interface MockRoom {
  id: number
  name: string
  /** 기준 인원 */
  capacity: number
  /** 최대 인원 */
  maxCapacity: number
  /** 추가 인원 요금 */
  extraPersonFee: number
  /** 1박 기본 요금 */
  nightlyPrice: number
  /** 객실 상태 */
  status: MockRoomStatus
  /** 객실 이미지 목록 */
  imageUrls: string[]
}

/** 편의시설 Mock */
export interface MockAmenity {
  id: number
  name: string
}

/** 숙소 상세 정보 */
export interface MockAccommodationDetail {
  id: number
  name: string
  description?: string | null
  address: string
  regionId: number
  regionName?: string | null
  categoryId: number
  categoryName?: string | null
  latitude?: number
  longitude?: number
  /** 체크인 시간 (HH:mm:ss) */
  checkInTime?: string
  /** 체크아웃 시간 (HH:mm:ss) */
  checkOutTime?: string
  /** 숙소 공개 상태 */
  listingStatus: MockListingStatus
  /** 숙소 이미지 목록 */
  imageUrls: string[]
  /** 편의시설 목록 */
  amenities?: (MockAmenity | string)[]
  /** 등록된 객실 목록 */
  rooms?: MockRoom[]
  /** 환불 정책 */
  refundPolicy?: MockRefundPolicy
}

/* ───────── 호스트 API 요청/응답 Body 보조 Mock 타입 ───────── */


/* ───────── 편의를 위한 기존 타입 이름 Alias ───────── */
export type AccommodationDetail = MockAccommodationDetail
export type ListingStatus = MockListingStatus
export type RefundPolicy = MockRefundPolicy
export type RefundRule = MockRefundRule
export type Room = MockRoom
export type RoomStatus = MockRoomStatus