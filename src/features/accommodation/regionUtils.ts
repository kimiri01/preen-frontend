import type { Region } from '@/features/accommodation/types'

export interface RegionOption {
  id: number
  label: string
}

/** 시·도 아래에 시·군·구를 이어 붙인 선택지. 예: "강원", "강원 강릉시" */
export function regionOptions(regions: Region[] = []): RegionOption[] {
  const options: RegionOption[] = []
  for (const parent of regions.filter((region) => !region.parentId)) {
    options.push({ id: parent.id, label: parent.name })
    for (const child of regions) {
      if (child.parentId === parent.id) {
        options.push({ id: child.id, label: `${parent.name} ${child.name}` })
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
