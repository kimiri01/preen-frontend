import { useSignupDetails } from '@/features/auth/hooks/useSignupDetails'

import { signupTerms } from '@/features/auth/data/signupTerms'

export function SignupDetailsForm({
  email,
  signupToken,
  onComplete,
}: {
  email: string
  signupToken: string
  onComplete: () => void
}) {
  const form = useSignupDetails(email, signupToken, onComplete)
  return (
    <form className="signup-columns signup-details-form" onSubmit={form.submit}>
      <fieldset
        className="signup-email-form signup-details-fields"
        disabled={form.pending}
      >
        <div className="signup-field">
          <label htmlFor="details-email">인증된 이메일 · 읽기 전용</label>
          <div className="signup-verified-email">
            <input id="details-email" value={email} readOnly />
            <span>인증 완료</span>
          </div>
        </div>
        <div className="signup-field">
          <label htmlFor="signup-name">이름</label>
          <input
            id="signup-name"
            autoComplete="name"
            placeholder="이름을 입력해 주세요"
            required
            maxLength={100}
            value={form.name}
            onChange={(e) => form.setName(e.target.value)}
          />
        </div>
        <div className="signup-field">
          <label htmlFor="signup-birth">생년월일</label>
          <input
            id="signup-birth"
            type="date"
            autoComplete="bday"
            required
            aria-invalid={Boolean(form.birthDate) && !form.birthValid}
            aria-describedby="signup-birth-help"
            value={form.birthDate}
            onChange={(e) => form.setBirthDate(e.target.value)}
          />
          <p
            id="signup-birth-help"
            className={
              form.birthDate && !form.birthValid
                ? 'signup-error'
                : 'signup-notice'
            }
          >
            만 14세 이상부터 가입할 수 있습니다.
          </p>
        </div>
        <div className="signup-field">
          <label htmlFor="signup-password">비밀번호</label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={50}
            value={form.password}
            onChange={(e) => form.setPassword(e.target.value)}
            aria-describedby="signup-password-help"
          />
          <p
            id="signup-password-help"
            className={
              form.password && !form.passwordValid
                ? 'signup-error'
                : 'signup-notice'
            }
          >
            영문·숫자·특수문자를 각각 포함하여 공백 없이 8~50자로 입력해 주세요.
          </p>
        </div>
        <div className="signup-field">
          <label htmlFor="signup-password-confirm">비밀번호 확인</label>
          <input
            id="signup-password-confirm"
            type="password"
            autoComplete="new-password"
            required
            maxLength={50}
            value={form.confirmation}
            onChange={(e) => form.setConfirmation(e.target.value)}
            aria-invalid={form.mismatch}
            aria-describedby={
              form.mismatch ? 'signup-password-mismatch' : undefined
            }
          />
          {form.mismatch && (
            <p
              id="signup-password-mismatch"
              className="signup-error"
              role="alert"
            >
              비밀번호가 일치하지 않습니다.
            </p>
          )}
        </div>
      </fieldset>
      <section className="signup-guide" aria-labelledby="signup-terms-title">
        <h3 id="signup-terms-title">약관 동의</h3>
        <label className="signup-agreement signup-agree-all">
          <input
            type="checkbox"
            disabled={form.pending}
            checked={form.agreements.every(Boolean)}
            onChange={form.toggleAll}
          />
          전체 동의
        </label>
        {signupTerms.map((term, index) => (
          <div key={term.type}>
            <label className="signup-agreement">
              <input
                type="checkbox"
                disabled={form.pending}
                required={term.required}
                checked={form.agreements[index]}
                onChange={() => form.toggleAgreement(index)}
              />
              [{term.required ? '필수' : '선택'}] {term.title} 동의
            </label>
            <details className="signup-terms-document">
              <summary>{term.title} 내용 보기</summary>
              <div className="signup-terms-content">{term.content}</div>
            </details>
          </div>
        ))}
        <p className="signup-notice">
          현재 약관은 초안입니다. 운영 정보와 정책 확정 후 최종본으로
          변경됩니다. 마케팅 수신은 선택이며 동의하지 않아도 가입할 수 있습니다.
        </p>
        {form.error && (
          <p className="signup-error" role="alert">
            {form.error}
          </p>
        )}
        <button
          type="submit"
          className="signup-submit signup-verify-submit"
          disabled={!form.valid || form.pending}
        >
          {form.pending ? '저장 중…' : '회원가입 완료'}
        </button>
        <div className="signup-guide-card">
          <h4>인증 완료 · 필수 정보 확인</h4>
          <p>이름·생년월일·비밀번호·확인·필수 약관을 모두 입력해 주세요.</p>
        </div>
      </section>
    </form>
  )
}
