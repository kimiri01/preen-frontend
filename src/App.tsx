import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '@/common/components/Layout'
import { accommodationRoutes } from '@/features/accommodation/public'
import { mainRoutes } from '@/features/mainPage/public'
import { reservationRoutes } from './features/reservation/routes'

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      ...mainRoutes,
      ...accommodationRoutes,
      ...reservationRoutes,
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
