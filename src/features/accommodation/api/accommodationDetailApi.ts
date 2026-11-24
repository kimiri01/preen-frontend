import { http } from '@/common/api/http'
import type { ApiResponse } from '@/common/types/api'
import type { AccommodationDetailResponse } from '@/features/accommodation/types'

/** [kny] 숙소 상세 기본 정보 조회 */
export async function fetchAccommodationDetail(
  id: number,
  signal?: AbortSignal,
): Promise<AccommodationDetailResponse> {
  const response = await http.get<ApiResponse<AccommodationDetailResponse>>(
    `/api/accommodations/${id}`,
    { signal },
  )
  return response.data
}
