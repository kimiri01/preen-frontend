import type { useSignupEmail } from '@/features/auth/hooks/useSignupEmail'

export function SignupVerificationForm({
  state,
}: {
  state: ReturnType<typeof useSignupEmail>
}) {
  const {
    email,
    code,
    error,
    notice,
    pending,
    sending,
    verified,
    proofExpired,
    remaining,
    resendRemaining,
    blocked,
    changeCode,
    submitCode,
    sendCode,
    changeAddress,
  } = state
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0')
  const seconds = String(remaining % 60).padStart(2, '0')
  const expired = remaining === 0 && !verified

  if (verified) {
    return (
      <section
        className="signup-email-form"
        aria-labelledby="verification-success-title"
      >
        <h3 id="verification-success-title">이메일 인증 완료</h3>
        <p>{email}</p>
        <p className="signup-success" role="status">
          이메일 인증이 완료되었습니다.
        </p>
      </section>
    )
  }

  return (
    <form className="signup-email-form" noValidate onSubmit={submitCode}>
      <h3>인증번호를 확인해 주세요</h3>
      <div className="signup-field">
        <label htmlFor="verification-email">이메일</label>
        <input id="verification-email" type="email" value={email} readOnly />
      </div>
      <div className="signup-field">
        <div className="signup-code-label">
          <label htmlFor="signup-code">인증번호</label>
          <span
            className="signup-timer"
            aria-label={`남은 시간 ${minutes}분 ${seconds}초`}
          >
            인증 남은 시간 {minutes}:{seconds}
          </span>
        </div>
        <input
          id="signup-code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          placeholder="6자리 인증번호"
          maxLength={6}
          value={code}
          onChange={(event) => changeCode(event.target.value)}
          disabled={pending || expired || blocked}
          aria-invalid={Boolean(error)}
          aria-describedby="signup-code-help signup-code-feedback"
        />
      </div>
      <button
        className="signup-submit signup-verify-submit"
        type="submit"
        disabled={pending || code.length !== 6 || expired || blocked}
      >
        {pending && !sending ? '인증 확인 중…' : '인증 확인'}
      </button>
      <div className="signup-verification-actions">
        <button
          type="button"
          disabled={pending || resendRemaining > 0}
          onClick={() => void sendCode()}
        >
          {sending
            ? '발송 중…'
            : resendRemaining > 0
              ? `인증번호 재발송 (${resendRemaining}초 후)`
              : '인증번호 재발송'}
        </button>
        <button type="button" disabled={pending} onClick={changeAddress}>
          이메일 변경
        </button>
      </div>
      <p id="signup-code-help" className="signup-notice">
        인증번호는 발급 후 5분간 유효합니다. 재발송은 60초 후 가능합니다.
      </p>
      <div id="signup-code-feedback">
        {(error || expired || proofExpired) && (
          <p className="signup-error signup-verification-error" role="alert">
            {error ||
              (proofExpired
                ? '이메일 인증이 만료되었습니다. 인증번호를 재발송해 주세요.'
                : '인증번호의 유효 시간이 만료되었습니다. 인증번호를 재발송해 주세요.')}
          </p>
        )}
        {notice && !expired && !proofExpired && (
          <p className="signup-notice" role="status">
            {notice}
          </p>
        )}
      </div>
    </form>
  )
}
