import type { ReactNode } from 'react'
import { formatFullDate, formatPrice, formatShortDate } from '@/common/utils/format'
import { useAccommodationDetail } from '@/features/accommodation/public'
import type { Reservation } from '@/features/reservation/types'
import '@/features/reservation/reservation.css'


export const FALLBACK_IMAGE = '/images/generated.png'

const STEPS = ['예약 정보', '결제', '예약 확정']

interface CheckoutLayoutProps {
  title: string
  /** 1: 예약 정보, 2: 결제, 3: 예약 확정 */
  step: 1 | 2 | 3
  description?: string
  /** 오른쪽 예약 요약 */
  summary: ReactNode
  children: ReactNode
}

/** 예약 정보 → 결제 → 예약 확정이 함께 쓰는 2단 레이아웃 */
export function CheckoutLayout({
  title,
  step,
  description,
  summary,
  children,
}: CheckoutLayoutProps) {
  return (
    <main className="checkout">
      <div className="checkout-heading">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        <ol className="checkout-steps">
          {STEPS.map((label, index) => (
            <li
              key={label}
              aria-current={index + 1 === step ? 'step' : undefined}
            >
              {String(index + 1).padStart(2, '0')} {label}
            </li>
          ))}
        </ol>
      </div>
      <div className="checkout-body">
        <div className="checkout-main">{children}</div>
        {summary}
      </div>
    </main>
  )
}

/** `2026-11-20` → `2026.11.20 (금)` */
function fullDateWithWeekday(iso: string) {
  return `${formatFullDate(iso)} ${formatShortDate(iso).slice(6)}`
}

export interface SummaryPriceRow {
  label: string
  amount: number
}

interface StaySummaryCardProps {
  image?: string
  name: string
  /** 지역 · 객실 이름 */
  caption: string
  checkIn: string
  checkOut: string
  guestCount: number
  prices: SummaryPriceRow[]
  totalLabel: string
  total: number
  /** 합계 아래 안내 문구 */
  note?: string
}

/** 선택한 숙소·일정·요금 요약 카드 */
export function StaySummaryCard({
  image,
  name,
  caption,
  checkIn,
  checkOut,
  guestCount,
  prices,
  totalLabel,
  total,
  note,
}: StaySummaryCardProps) {
  return (
    <aside className="checkout-summary" aria-label="선택한 숙소 요약">
      <img src={image ?? FALLBACK_IMAGE} alt="" />
      <div className="checkout-summary-title">
        <h3>{name}</h3>
        <small>{caption}</small>
      </div>
      <dl>
        <div>
          <dt>체크인</dt>
          <dd>{fullDateWithWeekday(checkIn)}</dd>
        </div>
        <div>
          <dt>체크아웃</dt>
          <dd>{fullDateWithWeekday(checkOut)}</dd>
        </div>
        <div>
          <dt>인원</dt>
          <dd>{guestCount}명 · 객실 1개</dd>
        </div>
      </dl>
      <dl>
        {prices.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{formatPrice(row.amount)}</dd>
          </div>
        ))}
        <div className="checkout-summary-total">
          <dt>{totalLabel}</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      {note && <small>{note}</small>}
    </aside>
  )
}

/** 만들어진 예약의 요약 카드. 요금은 서버 값만 표시한다. */
export function ReservationSummaryCard({
  reservation,
  totalLabel = '총 결제 금액',
}: {
  reservation: Reservation
  totalLabel?: string
}) {
  // 사진과 지역은 예약 응답에 없어 숙소 상세에서 가져온다. 실패해도 요약은 보여준다.
  const detail = useAccommodationDetail(reservation.accommodationId)
  return (
    <StaySummaryCard
      image={detail.data?.imageUrls[0]}
      name={reservation.accommodationName}
      caption={[detail.data?.regionName, reservation.roomName]
        .filter(Boolean)
        .join(' · ')}
      checkIn={reservation.checkIn}
      checkOut={reservation.checkOut}
      guestCount={reservation.guestCount}
      prices={reservation.priceItems.map((item) => ({
        label: item.name,
        amount: item.amount,
      }))}
      totalLabel={totalLabel}
      total={reservation.totalPrice}
    />
  )
}