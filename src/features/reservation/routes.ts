import type { RouteObject } from 'react-router-dom'
//import { RequireAuth, guarded } from '@/common/auth/guards'
//import { MyReservationsPage } from '@/features/reservation/pages/MyReservationsPage'
//import { ReservationDetailPage } from '@/features/reservation/pages/ReservationDetailPage'
import { ReservationNewPage } from '@/features/reservation/pages/ReservationNewPage'

export const reservationRoutes: RouteObject[] = [
  {
    path: 'reservations/new',
    Component: ReservationNewPage,
  },
  // {
  //   path: 'me/reservations',
  //   Component: guarded(RequireAuth, MyReservationsPage),
  // },
  // {
  //   path: 'me/reservations/:id',
  //   Component: guarded(RequireAuth, ReservationDetailPage),
  // },
]
