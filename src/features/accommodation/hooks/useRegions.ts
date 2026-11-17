import { useQuery } from '@tanstack/react-query'
import { fetchRegions } from '@/features/accommodation/api/accommodationApi'

/**
 * 지역 목록을 서버에서 불러옵니다.
 * 코드(SEOUL 등)가 있는 지역 5개만 화면에 넘깁니다. 나머지 시·도는 DB에만 남습니다.
 */
export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: fetchRegions,
    select: (regions) => regions.filter((region) => region.code !== null),
  })
}
