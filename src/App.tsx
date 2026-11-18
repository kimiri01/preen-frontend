
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '@/common/components/Layout'
import { mainRoutes } from '@/features/mainPage/public'
import { PaymentWaitingPage } from '@/features/payment/pages/PaymentWaitingPage'

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      ...mainRoutes,
      {
        path: 'payment/waiting',
        Component: PaymentWaitingPage,
      },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
