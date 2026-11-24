/** 상단 카테고리 바에 표시할 고정 버튼 8개 */
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
