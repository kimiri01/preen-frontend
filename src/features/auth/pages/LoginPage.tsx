import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { getErrorMessage } from '@/common/http'
import { authErrorMessages } from '@/features/auth/errorMessages'
import { signIn, useLoginSession } from '@/features/auth/hooks/useLoginSession'
import '@/features/auth/login.css'

export function LoginPage() {
  const { member, restoring } = useLoginSession()
  const navigate = useNavigate()

  //로그인 페이지로 튕긴 사용자를 다시 원래 페이지로 이동시킵니다.
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from
  const redirectTo = from ? from.pathname + from.search : '/'


  const busy = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current || restoring) return
    busy.current = true
    setPending(true)
    setError('')
    try {
      await signIn({ email: email.trim(), password, rememberMe })
      navigate(redirectTo, { replace: true })
    } catch (cause) {
      setError(getErrorMessage(cause, authErrorMessages))
    } finally {
      busy.current = false
      setPending(false)
    }
  }

  if (member) return <Navigate to={redirectTo} replace />

  return (
    <main className="login-page">
      <h2>로그인</h2>
      <p className="login-description">
        로그인하면 예약·찜·내 정보를 한곳에서 관리할 수 있어요.
      </p>
      <form className="login-form" onSubmit={submit} aria-busy={pending}>
        <label>
          이메일
          <input
            type="email"
            name="email"
            autoComplete="username"
            maxLength={254}
            required
            placeholder="preen@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            maxLength={50}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className="login-remember">
          <input
            type="checkbox"
            name="rememberMe"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          로그인 상태 유지
        </label>
        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="login-primary"
          type="submit"
          disabled={pending || restoring || !email.trim() || !password}
        >
          {pending ? '로그인 중…' : '로그인'}
        </button>
        <p className="login-description">
          비밀번호를 잊으셨나요? <Link to="/password-reset/request">비밀번호 재설정</Link>
        </p>
        <p className="login-description">
          아직 회원이 아니신가요? <Link to="/signup">회원가입</Link>
        </p>
      </form>
    </main>
  )
}
