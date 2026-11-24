import { useQuery } from '@tanstack/react-query'
import { fetchRegions } from '@/features/accommodation/api/accommodationApi'

/** 코드가 있는 지역 목록을 서버에서 불러옵니다. */
export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: fetchRegions,
    select: (regions) => regions.filter((region) => region.code !== null),
  })
}
