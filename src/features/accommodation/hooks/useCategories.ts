import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '@/features/accommodation/api/accommodationApi'

/** 카테고리 목록을 서버에서 불러옵니다. */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
}
