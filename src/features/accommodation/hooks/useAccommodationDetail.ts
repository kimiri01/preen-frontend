import { useQuery } from '@tanstack/react-query'
import { fetchAccommodationDetail } from '@/features/accommodation/api/accommodationDetailApi'

/** 주소창의 숙소 ID(문자)를 숫자로 바꿉니다. 1 이상의 정수가 아니면 null입니다. */
export function parseAccommodationId(value: string | undefined): number | null {
  if (!value || !/^[1-9][0-9]{0,15}$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}

/**
 * [kny] 숙소 상세 기본 정보를 불러옵니다.
 * 404(없는 숙소)처럼 다시 요청해도 결과가 같은 오류는 재시도하지 않습니다. (queryClient 전역 규칙)
 */
export function useAccommodationDetail(id: number | null) {
  return useQuery({
    queryKey: ['accommodation-detail', id],
    queryFn: ({ signal }) => fetchAccommodationDetail(id as number, signal),
    enabled: id !== null,
  })
}
