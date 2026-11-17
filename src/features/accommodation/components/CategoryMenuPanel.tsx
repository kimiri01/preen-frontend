import { Link } from 'react-router-dom'
import '@/features/accommodation/accommodation.css'
import {
  getFilterSearch,
  useAccommodationFilter,
} from '@/features/accommodation/hooks/useAccommodationFilter'
import {
  useCategoryMenuItems,
  useRegionMenuItems,
} from '@/features/accommodation/hooks/useCategoryOptions'
import type { AccommodationFilter } from '@/features/accommodation/types'

/** 메인 페이지에서 해당 조건으로 숙소 목록을 보여 주는 링크 주소 */
function toMainPage(filter: AccommodationFilter) {
  return { pathname: '/', search: getFilterSearch(filter) }
}

/**
 * 헤더의 "전체 카테고리"를 눌렀을 때 펼쳐지는 메뉴입니다.
 * 서버에 등록된 숙박 유형과 지역을 모두 보여 주고, 고르면 메인 페이지 숙소 목록이 그 조건으로 바뀝니다.
 */
export function CategoryMenuPanel() {
  const { filter } = useAccommodationFilter()
  // 서버 목록 중 코드가 있는 항목만 (없으면 고정 목록). 팀원 데이터의 다른 카테고리·지역은 보이지 않습니다.
  const categories = useCategoryMenuItems()
  const regions = useRegionMenuItems()

  return (
    <div className="category-menu">
      <div>
        <strong>숙박 유형</strong>
        <ul>
          <li>
            <Link
              to={toMainPage({ type: 'all' })}
              aria-current={filter.type === 'all' ? 'true' : undefined}
            >
              전체 숙소
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.code}>
              <Link
                to={toMainPage({
                  type: 'category',
                  categoryCode: category.code,
                })}
                aria-current={
                  filter.type === 'category' &&
                  filter.categoryCode === category.code
                    ? 'true'
                    : undefined
                }
              >
                {category.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <strong>지역</strong>
        <ul>
          {regions.map((region) => (
            <li key={region.code}>
              <Link
                to={toMainPage({ type: 'region', regionCode: region.code })}
                aria-current={
                  filter.type === 'region' && filter.regionCode === region.code
                    ? 'true'
                    : undefined
                }
              >
                {region.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
