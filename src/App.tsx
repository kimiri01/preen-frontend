
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '@/common/components/Layout'
import { mainRoutes } from '@/features/mainPage/public'
import { SignupVerificationPage } from '@/features/signup/pages/SignupVerificationPage'

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      ...mainRoutes,
      {
        path: 'signup/verification',
        Component: SignupVerificationPage,
      },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
