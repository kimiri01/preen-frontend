import type { RouteObject } from 'react-router-dom'
import { RoomListPage } from './pages/RoomListPage'
import { ReviewWritePage } from './pages/ReviewWritePage'
export const roomRoutes: RouteObject[] = [
  {
    path: 'accommodations/:accommodationId/reviews/new',
    Component: ReviewWritePage,
  },
  { path: 'reservations/:reservationId/review', Component: ReviewWritePage },
  { path: 'accommodations/:accommodationId', Component: RoomListPage },
  { path: 'accommodations/:accommodationId/rooms', Component: RoomListPage },
]
