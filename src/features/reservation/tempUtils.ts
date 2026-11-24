
/** 서버의 LocalDateTime(Asia/Seoul, 시간대 표기 없음)을 Date로 바꾼다. */
export function parseKstDateTime(value: string): Date {
  const trimmed = value.replace(/(\.\d{3})\d+/, '$1')
  return new Date(`${trimmed}+09:00`)
}




export const inventoryKeys = {
  all: ['inventory'] as const,
  availabilityOf: (accommodationId: number) =>
    [...inventoryKeys.all, 'availability', accommodationId] as const,
  availability: (accommodationId: number, checkIn: string, checkOut: string) =>
    [
      ...inventoryKeys.availabilityOf(accommodationId),
      checkIn,
      checkOut,
    ] as const,
  hostRoom: (roomId: number) => [...inventoryKeys.all, 'host', roomId] as const,
  hostMonth: (roomId: number, month: string) =>
    [...inventoryKeys.hostRoom(roomId), month] as const,
}

//====================================================


import { useQuery, useQueryClient } from '@tanstack/react-query'

// 0) 가짜 타입 (accommodation/types.ts를 import하지 않고 이 파일 안에서 정의)
export interface MockAmenity {
  id: number
  name: string
}

export type MockListingStatus = 'DRAFT' | 'LISTED' | 'HIDDEN'
export type MockRoomStatus = 'ACTIVE' | 'INACTIVE'

export interface MockRoom {
  id: number
  name: string
  /** 기준 인원 */
  capacity: number
  maxCapacity: number
  extraPersonFee: number
  nightlyPrice: number
  status: MockRoomStatus
  imageUrls: string[]
}

export interface MockRefundRule {
  /** 체크인 N일 전까지 */
  daysBefore: number
  /** 0~1 */
  refundRate: number
}

export interface MockRefundPolicy {
  id: number
  version: string
  policyText?: string
  rules: MockRefundRule[]
}

export interface MockAccommodationDetail {
  id: number
  name: string
  description?: string
  address: string
  regionId: number
  regionName: string
  categoryId: number
  categoryName: string
  latitude?: number
  longitude?: number
  /** HH:mm:ss */
  checkInTime: string
  checkOutTime: string
  listingStatus: MockListingStatus
  imageUrls: string[]
  amenities: MockAmenity[]
  rooms: MockRoom[]
  refundPolicy?: MockRefundPolicy
}

// 1) 쿼리 키
export const mockAccommodationKeys = {
  all: ['reservation-mock', 'accommodation'] as const,
  detail: (id: number) => [...mockAccommodationKeys.all, 'detail', id] as const,
}

// 2) mock 데이터
export const mockAccommodationDetail = (id: number): MockAccommodationDetail => ({
  id,
  name: `테스트 스테이 ${id}`,
  description: '바다가 한눈에 보이는 아늑한 숙소입니다.',
  address: '강원특별자치도 강릉시 창해로 100',
  regionId: 32,
  regionName: '강릉시',
  categoryId: 1,
  categoryName: '펜션',
  latitude: 37.7519,
  longitude: 128.8761,
  checkInTime: '15:00:00',
  checkOutTime: '11:00:00',
  listingStatus: 'LISTED',
  imageUrls: ['https://picsum.photos/seed/stay1/1200/800'],
  amenities: [
    { id: 1, name: '와이파이' },
    { id: 2, name: '주차' },
  ],
  rooms: [
    {
      id: 101,
      name: '오션뷰 스탠다드',
      capacity: 2,
      maxCapacity: 3,
      extraPersonFee: 20000,
      nightlyPrice: 120000,
      status: 'ACTIVE',
      imageUrls: ['https://picsum.photos/seed/room101/1000/700'],
    },
    {
      id: 102,
      name: '패밀리 스위트',
      capacity: 4,
      maxCapacity: 6,
      extraPersonFee: 30000,
      nightlyPrice: 220000,
      status: 'ACTIVE',
      imageUrls: [],
    },
  ],
  refundPolicy: {
    id: 1,
    version: 'v1',
    rules: [
      { daysBefore: 7, refundRate: 1 },
      { daysBefore: 3, refundRate: 0.5 },
    ],
  },
})

// 3) 조회 훅 (queryFn 반환값이 위 키로 캐시에 저장됨)
export function useMockAccommodationDetail(id: number | undefined) {
  return useQuery({
    queryKey: mockAccommodationKeys.detail(id ?? 0),
    queryFn: () => Promise.resolve(mockAccommodationDetail(id as number)),
    enabled: id !== undefined,
    staleTime: Infinity,
  })
}

// 4) (선택) 캐시에 직접 넣기
export function useSeedMockAccommodation() {
  const queryClient = useQueryClient()
  return (id: number) =>
    queryClient.setQueryData(
      mockAccommodationKeys.detail(id),
      mockAccommodationDetail(id),
    )
}