import { Link, useParams } from 'react-router-dom'
import { LoadingBlock } from '@/common/components/StatusViews'
import { formatDateTime } from '@/common/utils/format'
import { NotFoundView } from '@/common/components/Screens'
import { ReservationSummaryCard } from '@/features/reservation/components/Checkout'
import { useReservation } from '@/features/reservation/hooks/useReservations'
import '@/features/reservation/reservation.css'

export function ReservationSuccessPage() {
  const { id } = useParams()
  const reservationId = Number(id)
  const valid = Number.isInteger(reservationId) && reservationId > 0
  const query = useReservation(valid ? reservationId : undefined)

  if (!valid) return <NotFoundView />
  if (query.isPending) return <LoadingBlock fullPage />
  if (query.isError || !query.data) {
    return <NotFoundView title="예약 정보를 찾을 수 없습니다" />
  }

  const reservation = query.data

  return (
    <main className="checkout">
      <div className="checkout-heading">
        <small className="muted" style={{ letterSpacing: '1px' }}>
          Must 16 / 게스트
        </small>
        <h2>예약이 확정되었습니다</h2>
        <p>결제와 객실 확보가 완료되었어요. 예약번호를 확인해주세요.</p>
      </div>

      <div className="checkout-body">
        <div className="checkout-main">
          {/* 원형 체크 아이콘 */}
          <div className="checkout-done" style={{ color: '#4d7764' }}>
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="9 12 11.5 14.5 15.5 9.5" />
            </svg>
          </div>

          <h3 className="checkout-headline" style={{ fontSize: '26px' }}>
            {reservation.accommodationName}에서의 하루가 기다리고 있어요.
          </h3>

          <p style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text)' }}>
            예약번호&nbsp;&nbsp;{reservation.reservationNo}
          </p>

          <dl className="checkout-rows" style={{ width: '100%' }}>
            <div>
              <dt>예약 상태</dt>
              <dd style={{ color: '#4d7764', fontWeight: 500 }}>
                {reservation.status === 'CONFIRMED' || reservation.status === 'COMPLETED'
                  ? '예약 확정'
                  : reservation.status}
              </dd>
            </div>
            <div>
              <dt>예약자</dt>
              <dd>
                {reservation.guestName}
                {reservation.guestPhone && ` · ${reservation.guestPhone}`}
              </dd>
            </div>
            <div>
              <dt>결제 수단</dt>
              <dd>신용카드 · 일시불</dd>
            </div>
            <div>
              <dt>결제 완료 시각</dt>
              <dd>{formatDateTime(reservation.createdAt)}</dd>
            </div>
          </dl>

          <div className="checkout-note" style={{ width: '100%' }}>
            <strong>예약 안내를 보냈어요</strong>
            <p>
              등록한 이메일과 휴대전화로 예약 정보를 발송했습니다. 마이페이지에서도 언제든 확인할 수 있어요.
            </p>
          </div>

          <div className="actions" style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
            <Link
              to={`/me/reservations/${reservation.id}`}
              className="btn btn-primary"
              style={{
                backgroundColor: 'var(--text)',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              예약 상세 보기
            </Link>
            <Link
              to="/"
              className="btn"
              style={{
                border: '1px solid var(--border)',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--text)',
              }}
            >
              홈으로
            </Link>
          </div>
        </div>

        {/* 오른쪽 숙소 요약 카드 */}
        <ReservationSummaryCard reservation={reservation} />
      </div>
    </main>
  )
}
