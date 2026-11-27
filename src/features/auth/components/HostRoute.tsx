import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useLoginSession } from '@/features/auth/hooks/useLoginSession'

/** HOST 역할인 사용자만 하위 라우트를 보여 준다. 아니면 메인으로 보낸다. */
export function HostRoute() {
  const { member, restoring } = useLoginSession()
  const location = useLocation()

  if (restoring) return null
  if (!member) return <Navigate to="/login" replace state={{ from: location }} />
  if (member.role !== 'HOST') return <Navigate to="/" replace />
  return <Outlet />
}