import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { HostLayout } from '@/features/host/components/HostLayout'
import { RouteError } from '@/features/reservation/public'
import { HostDashboardPage } from './pages/HostDashBoardPage'
import { HostAccommodationsPage } from './pages/HostAccommodationsPage'
import { HostRoomsPage } from './pages/HostRoomsPage'
import { HostRatesInventoryPage } from './pages/HostRatesInventoryPage'
import { HostReservationsPage } from './pages/HostReservationsPage'
import { HostSettlementPage } from './pages/HostSettlementPage'
import { HostInquiriesPage } from './pages/HostInquiriesPage'
import { HostCouponsPage } from './pages/HostCouponsPage'

export const hostRoute: RouteObject = {
  path: 'host',
  Component: HostLayout,
  ErrorBoundary: RouteError,
  children: [
    {
      index: true,
      element: <Navigate to="dashboard" replace />,
    },
    {
      path: 'dashboard',
      Component: HostDashboardPage,
    },
    {
      path: 'accommodations',
      Component: HostAccommodationsPage,
    },
    {
      path: 'rooms',
      Component: HostRoomsPage,
    },
    {
      path: 'rates',
      Component: HostRatesInventoryPage,
    },
    {
      path: 'reservations',
      Component: HostReservationsPage,
    },
    {
      path: 'settlement',
      Component: HostSettlementPage,
    },
    {
      path: 'inquiries',
      Component: HostInquiriesPage,
    },
    {
      path: 'coupons',
      Component: HostCouponsPage,
    },
  ],
}
