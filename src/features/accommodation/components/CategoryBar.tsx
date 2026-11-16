import '@/features/accommodation/accommodation.css'
import { categoryBarItems } from '@/features/accommodation/data/categoryBarItems'
import { regionItems } from '@/features/accommodation/data/regionItems'
import type { AccommodationFilter } from '@/features/accommodation/types'

interface CategoryBarProps {
  /** 현재 선택된 조회 조건 */
  filter: AccommodationFilter
  onChangeFilter: (filter: AccommodationFilter) => void
}

export function CategoryBar({ filter, onChangeFilter }: CategoryBarProps) {
  return (
    <>
      <nav className="categories" aria-label="숙박 유형">
        {categoryBarItems.map((item) => {
          // 버튼 종류에 따라 "선택됨 여부"와 "눌렀을 때 바뀔 조건"이 다릅니다.
          let isSelected: boolean
          let nextFilter: AccommodationFilter
          if (item.kind === 'all') {
            isSelected = filter.type === 'all'
            nextFilter = { type: 'all' }
          } else if (item.kind === 'category') {
            isSelected =
              filter.type === 'category' &&
              filter.categoryCode === item.categoryCode
            nextFilter = { type: 'category', categoryCode: item.categoryCode }
          } else {
            isSelected = filter.type === 'region'
            // 이미 지역을 고른 상태에서 다시 눌러도 고른 지역은 유지합니다.
            nextFilter =
              filter.type === 'region'
                ? filter
                : { type: 'region', regionCode: null }
          }

          return (
            <button
              type="button"
              key={item.label}
              aria-pressed={isSelected}
              onClick={() => onChangeFilter(nextFilter)}
            >
              <span className="category-image">
                <img src={item.image} alt="" />
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {filter.type === 'region' && (
        <div className="region-filter" role="group" aria-label="지역 선택">
          {regionItems.map((region) => (
            <button
              type="button"
              key={region.regionCode}
              aria-pressed={filter.regionCode === region.regionCode}
              onClick={() =>
                onChangeFilter({
                  type: 'region',
                  regionCode: region.regionCode,
                })
              }
            >
              {region.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
