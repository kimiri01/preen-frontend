import { useCategories } from '@/features/accommodation/hooks/useCategories'
import { useRegions } from '@/features/accommodation/hooks/useRegions'
import type { AccommodationFilter } from '@/features/accommodation/types'

/** 검색 범위: 카테고리 바에서 고른 탭을 서버가 쓰는 ID로 바꾼 값 */
export interface SearchScope {
  categoryId?: number
  regionId?: number
}

/**
 * [kny] 카테고리 바의 선택값(고정 코드: HOTEL, SEOUL 등)을 서버 ID로 바꿉니다.
 * 홈 검색 바가 "지금 고른 탭" 안에서 검색하도록 넘겨줄 때 씁니다.
 * - 전체 숙소 / 지역 미선택 / 서버가 꺼져 ID를 못 찾음 → 빈 값(조건 없이 검색)
 * 기존 useAccommodations의 코드→ID 변환 규칙과 같습니다. (그 파일은 건드리지 않음)
 */
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
