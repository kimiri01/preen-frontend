import { useSearchParams } from 'react-router-dom'
import type { AccommodationFilter } from '@/features/accommodation/types'

/** 조회 조건을 URL 쿼리 문자열로 바꿉니다. */
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

  const regionCode = searchParams.get('region')
  if (regionCode !== null)
    return { type: 'region', regionCode: regionCode || null }

  return { type: 'all' }
}

/** 조회 조건을 URL에 보관하고 읽고 바꿉니다. */
export function useAccommodationFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = parseFilter(searchParams)

  const setFilter = (nextFilter: AccommodationFilter) => {
    setSearchParams((previous) => {
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
