import { categoryBarItems } from '@/features/accommodation/data/categoryBarItems'
import { regionItems } from '@/features/accommodation/data/regionItems'
import { useCategories } from '@/features/accommodation/hooks/useCategories'
import { useRegions } from '@/features/accommodation/hooks/useRegions'

/** 헤더 "전체 카테고리" 메뉴의 항목 하나 */
export interface MenuItem {
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

/** 코드 → 화면 이름. 서버 이름(예: 강원)보다 카테고리 바와 같은 이름(예: 강원도)을 우선 씁니다. */
const fixedLabels = new Map(
  [...fallbackCategories, ...fallbackRegions].map((item) => [item.code, item.label]),
)

/** "전체 카테고리" 메뉴의 숙박 유형 목록 (서버가 꺼져 있으면 고정 목록) */
export function useCategoryMenuItems(): MenuItem[] {
  const { data } = useCategories()
  return toMenuItems(data, fallbackCategories)
}

/** "전체 카테고리" 메뉴의 지역 목록. 동작 방식은 useCategoryMenuItems와 같습니다. */
export function useRegionMenuItems(): MenuItem[] {
  const { data } = useRegions()
  return toMenuItems(data, fallbackRegions)
}

function toMenuItems(
  serverItems: { code: string | null; name: string }[] | undefined,
  fallback: MenuItem[],
): MenuItem[] {
  const items =
    serverItems?.flatMap((item) =>
      item.code
        ? [{ code: item.code, label: fixedLabels.get(item.code) ?? item.name }]
        : [],
    ) ?? []
  return items.length > 0 ? items : fallback
}
