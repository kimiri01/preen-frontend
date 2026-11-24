/** "지역으로 찾기"에서 고를 수 있는 고정 지역 5개 */
export interface RegionItem {
  label: string
  regionCode: string
}

export const regionItems: RegionItem[] = [
  { label: '서울', regionCode: 'SEOUL' },
  { label: '강원도', regionCode: 'GANGWON' },
  { label: '대구', regionCode: 'DAEGU' },
  { label: '광주', regionCode: 'GWANGJU' },
  { label: '제주도', regionCode: 'JEJU' },
]
