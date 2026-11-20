import { useQuery, useQueryClient } from '@tanstack/react-query'
import { hostApi, hostKeys } from '@/features/host/api/hostApi'


export function useHostAccommodations() {
  return useQuery({
    queryKey: hostKeys.accommodations(),
    queryFn: hostApi.accommodations,
  })
}





/** 숙소·객실·환불정책이 바뀌면 호스트 목록·상세, 재고 조회, 공개 화면을 무효화한다. */
export function useInvalidateHost() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: hostKeys.all })
    // void queryClient.invalidateQueries({ queryKey: accommodationKeys.all })
    // void queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
  }
}
