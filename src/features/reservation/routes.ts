import type { RouteObject } from 'react-router-dom'
//import { RequireAuth, guarded } from '@/common/auth/guards'
import { MyReservationsPage } from '@/features/reservation/pages/MyReservationsPage'
import { ReservationDetailPage } from '@/features/reservation/pages/ReservationDetailPage'
import { ReservationNewPage } from '@/features/reservation/pages/ReservationNewPage'
import { ReservationSuccessPage } from '@/features/reservation/pages/ReservationSuccessPage'
import { RequireLogin } from '@/features/auth/public'

export const reservationRoutes: RouteObject[] = [
  // {
  //   path: 'reservations/new',
  //   Component: ReservationNewPage,
  // },
  // {
  //   path: 'me/reservations',
  //   Component: guarded(RequireAuth, MyReservationsPage),
  // },
  // {
  //   path: 'me/reservations/:id',
  //   Component: guarded(RequireAuth, ReservationDetailPage),
  // },
{
  // 예약 정책(방향 B): 로그인만 확인하고 호스트·게스트 모두 예약 화면에 들어갈 수 있다.
  // 호스트가 본인 숙소를 예약하는 것만 예약 생성 시점에 서버가 막는다(SELF_RESERVATION_NOT_ALLOWED).
  Component: RequireLogin,
    children:[ {
        path: 'reservations/new',
        Component: ReservationNewPage,
      },
      {
        path: 'reservations/:id/success',
        Component: ReservationSuccessPage,
      },
      {
        path: 'reservations/:id/complete',
        Component: ReservationSuccessPage,
      },
      {
        path: 'me/reservations/:id/success',
        Component: ReservationSuccessPage,
      },
      {
        path: 'me/reservations',
        Component: MyReservationsPage,
      },
      {
        path: 'me/reservations/:id',
        Component: ReservationDetailPage,
      },
    ]
}

]
