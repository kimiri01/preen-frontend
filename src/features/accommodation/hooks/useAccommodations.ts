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
  /** status가 error일 때의 에러 (화면 문구용) */
  error: unknown
  /** 실패한 요청(카테고리·지역 조회 또는 숙소 조회) 다시 보내기 */
  refetch: () => void
}

/** 카테고리 바에서 고른 조건에 맞는 숙소 목록을 불러옵니다. */
export function useAccommodations(
  filter: AccommodationFilter,
): UseAccommodationsResult {
  const categoriesQuery = useCategories()
  const regionsQuery = useRegions()

  let categoryId: number | null = null
  let regionId: number | null = null
  let lookup: 'pending' | 'error' | 'success' = 'success'
  let isCodeMissing = false
  // 숙소 조회 전에 먼저 필요한 조회(카테고리 또는 지역). 실패하면 이 조회를 다시 보낸다.
  let lookupQuery: typeof categoriesQuery | typeof regionsQuery | null = null

  if (filter.type === 'category') {
    lookupQuery = categoriesQuery
    lookup = categoriesQuery.status
    const category = categoriesQuery.data?.find(
      (item) => item.code === filter.categoryCode,
    )
    categoryId = category?.id ?? null
    isCodeMissing = lookup === 'success' && category === undefined
  } else if (filter.type === 'region' && filter.regionCode !== null) {
    lookupQuery = regionsQuery
    lookup = regionsQuery.status
    const region = regionsQuery.data?.find(
      (item) => item.code === filter.regionCode,
    )
    regionId = region?.id ?? null
    isCodeMissing = lookup === 'success' && region === undefined
  }

  const size = filter.type === 'category' ? CARDS_PER_CATEGORY : MAX_PAGE_SIZE
  const accommodationsQuery = useQuery({
    queryKey: ['accommodations', { categoryId, regionId, size }],
    queryFn: () => fetchAccommodations({ categoryId, regionId, size }),
    enabled: filter.type !== 'all' && lookup === 'success' && !isCodeMissing,
    placeholderData: keepPreviousData,
  })

  const failedQuery = lookup !== 'success' ? lookupQuery : accommodationsQuery
  const error = failedQuery?.error ?? null
  const refetch = () => void failedQuery?.refetch()

  if (isCodeMissing)
    return { accommodations: [], status: 'success', error: null, refetch }
  if (lookup !== 'success')
    return { accommodations: [], status: lookup, error, refetch }
  return {
    accommodations: accommodationsQuery.data?.content ?? [],
    status: accommodationsQuery.status,
    error,
    refetch,
  }
}
