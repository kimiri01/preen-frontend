
import { useState } from 'react'
import { http } from '@/common/api/http'

export function SignupVerificationPage() {
  const [birthday, setBirthday] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  const [sentEmail, setSentEmail] = useState('')
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 이메일 또는 생년월일을 수정하면 인증 상태 초기화
  const handleEmailChange = (value: string) => {
    setEmail(value)
    setSentEmail('')
    setVerified(false)
    setCode('')
    setMessage('')
  }

  const handleBirthdayChange = (value: string) => {
  setBirthday(value)
}

  // 인증번호 발송
  const handleSendEmail = async () => {
    if (!birthday) {
      setMessage('생년월일을 입력해 주세요.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage('올바른 이메일 주소를 입력해 주세요.')
      return
    }

    setLoading(true)
    setMessage('')
    setVerified(false)
    setSentEmail('')
    setCode('')

    try {
      await http.post<string>('/api/email/send', {
        email: email.trim(),
      })

      setSentEmail(email.trim())
      setMessage('인증번호가 이메일로 발송되었습니다.')
    } catch (error) {
      console.error('인증번호 발송 오류:', error)
      setMessage('인증번호 발송에 실패했습니다. 서버를 확인해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  // 인증번호 확인
  const handleVerifyEmail = async () => {
    if (!sentEmail) {
      setMessage('먼저 인증번호를 발송해 주세요.')
      return
    }

    if (!/^\d{6}$/.test(code)) {
      setMessage('6자리 인증번호를 입력해 주세요.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      await http.post<string>('/api/email/verify', {
        email: sentEmail,
        code,
      })

      setVerified(true)
      setMessage('이메일 인증이 완료되었습니다!')
    } catch (error) {
      console.error('이메일 인증 오류:', error)
      setVerified(false)
      setMessage('인증번호가 올바르지 않거나 만료되었습니다.')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = birthday !== '' && verified

  return (
    <main style={{ maxWidth: 480, margin: '60px auto', padding: 24 }}>
      <h1>회원가입</h1>
      <p>생년월일과 이메일을 인증해 주세요.</p>

      <div style={{ marginTop: 24 }}>
        <label htmlFor="birthday">생년월일</label>
        <input
          id="birthday"
          type="date"
          max={new Date().toLocaleDateString('en-CA')}
          value={birthday}
          onChange={(e) => handleBirthdayChange(e.target.value)}
          style={{ display: 'block', width: '100%', padding: 12 }}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <label htmlFor="email">이메일</label>``
        <input
          id="email"
          type="email"
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          style={{ display: 'block', width: '100%', padding: 12 }}
        />

        <button
          type="button"
          onClick={handleSendEmail}
          disabled={loading}
          style={{ marginTop: 8, padding: 12 }}
        >
          {loading ? '처리 중...' : '인증번호 발송'}
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <label htmlFor="code">이메일 인증번호</label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="6자리 인증번호"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, ''))
            setVerified(false)
          }}
          disabled={!sentEmail || loading}
          style={{ display: 'block', width: '100%', padding: 12 }}
        />

        <button
          type="button"
          onClick={handleVerifyEmail}
          disabled={!sentEmail || loading || verified}
          style={{ marginTop: 8, padding: 12 }}
        >
          인증 확인
        </button>
      </div>

      {message && (
        <p role="status" style={{ marginTop: 20 }}>
          {message}
        </p>
      )}

      <button
        type="button"
        disabled={!canProceed || loading}
        style={{ marginTop: 32, padding: 12 }}
      >
        다음 단계
      </button>
    </main>
  )
}
