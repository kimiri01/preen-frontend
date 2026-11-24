import { useCategories } from '@/features/accommodation/hooks/useCategories'
import { useRegions } from '@/features/accommodation/hooks/useRegions'
import type { AccommodationFilter } from '@/features/accommodation/types'

/** 검색 범위: 카테고리 바에서 고른 탭을 서버가 쓰는 ID로 바꾼 값 */
export interface SearchScope {
  categoryId?: number
  regionId?: number
}

/** 카테고리 바의 고정 코드(HOTEL, SEOUL 등)를 서버 ID로 바꿉니다. */
export function useFilterIds(filter: AccommodationFilter): SearchScope {
  const categories = useCategories()
  const regions = useRegions()

  if (filter.type === 'category') {
    const category = categories.data?.find(
      (item) => item.code === filter.categoryCode,
    )
    return { categoryId: category?.id }
  }
  if (filter.type === 'region' && filter.regionCode !== null) {
    const region = regions.data?.find((item) => item.code === filter.regionCode)
    return { regionId: region?.id }
  }
  return {}
}
