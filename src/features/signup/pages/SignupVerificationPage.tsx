
import { useEffect, useState } from 'react'
import { http } from '@/common/api/http'

const VERIFICATION_DURATION = 5 * 60 * 1000

export function SignupVerificationPage() {
  const [birthday, setBirthday] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  const [sentEmail, setSentEmail] = useState('')
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 인증번호 만료 시각과 남은 시간
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  // 오늘 날짜
  const today = new Date()
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  // 생년월일 검증
  const isValidBirthday = (() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      return false
    }

    const [year, month, day] = birthday.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    return (
      year >= 1900 &&
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day &&
      birthday <= todayString
    )
  })()

  // 인증번호 남은 시간 계산
  useEffect(() => {
    if (expiresAt === null || verified) return

    const updateTimer = () => {
      const seconds = Math.max(
        0,
        Math.ceil((expiresAt - Date.now()) / 1000)
      )

      setRemainingSeconds(seconds)
    }

    updateTimer()

    const interval = window.setInterval(updateTimer, 1000)

    return () => window.clearInterval(interval)
  }, [expiresAt, verified])

  const isExpired =
    expiresAt !== null && remainingSeconds <= 0

  const canProceed = isValidBirthday && verified

  // 남은 시간 MM:SS 형식
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // 이메일 변경 시 인증 초기화
  const handleEmailChange = (value: string) => {
    setEmail(value)
    setSentEmail('')
    setVerified(false)
    setCode('')
    setMessage('')
    setExpiresAt(null)
    setRemainingSeconds(0)
  }

  // 생년월일 변경
  const handleBirthdayChange = (value: string) => {
    setBirthday(value)
    setMessage('')
  }

  // 인증번호 발송
  const handleSendEmail = async () => {
    if (!isValidBirthday) {
      setMessage('올바른 생년월일을 입력해 주세요.')
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
    setExpiresAt(null)
    setRemainingSeconds(0)

    try {
      await http.post<string>('/api/email/send', {
        email: email.trim(),
      })

      setSentEmail(email.trim())

      const expiration = Date.now() + VERIFICATION_DURATION
      setExpiresAt(expiration)
      setRemainingSeconds(300)

      setMessage('인증번호가 발송되었습니다. 5분 이내에 입력해 주세요.')
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

    if (
      expiresAt === null ||
      Date.now() >= expiresAt
    ) {
      setMessage('인증번호가 만료되었습니다. 다시 발송해 주세요.')
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

  return (
    <main style={{ maxWidth: 480, margin: '60px auto', padding: 24 }}>
      <h1>회원가입</h1>
      <p>생년월일과 이메일을 인증해 주세요.</p>

      {/* 생년월일 */}
      <div style={{ marginTop: 24 }}>
        <label htmlFor="birthday">생년월일</label>
        <input
          id="birthday"
          type="date"
          min="1900-01-01"
          max={todayString}
          value={birthday}
          onChange={(e) => handleBirthdayChange(e.target.value)}
          style={{
            display: 'block',
            width: '100%',
            padding: 12,
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* 이메일 */}
      <div style={{ marginTop: 24 }}>
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          type="email"
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          style={{
            display: 'block',
            width: '100%',
            padding: 12,
            boxSizing: 'border-box',
          }}
        />

        <button
          type="button"
          onClick={handleSendEmail}
          disabled={loading || verified}
          style={{ marginTop: 8, padding: 12 }}
        >
          {loading ? '처리 중...' : sentEmail ? '인증번호 재발송' : '인증번호 발송'}
        </button>
      </div>

      {/* 인증번호 */}
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
          disabled={!sentEmail || loading || verified || isExpired}
          style={{
            display: 'block',
            width: '100%',
            padding: 12,
            boxSizing: 'border-box',
          }}
        />

        {/* 만료 시간 표시 */}
        {expiresAt !== null && !verified && (
          <p
            style={{
              marginTop: 8,
              color: isExpired ? 'red' : '#d9534f',
              fontWeight: 'bold',
            }}
          >
            {isExpired
              ? '인증번호가 만료되었습니다.'
              : `남은 시간: ${formatTime(remainingSeconds)}`}
          </p>
        )}

        {verified && (
          <p style={{ color: 'green', marginTop: 8 }}>
            이메일 인증 완료 ✓
          </p>
        )}

        <button
          type="button"
          onClick={handleVerifyEmail}
          disabled={!sentEmail || loading || verified || isExpired}
          style={{ marginTop: 8, padding: 12 }}
        >
          인증 확인
        </button>
      </div>

      {/* 안내 메시지 */}
      {message && (
        <p role="status" style={{ marginTop: 20 }}>
          {message}
        </p>
      )}

      {/* 다음 단계 */}
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
