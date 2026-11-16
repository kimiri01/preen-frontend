import { http } from '@/common/api/http'
import type { ApiResponse, PageResponse } from '@/common/types/api'
import type {
  Accommodation,
  AccommodationSummaryResponse,
  Category,
  Region,
} from '@/features/accommodation/types'

/** 숙박 유형 카테고리 목록 조회 */
export async function fetchCategories(): Promise<Category[]> {
  const response = await http.get<ApiResponse<Category[]>>('/api/categories')
  return response.data
}

/** 지역 목록 조회 */
export async function fetchRegions(): Promise<Region[]> {
  const response = await http.get<ApiResponse<Region[]>>('/api/regions')
  return response.data
}

export interface FetchAccommodationsParams {
  /** null이면 카테고리 조건을 적용하지 않습니다. */
  categoryId: number | null
  /** null이면 지역 조건을 적용하지 않습니다. */
  regionId: number | null
  page?: number
  size?: number
}

/** 숙소 목록 조회. categoryId·regionId가 있으면 해당 조건의 숙소만 받아옵니다. */
export async function fetchAccommodations({
  categoryId,
  regionId,
  page = 0,
  size = 8,
}: FetchAccommodationsParams): Promise<PageResponse<Accommodation>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  })
  if (categoryId !== null) params.set('categoryId', String(categoryId))
  if (regionId !== null) params.set('regionId', String(regionId))

  const response = await http.get<
    ApiResponse<PageResponse<AccommodationSummaryResponse>>
  >(`/api/accommodations?${params}`)

  // 서버 응답 항목 이름을 화면(숙소 카드)에서 쓰는 이름으로 바꿉니다.
  return {
    ...response.data,
    content: response.data.content.map((item) => ({
      id: item.id,
      name: item.name,
      location: item.address,
      pricePerNight: item.minNightlyPrice,
      image: item.thumbnailUrl ?? '',
    })),
  }
}
