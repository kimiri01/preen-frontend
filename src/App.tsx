import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '@/common/components/Layout'
import { NotFoundView, RouteError } from '@/common/components/Screens'
import {
  CategoryMenuPanel,
  RecentlyViewedPanel,
} from '@/features/accommodation/public'
import { accommodationRoutes } from '@/features/accommodation/public'
import { mainRoutes } from '@/features/mainPage/public'

import {
  authRoutes,
  restoreLogin,
  useLoginSession,
} from '@/features/auth/public'

function AppLayout() {
  const { member, restoring, notice } = useLoginSession()

  return (
    <Layout
      headerMenuPanels={{
        category: <CategoryMenuPanel />,
        recent: <RecentlyViewedPanel />,
      }}
      memberName={member?.name ?? null}
      restoring={restoring}
      notice={notice}
    />
  )
}

import { reservationRoutes } from './features/reservation/routes'


const router = createBrowserRouter([
  {
    path: '/',

    Component: AppLayout,
    // 헤더(Layout) 자체에서 난 에러, 아래 묶음에서 못 잡은 에러
    ErrorBoundary: RouteError,
    children: [
      {
        // 페이지 렌더링 에러: 헤더는 남기고 본문만 RouteError로 바꾼다
        ErrorBoundary: RouteError,
        children: [
          ...mainRoutes,
          ...accommodationRoutes,
          ...authRoutes,
          ...reservationRoutes,
          // 없는 주소: 헤더를 남긴 채 404 화면 (없으면 최상위 RouteError가 받아 헤더가 사라짐)
          { path: '*', Component: NotFoundView },
        ],
      },
    ],
  },
])

export function App() {
  useEffect(() => {
    void restoreLogin()
  }, [])

  return <RouterProvider router={router} />
}
