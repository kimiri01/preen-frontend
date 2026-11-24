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
  const scope = useFilterIds(filter)

  return (
    <section className="search-section" aria-label="검색과 카테고리">
      <SearchBar scope={scope} />
      <CategoryBar filter={filter} onChangeFilter={onChangeFilter} />
    </section>
  )
}
