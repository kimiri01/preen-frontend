import type { RouteObject } from 'react-router-dom'
import { SignupPage } from '@/features/auth/pages/SignupPage'

export const authRoutes: RouteObject[] = [
  { path: 'signup', Component: SignupPage },
]
