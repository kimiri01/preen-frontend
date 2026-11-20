import { useRegions } from '@/features/accommodation/hooks/useRegions'
import { regionLabel } from '@/features/accommodation/regionUtils'

/**
 * [kny] 숙소의 지역을 화면용 이름(예: 제주도)으로 바꾸는 함수를 돌려줍니다.
 * 숙소 응답의 regionId로 지역 목록(GET /api/regions, 이미 캐시됨)에서 지역을 찾고,
 * 그 지역의 고정 코드 기준 이름(regionLabel)을 씁니다.
 * ID가 없거나(예시 데이터), 지역 목록을 아직 못 받았거나, 고정 목록에 없는 지역이면
 * 받은 이름(fallbackName)을 그대로 씁니다.
 */
export function useRegionLabel() {
  const { data: regions } = useRegions()
  return (
    regionId: number | null | undefined,
    fallbackName: string | null | undefined,
  ): string => {
    const region =
      regionId != null
        ? regions?.find((item) => item.id === regionId)
        : undefined
    return region ? regionLabel(region) : (fallbackName ?? '')
  }
}
