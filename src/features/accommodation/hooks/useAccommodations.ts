import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  CARDS_PER_CATEGORY,
  fetchAccommodations,
  MAX_PAGE_SIZE,
} from '@/features/accommodation/api/accommodationApi'
import { useCategories } from '@/features/accommodation/hooks/useCategories'
import { useRegions } from '@/features/accommodation/hooks/useRegions'
import type {
  Accommodation,
  AccommodationFilter,
} from '@/features/accommodation/types'

interface UseAccommodationsResult {
  accommodations: Accommodation[]
  /** pending: 불러오는 중 / error: 서버 연결 실패 / success: 조회 완료 */
  status: 'pending' | 'error' | 'success'
}

/**
 * 카테고리 바에서 고른 조건(filter)에 맞는 숙소 목록을 서버에서 불러옵니다.
 *
 * 버튼은 고정 코드(HOTEL, SEOUL 등)만 알고 있고 서버 조회에는 ID가 필요하므로,
 * 먼저 카테고리·지역 목록에서 코드에 해당하는 ID를 찾은 뒤 숙소를 조회합니다.
 */
export function useAccommodations(
  filter: AccommodationFilter,
): UseAccommodationsResult {
  const categoriesQuery = useCategories()
  const regionsQuery = useRegions()

  // 1) 코드 → ID 찾기. lookup은 "ID를 찾는 데 쓰는 목록 조회"의 상태입니다.
  let categoryId: number | null = null
  let regionId: number | null = null
  let lookup: 'pending' | 'error' | 'success' = 'success'
  let isCodeMissing = false

  if (filter.type === 'category') {
    lookup = categoriesQuery.status
    const category = categoriesQuery.data?.find(
      (item) => item.code === filter.categoryCode,
    )
    categoryId = category?.id ?? null
    isCodeMissing = lookup === 'success' && category === undefined
  } else if (filter.type === 'region' && filter.regionCode !== null) {
    lookup = regionsQuery.status
    const region = regionsQuery.data?.find(
      (item) => item.code === filter.regionCode,
    )
    regionId = region?.id ?? null
    isCodeMissing = lookup === 'success' && region === undefined
  }

  // 2) 숙소 조회. ID를 찾은 뒤에만 요청합니다.
  //    조건(categoryId, regionId, size)이 Query Key에 있어, 조건이 바뀌면 자동으로 다시 조회합니다.
  //    카테고리는 6개만, 지역은 최대 50개까지 받아옵니다.
  //    "전체 숙소"는 카테고리별 묶음(useAccommodationsByCategory)으로 보여 주므로 여기서는 요청하지 않습니다.
  const size = filter.type === 'category' ? CARDS_PER_CATEGORY : MAX_PAGE_SIZE
  const accommodationsQuery = useQuery({
    queryKey: ['accommodations', { categoryId, regionId, size }],
    queryFn: () => fetchAccommodations({ categoryId, regionId, size }),
    enabled: filter.type !== 'all' && lookup === 'success' && !isCodeMissing,
    // 새 목록을 받아오는 동안 이전 목록을 유지해 화면 깜빡임을 줄입니다.
    placeholderData: keepPreviousData,
  })

  // 서버에 해당 코드가 없으면 조건에 맞는 숙소가 없는 것으로 봅니다.
  if (isCodeMissing) return { accommodations: [], status: 'success' }
  if (lookup !== 'success') return { accommodations: [], status: lookup }
  return {
    accommodations: accommodationsQuery.data?.content ?? [],
    status: accommodationsQuery.status,
  }
}
