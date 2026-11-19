import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '@/common/components/Layout'
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

const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    children: [...mainRoutes, ...accommodationRoutes, ...authRoutes],
  },
])

export function App() {
  useEffect(() => {
    void restoreLogin()
  }, [])

  return <RouterProvider router={router} />
}
