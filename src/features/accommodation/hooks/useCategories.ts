import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '@/features/accommodation/api/accommodationApi'

/**
 * 카테고리 목록을 서버에서 불러옵니다.
 * 코드(HOTEL 등)가 있는 카테고리만 화면에 넘깁니다. 메인 화면 버튼과 약속한 6개만 보이고,
 * 팀원 데이터의 다른 카테고리(펜션, 한옥 등)는 DB에만 남고 화면에는 나오지 않습니다.
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    select: (categories) => categories.filter((category) => category.code !== null),
  })
}
