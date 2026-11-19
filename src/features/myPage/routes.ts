
import type { RouteObject } from 'react-router-dom'
import { MyInfoPage } from '@/features/myPage/pages/MyInfoPage'

export const myPageRoutes: RouteObject[] = [
  { path: 'mypage/info', Component: MyInfoPage },
]
