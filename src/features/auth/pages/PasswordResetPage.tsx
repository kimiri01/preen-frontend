import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getApiError } from '@/common/api/getApiError'
import { confirmPasswordReset } from '@/features/auth/api/passwordReset'
import '@/features/auth/login.css'

export function PasswordResetPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const change = useMutation({
    mutationFn: (password: string) =>
      confirmPasswordReset(token ?? '', password),
    retry: false,
    onSuccess: () => navigate('/login', { replace: true }),
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token || change.isPending || change.isSuccess) return

    const form = event.currentTarget
    const fields = new FormData(form)
    const password = fields.get('newPassword')
    if (typeof password !== 'string') return

    if (password !== fields.get('confirmPassword')) {
      change.reset()
      setPasswordMismatch(true)
      return
    }

    setPasswordMismatch(false)
    change.mutate(password)
  }

  return (
    <main className="login-page">
      <h2>비밀번호 재설정</h2>
      <p className="login-description">
        이메일로 받은 링크에서 새 비밀번호를 설정하세요.
      </p>

      <form className="login-form" onSubmit={submit}>
        <label>
          새 비밀번호
          <input
            type="password"
            name="newPassword"
            autoComplete="new-password"
            required
          />
        </label>
        <label>
          새 비밀번호 확인
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
          />
        </label>
        <button
          className="login-primary"
          type="submit"
          disabled={!token || change.isPending || change.isSuccess}
        >
          {change.isPending ? '변경 중…' : '비밀번호 재설정'}
        </button>
        {!token && (
          <p className="login-error" role="alert">
            이메일로 받은 재설정 링크를 열어 주세요.
          </p>
        )}
        {passwordMismatch && (
          <p className="login-error" role="alert">
            새 비밀번호와 비밀번호 확인이 일치하지 않아요.
          </p>
        )}
        {change.isError && (
          <p className="login-error" role="alert">
            {getApiError(change.error).message}
          </p>
        )}
        <p className="login-description">
          <Link to="/login">로그인으로 돌아가기</Link>
        </p>
      </form>
    </main>
  )
}
