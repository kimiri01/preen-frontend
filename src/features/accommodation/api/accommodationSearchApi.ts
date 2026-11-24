import { http } from '@/common/api/http'
import type { ApiResponse, PageResponse } from '@/common/types/api'
import type {
  AccommodationSummaryResponse,
  SearchRequest,
} from '@/features/accommodation/types'

/** 값이 있는 조건만 쿼리 스트링으로 만든다. */
export function toQueryString(request: SearchRequest): string {
  const params = new URLSearchParams({
    page: String(request.page),
    size: String(request.size),
  })
  if (request.categoryId) params.set('categoryId', String(request.categoryId))
  if (request.regionId) params.set('regionId', String(request.regionId))
  if (request.keyword) params.set('keyword', request.keyword)
  if (request.guestCount) params.set('guestCount', String(request.guestCount))
  if (request.checkIn && request.checkOut) {
    params.set('checkIn', request.checkIn)
    params.set('checkOut', request.checkOut)
  }
  return params.toString()
}

export async function searchAccommodations(
  request: SearchRequest,
  signal?: AbortSignal,
): Promise<PageResponse<AccommodationSummaryResponse>> {
  const response = await http.get<
    ApiResponse<PageResponse<AccommodationSummaryResponse>>
  >(`/api/accommodations?${toQueryString(request)}`, { signal })

  return response.data
}