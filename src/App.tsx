import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '@/common/components/Layout'
import { mainRoutes } from '@/features/mainPage/public'

const router = createBrowserRouter([
  { path: '/', Component: Layout, children: mainRoutes },
])

export function App() {
  return <RouterProvider router={router} />
}
