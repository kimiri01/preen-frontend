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
  /** status가 error일 때의 에러 (화면 문구용) */
  error: unknown
  /** 실패한 요청 다시 보내기 */
  refetch: () => void
}

/** "전체 숙소"용: 카테고리별 숙소 묶음을 불러옵니다. */
export function useAccommodationsByCategory(
  enabled: boolean,
): UseAccommodationsByCategoryResult {
  const query = useQuery({
    queryKey: ['accommodations', 'by-category', { size: CARDS_PER_CATEGORY }],
    queryFn: () => fetchAccommodationsByCategory(CARDS_PER_CATEGORY),
    enabled,
  })

  const error = query.error
  const refetch = () => void query.refetch()

  if (query.status !== 'success') {
    return { groups: [], status: query.status, error, refetch }
  }

  const groups = query.data
    .map((group) => ({
      categoryCode: group.categoryCode,
      label: group.categoryName,
      accommodations: group.accommodations,
    }))
    .filter((group) => group.accommodations.length > 0)

  return { groups, status: 'success', error, refetch }
}
