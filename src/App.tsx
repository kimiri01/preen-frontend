import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '@/common/components/Layout'
import { accommodationRoutes } from '@/features/accommodation/public'
import { mainRoutes } from '@/features/mainPage/public'

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [...mainRoutes, ...accommodationRoutes],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
