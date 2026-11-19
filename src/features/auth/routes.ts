import type { RouteObject } from 'react-router-dom'
import { SignupPage } from '@/features/auth/pages/SignupPage'

import { LoginPage } from '@/features/auth/pages/LoginPage'
import { LogoutPage } from '@/features/auth/pages/LogoutPage'

export const authRoutes: RouteObject[] = [
  { path: 'signup', Component: SignupPage },
  { path: 'login', Component: LoginPage },
  { path: 'logout', Component: LogoutPage },
]
