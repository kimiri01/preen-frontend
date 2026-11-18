import {
  CategoryBar,
  SearchBar,
  useFilterIds,
} from '@/features/accommodation/public'
import type { AccommodationFilter } from '@/features/accommodation/public'

interface SearchSectionProps {
  filter: AccommodationFilter
  onChangeFilter: (filter: AccommodationFilter) => void
}

export function SearchSection({ filter, onChangeFilter }: SearchSectionProps) {
  // [kny] 고른 카테고리 탭(코드)을 서버 ID로 바꿔 검색 바에 넘깁니다.
  // 예) "호텔" 탭에서 "제주" 검색 → 제주의 호텔만 검색
  const scope = useFilterIds(filter)

  return (
    <section className="search-section" aria-label="검색과 카테고리">
      {/* 기존 버튼과 같은 모양(.search / .search-field / .search-submit)의 실제 검색 폼 */}
      <SearchBar scope={scope} />
      <CategoryBar filter={filter} onChangeFilter={onChangeFilter} />
    </section>
  )
}
