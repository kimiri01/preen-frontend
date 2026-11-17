import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '@/common/components/Layout'
import {
  CategoryMenuPanel,
  RecentlyViewedPanel,
} from '@/features/accommodation/public'
import { accommodationRoutes } from '@/features/accommodation/public'
import { mainRoutes } from '@/features/mainPage/public'

const router = createBrowserRouter([
  {
    path: '/',
    // 헤더(Common)는 Feature를 직접 import하지 않으므로,
    // 헤더 메뉴에 펼쳐질 내용을 여기(App)에서 조합해 넣어 줍니다.
    element: (
      <Layout
        headerMenuPanels={{
          category: <CategoryMenuPanel />,
          recent: <RecentlyViewedPanel />,
        }}
      />
    ),
    children: [...mainRoutes, ...accommodationRoutes],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
