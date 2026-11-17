import { Link } from 'react-router-dom'
import '@/features/accommodation/accommodation.css'
import { categoryBarItems } from '@/features/accommodation/data/categoryBarItems'
import { regionItems } from '@/features/accommodation/data/regionItems'
import {
  getFilterSearch,
  useAccommodationFilter,
} from '@/features/accommodation/hooks/useAccommodationFilter'
import { useCategories } from '@/features/accommodation/hooks/useCategories'
import { useRegions } from '@/features/accommodation/hooks/useRegions'
import type { AccommodationFilter } from '@/features/accommodation/types'

interface MenuItem {
  code: string
  label: string
}

// 서버 목록을 아직 못 받았거나 서버가 꺼져 있을 때 대신 보여 줄 고정 목록입니다.
const fallbackCategories: MenuItem[] = categoryBarItems.flatMap((item) =>
  item.kind === 'category'
    ? [{ code: item.categoryCode, label: item.label }]
    : [],
)
const fallbackRegions: MenuItem[] = regionItems.map((item) => ({
  code: item.regionCode,
  label: item.label,
}))

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
  const { data: serverCategories } = useCategories()
  const { data: serverRegions } = useRegions()

  const categories: MenuItem[] =
    serverCategories?.map((item) => ({ code: item.code, label: item.name })) ??
    fallbackCategories
  const regions: MenuItem[] =
    serverRegions?.map((item) => ({ code: item.code, label: item.name })) ??
    fallbackRegions

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
