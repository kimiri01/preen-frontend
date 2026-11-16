/**
 * 상단 카테고리 바에 표시할 버튼 8개입니다. (팀에서 고정하기로 한 구성)
 * 버튼 목록이 프론트에 고정되어 있어, 백엔드가 꺼져 있어도 8개 모두 눌립니다.
 *
 * - all      : "전체 숙소". 조건 없이 조회합니다.
 * - category : 숙박 유형. categoryCode는 백엔드 category 테이블의 code와 같아야 합니다.
 *              (백엔드: AccommodationDataInitializer 의 CATEGORIES)
 * - region   : "지역으로 찾기". 누르면 지역 버튼(regionItems.ts)이 아래에 나타납니다.
 */
export type CategoryBarItem =
  | { kind: 'all'; label: string; image: string }
  | { kind: 'category'; label: string; image: string; categoryCode: string }
  | { kind: 'region'; label: string; image: string }

export const categoryBarItems: CategoryBarItem[] = [
  {
    kind: 'all',
    label: '전체 숙소',
    image: '/images/category-signature-1.png',
  },
  {
    kind: 'category',
    label: '모텔',
    image: '/images/category-motel.png',
    categoryCode: 'MOTEL',
  },
  {
    kind: 'category',
    label: '호텔',
    image: '/images/category-signature-2.png',
    categoryCode: 'HOTEL',
  },
  {
    kind: 'category',
    label: '독채',
    image: '/images/category-signature-4.png',
    categoryCode: 'PRIVATE_HOUSE',
  },
  {
    kind: 'category',
    label: '풀빌라',
    image: '/images/category-signature-3.png',
    categoryCode: 'POOL_VILLA',
  },
  {
    kind: 'category',
    label: '감성스테이',
    image: '/images/category-signature-5.png',
    categoryCode: 'EMOTIONAL_STAY',
  },
  {
    kind: 'category',
    label: '게스트하우스',
    image: '/images/category-signature-6.png',
    categoryCode: 'GUESTHOUSE',
  },
  {
    kind: 'region',
    label: '지역으로 찾기',
    image: '/images/category-signature-8.png',
  },
]
