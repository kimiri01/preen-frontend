import { regionItems } from '@/features/accommodation/data/regionItems'
import type { Region } from '@/features/accommodation/types'

export interface RegionOption {
  id: number
  label: string
}

/**
 * 시·도 아래에 시·군·구를 이어 붙인 선택지. 예: "강원도", "강원도 강릉시"
 * [kny] 시·도 이름은 카테고리 바와 같은 이름(regionLabel)으로 보여 준다.
 */
export function regionOptions(regions: Region[] = []): RegionOption[] {
  const options: RegionOption[] = []
  for (const parent of regions.filter((region) => !region.parentId)) {
    const parentLabel = regionLabel(parent)
    options.push({ id: parent.id, label: parentLabel })
    for (const child of regions) {
      if (child.parentId === parent.id) {
        options.push({ id: child.id, label: `${parentLabel} ${child.name}` })
      }
    }
  }
  return options
}

/** "제주", "강릉" 같은 짧은 이름으로 지역을 찾는다. 시·군·구를 먼저 본다. */
export function findRegionByLabel(regions: Region[] = [], label: string) {
  const sorted = [...regions].sort((a, b) => b.level - a.level)
  return sorted.find(
    (region) => region.name === label || region.name.startsWith(label),
  )
}

/**
 * [kny] 화면에 보여 줄 지역 이름.
 * 카테고리 바 지역 버튼과 같은 이름(예: 강원도, 제주도)을 고정 코드로 찾아 쓰고,
 * 고정 목록에 없는 지역은 서버 이름을 그대로 쓴다. (DB 이름은 바꾸지 않음)
 */
export function regionLabel(region: Pick<Region, 'code' | 'name'>): string {
  return (
    regionItems.find((item) => item.regionCode === region.code)?.label ??
    region.name
  )
}
