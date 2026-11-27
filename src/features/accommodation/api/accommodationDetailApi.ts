import { http } from '@/common/http'
import type { AccommodationDetailResponse } from '@/features/accommodation/types'

/** [kny] 숙소 상세 기본 정보 조회 */
export function fetchAccommodationDetail(
  id: number,
  signal?: AbortSignal,
): Promise<AccommodationDetailResponse> {
  return http.get<AccommodationDetailResponse>(`/api/accommodations/${id}`, {
    signal,
  })
}
