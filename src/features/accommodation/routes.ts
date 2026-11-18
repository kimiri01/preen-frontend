import type { RouteObject } from 'react-router-dom'
import { AccommodationDetailPage } from '@/features/accommodation/pages/AccommodationDetailPage'
import { AccommodationListPage } from '@/features/accommodation/pages/AccommodationListPage'

/** 숙소 검색 목록. 조건은 URL 쿼리 스트링(?categoryId=&regionId=&keyword=…)으로 받는다. */
export const accommodationRoutes: RouteObject[] = [
  { path: 'accommodations', Component: AccommodationListPage },
  // [kny] 숙소 상세. accommodationDetailPath(id)가 만드는 주소와 같다.
  {
    path: 'accommodations/:accommodationId',
    Component: AccommodationDetailPage,
  },
]
