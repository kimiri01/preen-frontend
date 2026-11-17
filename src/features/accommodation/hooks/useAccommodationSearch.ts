import { keepPreviousData, useQuery } from '@tanstack/react-query'


import type { SearchRequest } from '@/features/accommodation/types'

import { searchAccommodations } from '@/features/accommodation/api/accommodationSearchApi'

export const accommodationKeys = {
  all: ['accommodation'] as const,
  regions: () => [...accommodationKeys.all, 'regions'] as const,
  categories: () => [...accommodationKeys.all, 'categories'] as const,
  amenities: () => [...accommodationKeys.all, 'amenities'] as const,
  list: (request: SearchRequest) =>
    [...accommodationKeys.all, 'list', request] as const,
  detail: (id: number) => [...accommodationKeys.all, 'detail', id] as const,
}


/** 조회 조건은 전부 Query Key에 넣는다. 페이지 전환 중에는 이전 결과를 유지한다. */
export function useAccommodationSearch(request: SearchRequest) {
  return useQuery({
    queryKey: accommodationKeys.list(request),
    queryFn: ({ signal }) => searchAccommodations(request, signal),

    placeholderData: keepPreviousData,
  })
}