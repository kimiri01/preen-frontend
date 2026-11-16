/**
 * "지역으로 찾기"에서 고를 수 있는 지역 5개입니다. (팀에서 고정하기로 한 구성)
 * regionCode는 백엔드 region 테이블의 code와 같아야 합니다.
 * (백엔드: AccommodationDataInitializer 의 REGIONS)
 */
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
