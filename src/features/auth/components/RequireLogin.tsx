import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useLoginSession } from '@/features/auth/hooks/useLoginSession'

/** 로그인한 사용자만 하위 라우트를 보여 준다. */
export function RequireLogin() {
  const { member, restoring } = useLoginSession()
  const location = useLocation()

  if (restoring) return null // 새로고침 직후 로그인 복원 중
  if (!member) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}