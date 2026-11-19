import { useSearchParams } from 'react-router-dom'
import type { AccommodationFilter } from '@/features/accommodation/types'

/**
 * 조회 조건을 주소(URL)의 물음표 뒤 부분으로 바꿉니다.
 * 예) 호텔 → "?category=HOTEL", 제주도 → "?region=JEJU", 전체 숙소 → ""
 */
export function getFilterSearch(filter: AccommodationFilter): string {
  if (filter.type === 'category') {
    return `?category=${encodeURIComponent(filter.categoryCode)}`
  }
  if (filter.type === 'region') {
    return `?region=${encodeURIComponent(filter.regionCode ?? '')}`
  }
  return ''
}

/** 주소(URL)에 적힌 값을 조회 조건으로 바꿉니다. */
function parseFilter(searchParams: URLSearchParams): AccommodationFilter {
  const categoryCode = searchParams.get('category')
  if (categoryCode) return { type: 'category', categoryCode }

  // "?region=" 처럼 값이 비어 있으면 "지역으로 찾기"만 누르고 지역은 아직 안 고른 상태입니다.
  const regionCode = searchParams.get('region')
  if (regionCode !== null)
    return { type: 'region', regionCode: regionCode || null }

  return { type: 'all' }
}

/**
 * 조회 조건을 주소(URL)에 보관합니다.
 * 주소에 있으므로 새로고침해도 유지되고, 헤더의 "전체 카테고리" 메뉴처럼
 * 다른 위치에서도 링크만으로 조건을 바꿀 수 있습니다.
 */
export function useAccommodationFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = parseFilter(searchParams)

  const setFilter = (nextFilter: AccommodationFilter) => {
    setSearchParams((previous) => {
      // 다른 기능이 쓰는 값은 그대로 두고 category, region만 바꿉니다.
      const next = new URLSearchParams(previous)
      next.delete('category')
      next.delete('region')
      if (nextFilter.type === 'category') {
        next.set('category', nextFilter.categoryCode)
      } else if (nextFilter.type === 'region') {
        next.set('region', nextFilter.regionCode ?? '')
      }
      return next
    })
  }

  return { filter, setFilter }
}
