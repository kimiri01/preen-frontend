import { CategoryBar } from '@/features/accommodation/public'
import type { AccommodationFilter } from '@/features/accommodation/public'

interface SearchSectionProps {
  filter: AccommodationFilter
  onChangeFilter: (filter: AccommodationFilter) => void
}

export function SearchSection({ filter, onChangeFilter }: SearchSectionProps) {
  return (
    <section className="search-section" aria-label="검색과 카테고리">
      <div className="search">
        <button type="button" className="search-field">
          <small>여행 지역</small>
          <span>지역 또는 숙소명</span>
        </button>
        <button type="button" className="search-field">
          <small>체크인 · 체크아웃</small>
          <span>11.20 (금) — 11.21 (토)</span>
        </button>
        <button type="button" className="search-field">
          <small>인원 · 객실</small>
          <span>성인 2명 · 객실 1개</span>
        </button>
        <button type="button" className="search-submit">
          검색하기
        </button>
      </div>
      <CategoryBar filter={filter} onChangeFilter={onChangeFilter} />
    </section>
  )
}
