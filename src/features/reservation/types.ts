import type { RefundRule } from '@/features/accommodation/public'

export type ReservationStatus =
  'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface PriceItem {
  /** ROOM, EXTRA_PERSON */
  itemType: string
  name: string
  amount: number
}

/** 예약 시점의 환불정책 스냅샷 */
export interface RefundPolicySnapshot {
  policyText?: string
  rules?: RefundRule[]
}

/** 값이 null인 필드는 응답에서 빠진다. */
export interface Reservation {
  id: number
  reservationNo: string
  accommodationId: number
  accommodationName: string
  roomId: number
  roomName: string
  checkIn: string
  checkOut: string
  guestCount: number
  guestName: string
  guestPhone?: string
  totalPrice: number
  status: ReservationStatus
  /** PENDING 상태에서 결제를 마쳐야 하는 시각 (Asia/Seoul) */
  holdExpiresAt?: string
  cancelledAt?: string
  createdAt: string
  priceItems: PriceItem[]
  refundPolicy?: RefundPolicySnapshot
}

export interface CreateReservationRequest {
  roomId: number
  checkIn: string
  checkOut: string
  guestCount: number
  /** 비우면 회원 정보를 쓴다 */
  guestName?: string
  guestPhone?: string
}

/** 환불 금액은 취소 응답에만 있다. */
export interface CancelResult {
  reservation: Reservation
  /** 결제 전 취소면 없다 */
  refundRate?: number
  refundAmount: number
  penaltyAmount: number
}
