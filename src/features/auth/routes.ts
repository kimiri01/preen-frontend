import type { RouteObject } from 'react-router-dom'
import { SignupPage } from '@/features/auth/pages/SignupPage'

import { LoginPage } from '@/features/auth/pages/LoginPage'
import { LogoutPage } from '@/features/auth/pages/LogoutPage'
import { PasswordResetPage } from '@/features/auth/pages/PasswordResetPage'
import { PasswordResetRequestPage } from '@/features/auth/pages/PasswordResetRequestPage'

export const authRoutes: RouteObject[] = [
  { path: 'signup', Component: SignupPage },
  { path: 'login', Component: LoginPage },
  { path: 'logout', Component: LogoutPage },
  { path: 'password-reset/request', Component: PasswordResetRequestPage },
  { path: 'password-reset', Component: PasswordResetPage },
]
