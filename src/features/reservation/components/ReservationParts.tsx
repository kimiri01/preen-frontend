import type { ReactNode } from 'react'
import {
  formatCountdown,
  formatPrice,
  formatShortDate,
} from '@/common/utils/format'
import { nightsBetween } from '@/common/utils/date'
import { isHoldExpired } from '@/features/reservation/hooks/useReservations'
import type { PriceItem, Reservation } from '@/features/reservation/types'

const STATUS_LABELS = {
  PENDING: { label: '결제 대기', className: 'badge badge-warn' },
  CONFIRMED: { label: '예약 확정', className: 'badge badge-ok' },
  CANCELLED: { label: '취소됨', className: 'badge badge-off' },
  COMPLETED: { label: '이용 완료', className: 'badge' },
}

export function ReservationStatusBadge({
  reservation,
}: {
  reservation: Reservation
}) {
  // 결제 제한 시각이 지났으면 상태와 무관하게 만료로 표시한다.
  if (isHoldExpired(reservation))
    return <span className="badge badge-off">결제 시간 만료</span>
  const status = STATUS_LABELS[reservation.status] ?? {
    label: reservation.status,
    className: 'badge',
  }
  return <span className={status.className}>{status.label}</span>
}

export function stayText(
  reservation: Pick<Reservation, 'checkIn' | 'checkOut' | 'guestCount'>,
) {
  const nights = nightsBetween(reservation.checkIn, reservation.checkOut)
  return `${formatShortDate(reservation.checkIn)} — ${formatShortDate(reservation.checkOut)} · ${nights}박 · ${reservation.guestCount}명`
}

/** 요금 항목과 합계. 서버 값만 표시한다. */
export function PriceBreakdown({
  items,
  total,
  totalLabel = '합계',
}: {
  items: PriceItem[]
  total: number
  totalLabel?: string
}) {
  return (
    <div className="stack">
      {items.map((item, index) => (
        <div key={`${item.itemType}-${index}`} className="price-row">
          <span>{item.name}</span>
          <span>{formatPrice(item.amount)}</span>
        </div>
      ))}
      <div className="price-row price-total">
        <span>{totalLabel}</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  )
}

export function HoldCountdown({ remaining }: { remaining: number }) {
  return remaining > 0 ? (
    <p className="form-notice" role="timer">
      결제 제한 시간까지 <strong>{formatCountdown(remaining)}</strong>{' '}
      남았습니다. 시간이 지나면 예약이 자동으로 취소됩니다.
    </p>
  ) : (
    <p className="form-error" role="alert">
      결제 제한 시간이 지났습니다. 예약이 곧 자동으로 취소됩니다.
    </p>
  )
}

/** 예약 목록의 한 줄. 내 예약과 호스트 예약 목록이 같이 쓴다. */
export function ReservationListItem({
  reservation,
  actions,
  showGuest = false,
}: {
  reservation: Reservation
  actions?: ReactNode
  showGuest?: boolean
}) {
  return (
    <li className="list-card">
      <div>
        <span>
          <ReservationStatusBadge reservation={reservation} />
        </span>
        <p>
          {reservation.accommodationName} · {reservation.roomName}
        </p>
        <small>{stayText(reservation)}</small>
        <small>
          예약번호 {reservation.reservationNo}
          {showGuest && ` · 예약자 ${reservation.guestName}`}
        </small>
      </div>
      <div>
        <p>{formatPrice(reservation.totalPrice)}</p>
        {actions && <div className="actions">{actions}</div>}
      </div>
    </li>
  )
}