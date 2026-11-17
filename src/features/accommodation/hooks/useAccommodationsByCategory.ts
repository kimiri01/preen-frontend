import { useQuery } from '@tanstack/react-query'
import {
  CARDS_PER_CATEGORY,
  fetchAccommodationsByCategory,
} from '@/features/accommodation/api/accommodationApi'
import type { Accommodation } from '@/features/accommodation/types'

export interface CategoryGroup {
  categoryCode: string
  /** 화면에 보여 줄 카테고리 이름 (예: 호텔) */
  label: string
  accommodations: Accommodation[]
}

interface UseAccommodationsByCategoryResult {
  groups: CategoryGroup[]
  /** pending: 불러오는 중 / error: 서버 연결 실패 / success: 조회 완료 */
  status: 'pending' | 'error' | 'success'
}

/**
 * "전체 숙소"를 골랐을 때 쓰는 Hook. 카테고리마다 숙소 6개씩 묶인 목록을 불러옵니다.
 *
 * 묶음 전용 API(GET /api/accommodations/by-category?size=6)를 한 번만 호출합니다.
 * 서버가 카테고리 표시 순서(모텔 → 호텔 → … → 게스트하우스)대로 묶어서 돌려줍니다.
 *
 * @param enabled false면 요청하지 않습니다. (전체 숙소가 아닐 때)
 */
export function useAccommodationsByCategory(
  enabled: boolean,
): UseAccommodationsByCategoryResult {
  const query = useQuery({
    queryKey: ['accommodations', 'by-category', { size: CARDS_PER_CATEGORY }],
    queryFn: () => fetchAccommodationsByCategory(CARDS_PER_CATEGORY),
    enabled,
  })

  if (query.status !== 'success') {
    return { groups: [], status: query.status }
  }

  const groups = query.data
    .map((group) => ({
      categoryCode: group.categoryCode,
      label: group.categoryName,
      accommodations: group.accommodations,
    }))
    // 숙소가 하나도 없는 카테고리는 묶음을 보여 주지 않습니다.
    .filter((group) => group.accommodations.length > 0)

  return { groups, status: 'success' }
}
