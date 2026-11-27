import { useMutation } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '@/common/http'
import { authErrorMessages } from '@/features/auth/errorMessages'
import { requestPasswordReset } from '@/features/auth/api/passwordReset'
import '@/features/auth/login.css'

export function PasswordResetRequestPage() {
  const request = useMutation({ mutationFn: requestPasswordReset, retry: false })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (request.isPending) return

    const email = new FormData(event.currentTarget).get('email')
    if (typeof email === 'string' && email.trim()) {
      request.mutate(email.trim())
    }
  }

  return (
    <main className="login-page">
      <h2>비밀번호 재설정</h2>
      <p className="login-description">가입한 이메일로 재설정 링크를 보내드려요.</p>

      <form className="login-form" onSubmit={submit}>
        <label>
          이메일
          <input
            type="email"
            name="email"
            autoComplete="email"
            maxLength={254}
            required
            placeholder="preen@example.com"
          />
        </label>
        <button className="login-primary" type="submit" disabled={request.isPending}>
          {request.isPending ? '보내는 중…' : '재설정 링크 보내기'}
        </button>
        {request.isSuccess && (
          <p className="login-description" role="status">
            가입된 이메일이라면 재설정 링크를 보내드렸어요. 받은편지함을 확인해 주세요.
          </p>
        )}
        {request.isError && (
          <p className="login-error" role="alert">
            {getErrorMessage(request.error, authErrorMessages)}
          </p>
        )}
        <p className="login-description">
          <Link to="/login">로그인으로 돌아가기</Link>
        </p>
      </form>
    </main>
  )
}
