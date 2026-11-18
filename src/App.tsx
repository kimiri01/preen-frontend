
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '@/common/components/Layout'
import {
  CategoryMenuPanel,
  RecentlyViewedPanel,
} from '@/features/accommodation/public'
import { accommodationRoutes } from '@/features/accommodation/public'
import { mainRoutes } from '@/features/mainPage/public'
import { authRoutes } from '@/features/auth/public'
import { SignupVerificationPage } from '@/features/signup/pages/SignupVerificationPage'

const router = createBrowserRouter([
  {
    path: '/',
    // 헤더 메뉴에 펼쳐질 내용은 App에서 조합합니다.
    element: (
      <Layout
        headerMenuPanels={{
          category: <CategoryMenuPanel />,
          recent: <RecentlyViewedPanel />,
        }}
      />
    ),
    children: [
      ...mainRoutes,
      ...accommodationRoutes,
      ...authRoutes,
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
