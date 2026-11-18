import { useSyncExternalStore } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchRecentAccommodations } from '@/features/accommodation/api/accommodationApi'

/**
 * "최근 본 숙소"의 숙소 ID 목록을 브라우저(localStorage)에 보관합니다.
 * 로그인 기능이 아직 없어 서버가 "누가 봤는지" 알 수 없으므로, ID 목록은 브라우저가 기억하고
 * 숙소 정보(이름·가격 등)는 그 ID로 서버에서 받아옵니다.
 */
const STORAGE_KEY = 'preen:recently-viewed'
const MAX_ITEMS = 10

function loadIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((value): value is number => Number.isInteger(value))
      .slice(0, MAX_ITEMS)
  } catch {
    // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 빈 목록으로 시작합니다.
    return []
  }
}

// 화면 여러 곳(숙소 카드, 헤더 패널)이 같은 목록을 보도록 파일 한 곳에서 관리합니다.
let recentIds: number[] = loadIds()
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return recentIds
}

/** 숙소를 "방금 본 숙소"로 기록합니다. 가장 최근에 본 숙소가 맨 앞에 옵니다. */
export function addRecentlyViewed(id: number) {
  recentIds = [id, ...recentIds.filter((value) => value !== id)].slice(
    0,
    MAX_ITEMS,
  )
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentIds))
  } catch {
    // 저장에 실패해도 현재 화면에서는 목록이 유지됩니다.
  }
  listeners.forEach((listener) => listener())
}

/** 최근 본 숙소 ID 목록 (최근에 본 순서) */
export function useRecentlyViewedIds() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

/** 최근 본 숙소의 상세 정보를 서버에서 불러옵니다. */
export function useRecentlyViewedAccommodations() {
  const ids = useRecentlyViewedIds()
  const query = useQuery({
    queryKey: ['accommodations', 'recent', ids],
    queryFn: () => fetchRecentAccommodations(ids),
    enabled: ids.length > 0,
    placeholderData: keepPreviousData,
  })
  return {
    hasRecentIds: ids.length > 0,
    accommodations: ids.length > 0 ? (query.data ?? []) : [],
    status: query.status,
  }
}
