import { useState } from 'react'

export function SignupComplete({ email }: { email: string }) {
  const [notice, setNotice] = useState('')
  return (
    <section className="signup-complete" aria-labelledby="signup-welcome-title">
      <h3 id="signup-welcome-title">PREEN의 회원이 되신 것을 환영합니다.</h3>
      <p>{email} 계정으로 가입이 완료되었습니다.</p>
      <p className="signup-description">
        로그인 후 나만의 머무름과 음악을 함께 기록해 보세요.
      </p>
      <button
        type="button"
        className="signup-submit signup-verify-submit"
        onClick={() => setNotice('로그인 화면은 준비 중입니다.')}
      >
        로그인하러 가기 →
      </button>
      {notice && (
        <p className="signup-notice" role="status">
          {notice}
        </p>
      )}
    </section>
  )
}
