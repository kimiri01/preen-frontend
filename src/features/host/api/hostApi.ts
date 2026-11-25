import { http } from '@/common/api/http'
import type { ApiResponse } from '@/common/types/api'
import type {
  MockAccommodationDetail,
  MockListingStatus,
  MockRefundPolicy,
  MockRefundRule,
  MockRoom,
  MockRoomStatus,
} from '@/features/host/mockHostdeps'



export interface Business {
  id: number
  businessName: string
  businessRegistrationNo: string
  approvalStatus: string
  createdAt: string
}

/** 역할이 HOST로 바뀌므로 새 액세스 토큰이 함께 온다. */
export interface RegisterBusinessResponse {
  business: Business
  accessToken: string
  accessTokenExpiresIn: number
}

/** 내 숙소 목록의 한 줄. 공개 상태와 관계없이 모두 나온다. */
export interface HostAccommodationSummary {
  id: number
  name: string
  address: string
  regionId: number
  regionName: string
  categoryId: number
  categoryName: string
  thumbnailUrl?: string
  listingStatus: MockListingStatus
  roomCount: number
  activeRoomCount: number
  hasRefundPolicy: boolean
  /** 판매 중인 객실과 환불정책이 있어 공개할 수 있는지 */
  readyToList: boolean
}



export interface AccommodationBody {
  regionId: number
  categoryId: number
  name: string
  description?: string
  address: string
  /** HH:mm */
  checkInTime: string
  checkOutTime: string
  /** 수정 시 보내면 통째로 교체된다. 항상 전체 배열을 보낸다. */
  imageUrls: string[]
  amenityIds: number[]
}

export interface RoomBody {
  name: string
  capacity: number
  maxCapacity: number
  extraPersonFee: number
  nightlyPrice: number
  imageUrls: string[]
}

export interface RefundPolicyBody {
  policyText?: string
  rules: MockRefundRule[]
}


const BASE = '/api/host/accommodations'

export const hostApi = {
//   registerBusiness: (body: {
//     businessName: string
//     businessRegistrationNo: string
//   }) => http.post<MockRegisterBusinessResponse>('/api/host-businesses', body),
//   myBusiness: () => http.get<MockBusiness>('/api/host/business'),

  accommodations: async () =>
    (await http.get<ApiResponse<HostAccommodationSummary[]>>(BASE)).data,
  accommodation: async (id: number) =>
    (await http.get<ApiResponse<MockAccommodationDetail>>(`${BASE}/${id}`))
      .data,
  createAccommodation: async (body: AccommodationBody) =>
    (await http.post<ApiResponse<MockAccommodationDetail>>(BASE, body)).data,
  updateAccommodation: async (id: number, body: Partial<AccommodationBody>) =>
    (
      await http.patch<ApiResponse<MockAccommodationDetail>>(
        `${BASE}/${id}`,
        body,
      )
    ).data,
  changeListingStatus: async (id: number, listingStatus: MockListingStatus) =>
    (
      await http.patch<ApiResponse<MockAccommodationDetail>>(
        `${BASE}/${id}/listing-status`,
        { listingStatus },
      )
    ).data,

//   addRoom: (accommodationId: number, body: RoomBody) =>
//     http.post<MockRoom>(`${BASE}/${accommodationId}/rooms`, body),
//   updateRoom: (
//     accommodationId: number,
//     roomId: number,
//     body: Partial<RoomBody> & { status?: MockRoomStatus },
//   ) => http.patch<MockRoom>(`${BASE}/${accommodationId}/rooms/${roomId}`, body),

//   putRefundPolicy: (accommodationId: number, body: RefundPolicyBody) =>
//     http.put<MockRefundPolicy>(`${BASE}/${accommodationId}/refund-policy`, body),
}

export const hostKeys = {
  all: ['host'] as const,
  business: () => [...hostKeys.all, 'business'] as const,
  accommodations: () => [...hostKeys.all, 'accommodations'] as const,
  accommodation: (id: number) =>
    [...hostKeys.all, 'accommodation', id] as const,
}

export const HOST_LAST_ACTIVE_ROOM = 'LAST_ACTIVE_ROOM'

/** 에러 코드는 백엔드 Enum name으로 전달된다. */
export const hostErrorMessages: Record<string, string> = {
  // 사업자
  INVALID_REGISTRATION_NO: '사업자등록번호 형식이 올바르지 않습니다.',
  BUSINESS_ALREADY_REGISTERED: '이미 사업자를 등록한 회원입니다.',
  DUPLICATE_REGISTRATION_NO: '이미 등록된 사업자등록번호입니다.',
  BUSINESS_NOT_FOUND: '등록된 사업자 정보가 없습니다.',

  // 숙소
  ACCOMMODATION_NOT_FOUND: '숙소를 찾을 수 없습니다.',
  NOT_OWNER: '본인 소유의 숙소가 아닙니다.',
  REGION_NOT_FOUND: '존재하지 않는 지역입니다.',
  AMENITY_NOT_FOUND: '존재하지 않는 편의시설이 포함되어 있습니다.',
  ROOM_NOT_FOUND: '객실을 찾을 수 없습니다.',
  INVALID_CAPACITY: '최대 인원은 기준 인원 이상이어야 합니다.',
  NOT_READY_TO_LIST:
    '판매 중인 객실과 환불정책을 등록해야 숙소를 공개할 수 있습니다.',
  DUPLICATE_REFUND_RULE: '같은 일수의 환불 규칙이 중복되었습니다.',
  CATEGORY_NOT_FOUND: '존재하지 않는 카테고리입니다.',
  LAST_ACTIVE_ROOM:
    '공개 중인 숙소의 마지막 판매 객실은 중지할 수 없습니다. 숙소를 먼저 숨겨 주세요.',
}
