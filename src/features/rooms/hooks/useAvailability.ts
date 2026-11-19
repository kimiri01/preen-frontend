import { useQuery } from '@tanstack/react-query'
import { http } from '@/common/api/http'
import type { ApiResponse } from '@/common/types/api'
export interface RoomAvailability {
  roomId: string
  roomName: string
  capacity: number
  maxCapacity: number
  extraPersonFee: string
  nights: number
  available: boolean
  reason: 'AVAILABLE' | 'MISSING_INVENTORY' | 'CLOSED' | 'SOLD_OUT'
  remainingRooms: number | null
  totalPrice: string | null
}
export interface Availability {
  accommodationId: string
  checkIn: string
  checkOut: string
  nights: number
  currency: 'KRW'
  checkedAt: string
  rooms: RoomAvailability[]
}
export function useAvailability(
  id: string,
  checkIn: string,
  checkOut: string,
  valid: boolean,
) {
  return useQuery({
    queryKey: ['room-availability', id, checkIn, checkOut],
    queryFn: async ({ signal }) =>
      (
        await http.get<ApiResponse<Availability>>(
          `/api/accommodations/${encodeURIComponent(id)}/availability?${new URLSearchParams({ checkIn, checkOut })}`,
          { signal },
        )
      ).data,
    enabled: valid,
    staleTime: 0,
    retry: 1,
    refetchOnWindowFocus: true,
  })
}
export const availabilityReason = {
  AVAILABLE: '예약 가능',
  MISSING_INVENTORY: '날짜별 판매 정보 미등록',
  CLOSED: '선택 일정 판매 마감',
  SOLD_OUT: '선택 일정 잔여 객실 없음',
} as const
