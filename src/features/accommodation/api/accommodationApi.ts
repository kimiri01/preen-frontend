import { http } from '@/common/api/http'
import type { ApiResponse, PageResponse } from '@/common/types/api'
import type {
  Accommodation,
  AccommodationSummaryResponse,
  Category,
  CategoryAccommodationsResponse,
  Region,
} from '@/features/accommodation/types'

/** 서버 응답 항목 이름을 화면(숙소 카드)에서 쓰는 이름으로 바꿉니다. */
function toAccommodation(item: AccommodationSummaryResponse): Accommodation {
  return {
    id: item.id,
    name: item.name,
    location: item.address,
    pricePerNight: item.minNightlyPrice,
    image: item.thumbnailUrl ?? '',
    regionName: item.regionName,
    categoryName: item.categoryName,
  }
}

/** 카드 뷰에서 카테고리마다 보여 줄 숙소 수 */
export const CARDS_PER_CATEGORY = 6

/** 서버가 한 번에 돌려주는 최대 숙소 수 (기능명세서 COMMON-004: size 최대 50) */
export const MAX_PAGE_SIZE = 50

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

  return {
    ...response.data,
    content: response.data.content.map(toAccommodation),
  }
}

/** "전체 숙소"용 카테고리 묶음 조회. 카테고리마다 숙소를 size개씩 한 번의 요청으로 받아옵니다. */
export async function fetchAccommodationsByCategory(size: number): Promise<
  Array<{
    categoryCode: string
    categoryName: string
    accommodations: Accommodation[]
  }>
> {
  const response = await http.get<
    ApiResponse<CategoryAccommodationsResponse[]>
  >(`/api/accommodations/by-category?size=${size}`)
  return response.data.map((group) => ({
    categoryCode: group.categoryCode,
    categoryName: group.categoryName,
    accommodations: group.accommodations.map(toAccommodation),
  }))
}

/** 최근 본 숙소 조회. ids는 최근에 본 순서이며, 서버도 같은 순서로 돌려줍니다. */
export async function fetchRecentAccommodations(
  ids: number[],
): Promise<Accommodation[]> {
  const response = await http.get<ApiResponse<AccommodationSummaryResponse[]>>(
    `/api/accommodations/recent?ids=${ids.join(',')}`,
  )
  return response.data.map(toAccommodation)
}
