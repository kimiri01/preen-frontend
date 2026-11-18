import type { useSignupEmail } from '@/features/auth/hooks/useSignupEmail'

export function SignupEmailForm({
  state,
}: {
  state: ReturnType<typeof useSignupEmail>
}) {
  const {
    email,
    error,
    notice,
    pending,
    sending,
    resendRemaining,
    changeEmail,
    submitEmail,
  } = state

  return (
    <form className="signup-email-form" noValidate onSubmit={submitEmail}>
      <h3>이메일을 입력해 주세요</h3>
      <div className="signup-field">
        <label htmlFor="signup-email">이메일</label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="이메일 주소"
          required
          maxLength={254}
          disabled={pending}
          value={email}
          onChange={(event) => changeEmail(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'signup-email-error' : undefined}
        />
      </div>
      <button
        className="signup-submit"
        type="submit"
        disabled={!email.trim() || pending || resendRemaining > 0}
      >
        {sending
          ? '발송 중…'
          : resendRemaining > 0
            ? `인증번호 받기 (${resendRemaining}초 후)`
            : '인증번호 받기'}
      </button>
      {error && (
        <p id="signup-email-error" className="signup-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="signup-notice" role="status">
          {notice}
        </p>
      )}
    </form>
  )
}
