import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { getApiError } from '@/common/api/getApiError'
import { signOut, useLoginSession } from '@/features/auth/hooks/useLoginSession'
import '@/features/auth/login.css'

export function LogoutPage() {
  const { member, restoring } = useLoginSession()
  const navigate = useNavigate()
  const busy = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function confirmLogout() {
    if (busy.current) return
    busy.current = true
    setPending(true)
    setError('')
    try {
      await signOut()
      navigate('/', { replace: true })
    } catch (cause) {
      setError(getApiError(cause).message)
    } finally {
      busy.current = false
      setPending(false)
    }
  }

  if (restoring)
    return (
      <main className="login-page">
        <p role="status">로그인 상태 확인 중…</p>
      </main>
    )
  if (!member) return <Navigate to="/" replace />

  return (
    <main className="login-page">
      <h2>로그아웃</h2>
      <p className="login-description">
        로그아웃하시겠어요? 다시 로그인하면 예약 내역을 확인할 수 있어요.
      </p>
      {error && (
        <p className="login-error" role="alert">
          {error}
        </p>
      )}
      <div className="logout-actions">
        <Link to="/">계속 이용하기</Link>
        <button
          type="button"
          className="login-primary"
          onClick={confirmLogout}
          disabled={pending}
        >
          {pending ? '로그아웃 중…' : '로그아웃'}
        </button>
      </div>
      <p className="login-description">로그아웃하면 홈페이지로 이동합니다.</p>
    </main>
  )
}
