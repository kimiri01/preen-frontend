
import { useEffect, useState } from 'react'
import {
  createTestPayment,
  getTestPayment,
  type TestPayment,
} from '@/features/payment/api/paymentApi'
import './payment.css'

const PAYMENT_STORAGE_KEY = 'preen-test-payment-id'

export function PaymentWaitingPage() {
  const [payment, setPayment] = useState<TestPayment | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadPayment() {
      try {
        const savedId = sessionStorage.getItem(PAYMENT_STORAGE_KEY)
        let result: TestPayment

        if (savedId && /^\d+$/.test(savedId) && Number(savedId) > 0) {
          try {
            result = await getTestPayment(Number(savedId))
          } catch {
            // 백엔드 재시작 등으로 기존 결제를 찾지 못하면 새로 생성
            sessionStorage.removeItem(PAYMENT_STORAGE_KEY)
            result = await createTestPayment()
          }
        } else {
          result = await createTestPayment()
        }

        if (!active) return

        sessionStorage.setItem(
          PAYMENT_STORAGE_KEY,
          String(result.paymentId),
        )
        setPayment(result)
      } catch {
        if (active) setError('결제 정보를 불러오지 못했습니다.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadPayment()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!payment || payment.status !== 'WAITING') return

    let active = true

    async function refreshPayment() {
      try {
        const result = await getTestPayment(payment!.paymentId)
        if (active) setPayment(result)
      } catch {
        // 일시적인 조회 실패는 다음 조회에서 다시 시도
      }
    }

    const interval = window.setInterval(() => {
      void refreshPayment()
    }, 5000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [payment?.paymentId, payment?.status])

  if (loading) {
    return <main className="payment-page">결제 정보를 불러오는 중...</main>
  }

  if (error || !payment) {
    return (
      <main className="payment-page">
        <h1 className="payment-title">결제 대기</h1>
        <p role="alert">{error || '결제 정보가 없습니다.'}</p>
      </main>
    )
  }

  const remainingSeconds = Math.max(
    0,
    Math.ceil(
      (new Date(payment.expiresAt).getTime() - now) / 1000,
    ),
  )

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  const formattedTime =
    `${String(minutes).padStart(2, '0')}:` +
    `${String(seconds).padStart(2, '0')}`

  const isCompleted = payment.status === 'COMPLETED'
  const isExpired =
    payment.status === 'EXPIRED' ||
    (!isCompleted && remainingSeconds === 0)

  return (
    <main className="payment-page">
      <h1 className="payment-title">결제 대기</h1>

      <p className="payment-description">
        아래 테스트 가상계좌 정보를 확인해 주세요.
      </p>

      <section className="payment-card">
        <h2>입금 계좌 안내</h2>

        <div className="payment-info-row" style={{ marginTop: 24 }}>
          <span className="payment-label">은행명</span>
          <span className="payment-value">{payment.bankName}</span>
        </div>

        <div className="payment-info-row">
          <span className="payment-label">계좌번호</span>
          <span className="payment-value">{payment.accountNumber}</span>
        </div>

        <div className="payment-info-row">
          <span className="payment-label">입금 금액</span>
          <span className="payment-value">
            {payment.amount.toLocaleString('ko-KR')}원
          </span>
        </div>
      </section>

      <section className="payment-timer-section">
        <h2>남은 입금 시간</h2>

        <p
          role="timer"
          className={
            isExpired
              ? 'payment-timer expired'
              : 'payment-timer'
          }
        >
          {isCompleted ? '완료' : formattedTime}
        </p>

        {isCompleted ? (
          <p className="payment-notice" role="status">
            테스트 결제가 완료되었습니다.
          </p>
        ) : isExpired ? (
          <p className="payment-notice" role="status">
            입금 대기 시간이 만료되었습니다.
          </p>
        ) : (
          <p className="payment-notice">
            테스트 결제 대기 중입니다. 남은 시간은 서버 기준입니다.
          </p>
        )}
      </section>
    </main>
  )
}
