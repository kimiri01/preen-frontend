import { useQuery } from '@tanstack/react-query'
import { fetchRegions } from '@/features/accommodation/api/accommodationApi'

/** 지역 목록을 서버에서 불러옵니다. */
export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: fetchRegions,
  })
}
