import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isIsoDate } from '@/common/utils/date'
import type { SearchConditions } from '@/features/accommodation/types'

function toPositiveInt(value: string | null): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

export function parseSearchConditions(
  params: URLSearchParams,
): SearchConditions {
  const keyword = params.get('keyword')?.trim()
  const checkIn = params.get('checkIn')
  const checkOut = params.get('checkOut')
  const view = params.get('view')
  return {
    view: view === 'weekend' || view === 'region' ? view : undefined,
    regionId: toPositiveInt(params.get('regionId')),
    categoryId: toPositiveInt(params.get('categoryId')),
    keyword: keyword || undefined,
    checkIn: isIsoDate(checkIn) ? checkIn : undefined,
    checkOut: isIsoDate(checkOut) ? checkOut : undefined,
    guestCount: toPositiveInt(params.get('guestCount')),
    page: toPositiveInt(params.get('page')) ?? 1,
  }
}

/** 값이 없는 조건은 넣지 않는다. 페이지가 1이면 생략한다. */
export function toSearchParams(
  conditions: Partial<SearchConditions>,
): URLSearchParams {
  const params = new URLSearchParams()
  const entries: [string, string | number | undefined][] = [
    ['view', conditions.view],
    ['regionId', conditions.regionId],
    ['categoryId', conditions.categoryId],
    ['keyword', conditions.keyword?.trim() || undefined],
    ['checkIn', conditions.checkIn],
    ['checkOut', conditions.checkOut],
    ['guestCount', conditions.guestCount],
    [
      'page',
      conditions.page && conditions.page > 1 ? conditions.page : undefined,
    ],
  ]
  for (const [key, value] of entries) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  return params
}

export function accommodationListPath(
  conditions: Partial<SearchConditions> = {},
) {
  const query = toSearchParams(conditions).toString()
  return query ? `/accommodations?${query}` : '/accommodations'
}

/** 목록 → 상세로 갈 때 날짜와 인원을 그대로 넘긴다. */
export function accommodationDetailPath(
  id: number,
  conditions: Partial<SearchConditions> = {},
) {
  const query = toSearchParams({
    checkIn: conditions.checkIn,
    checkOut: conditions.checkOut,
    guestCount: conditions.guestCount,
  }).toString()
  return query ? `/accommodations/${id}?${query}` : `/accommodations/${id}`
}

/** 검색 조건은 URL 쿼리 스트링이 유일한 상태다. 조건을 바꾸면 페이지를 처음으로 되돌린다. */
export function useSearchConditions() {
  const [params, setParams] = useSearchParams()
  const conditions = useMemo(() => parseSearchConditions(params), [params])

  const update = useCallback(
    (patch: Partial<SearchConditions>) => {
      const next = { ...conditions, ...patch }
      if (!('page' in patch)) next.page = 1
      setParams(toSearchParams(next))
    },
    [conditions, setParams],
  )

  return { conditions, update }
}
