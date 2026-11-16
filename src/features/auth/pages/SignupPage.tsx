import { useState } from 'react'
import { SignupDetailsForm } from '@/features/auth/components/SignupDetailsForm'
import { SignupComplete } from '@/features/auth/components/SignupComplete'
import { SignupEmailForm } from '@/features/auth/components/SignupEmailForm'
import { SignupVerificationForm } from '@/features/auth/components/SignupVerificationForm'
import { useSignupEmail } from '@/features/auth/hooks/useSignupEmail'
import '@/features/auth/auth.css'

const steps = ['이메일 입력', '인증번호 확인', '가입 정보 입력', '가입 완료']

export function SignupPage() {
  const state = useSignupEmail()
  const [complete, setComplete] = useState(false)
  const activeStep = complete ? 3 : state.verified ? 2 : state.challenge ? 1 : 0
  return (
    <main className="signup-page">
      <h2>{complete ? '회원가입이 완료되었습니다' : '회원가입'}</h2>
      <p className="signup-description">
        PREEN에서 나만의 머무름을 시작하세요.
      </p>
      <ol className="signup-steps" aria-label="회원가입 진행 단계">
        {steps.map((step, index) => (
          <li
            key={step}
            className={index < activeStep ? 'signup-step-complete' : undefined}
            aria-current={index === activeStep ? 'step' : undefined}
          >
            <span className="signup-step-number" aria-hidden="true">
              {index < activeStep ? '✓' : index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {complete ? (
        <SignupComplete email={state.email} />
      ) : state.verified ? (
        <SignupDetailsForm
          email={state.email}
          signupToken={state.proof!.signupToken}
          onComplete={() => setComplete(true)}
        />
      ) : (
        <div className="signup-columns">
          {state.challenge ? (
            <SignupVerificationForm state={state} />
          ) : (
            <SignupEmailForm state={state} />
          )}
          <aside className="signup-guide" aria-labelledby="signup-guide-title">
            <h3 id="signup-guide-title">
              {state.challenge
                ? '인증번호 확인 안내'
                : '안전한 시작, 이메일 인증'}
            </h3>
            <div className="signup-guide-card">
              <h4>
                {state.challenge
                  ? '새 인증번호를 받으면 초기화돼요'
                  : '6자리 인증번호를 보내드려요'}
              </h4>
              <p>
                {state.challenge
                  ? '재발송 성공 시 기존 번호는 무효화되고, 입력 값과 오입력 횟수가 초기화됩니다. 새 번호의 유효 시간은 5분입니다.'
                  : '입력한 이메일로 인증번호를 발송합니다. 인증을 완료해야 가입 정보를 입력할 수 있어요.'}
              </p>
            </div>
            <div className="signup-guide-card">
              <h4>
                {state.challenge
                  ? '인증번호가 오지 않았나요?'
                  : '인증번호는 5분간 유효해요'}
              </h4>
              <p>
                번호를 받지 못했다면 재발송할 수 있습니다. 이메일 주소가
                잘못되었다면 인증 단계에서 변경할 수 있어요.
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
