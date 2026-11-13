import type { Accommodation } from '@/features/accommodation/types'

// 기존 시안의 예시 데이터입니다. 실제 서버 연결 시 조회 Hook으로 교체합니다.
export const accommodations: Accommodation[] = [
  {
    id: 1,
    name: '온유 스테이 제주',
    location: '제주 애월',
    pricePerNight: 180000,
    image: '/images/generated.png',
  },
  {
    id: 2,
    name: '시온 오션 호텔',
    location: '강릉 안목',
    pricePerNight: 145000,
    image: '/images/generated-1.png',
  },
  {
    id: 3,
    name: '서가 한옥',
    location: '경주 황남',
    pricePerNight: 165000,
    image: '/images/generated-2.png',
  },
  {
    id: 4,
    name: '양평 리버호텔',
    location: '경기 양평',
    pricePerNight: 128000,
    image: '/images/generated-3.png',
  },
]
