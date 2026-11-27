/**
 * 백엔드 ReservationErrorCode·InventoryErrorCode 이름.
 * 화면에서 특정 코드로 분기할 때(전용 UI)만 쓴다. 문구는 아래 reservationErrorMessages로.
 */
export const RESERVATION_ERROR = {
  // ReservationErrorCode
  RESERVATION_NOT_FOUND: 'RESERVATION_NOT_FOUND',
  ADULT_ONLY: 'ADULT_ONLY',
  INVALID_DATES: 'INVALID_DATES',
  GUEST_COUNT_EXCEEDED: 'GUEST_COUNT_EXCEEDED',
  ROOM_NOT_AVAILABLE: 'ROOM_NOT_AVAILABLE',
  NOT_CANCELLABLE: 'NOT_CANCELLABLE',
  /** 호스트가 본인 숙소를 예약하려 함 (TODO: 백엔드 코드 이름 확정 후 맞추기) */
  SELF_RESERVATION_NOT_ALLOWED: 'SELF_RESERVATION_NOT_ALLOWED',
  // InventoryErrorCode
  SOLD_OUT: 'SOLD_OUT',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  DATE_RANGE_TOO_LONG: 'DATE_RANGE_TOO_LONG',
  NOTHING_TO_UPDATE: 'NOTHING_TO_UPDATE',
  TOTAL_COUNT_TOO_SMALL: 'TOTAL_COUNT_TOO_SMALL',
} as const

/** 화면 문구. getErrorMessage(error, reservationErrorMessages)로만 쓴다. */
export const reservationErrorMessages: Record<string, string> = {
  [RESERVATION_ERROR.RESERVATION_NOT_FOUND]: '예약을 찾을 수 없습니다.',
  [RESERVATION_ERROR.ADULT_ONLY]: '예약은 성인만 할 수 있습니다.',
  [RESERVATION_ERROR.INVALID_DATES]:
    '체크인은 오늘 이후, 체크아웃은 체크인 다음 날 이후여야 합니다.',
  [RESERVATION_ERROR.GUEST_COUNT_EXCEEDED]: '객실의 최대 인원을 넘었습니다.',
  [RESERVATION_ERROR.ROOM_NOT_AVAILABLE]: '지금은 예약할 수 없는 객실입니다.',
  [RESERVATION_ERROR.NOT_CANCELLABLE]: '취소할 수 없는 예약입니다.',
  [RESERVATION_ERROR.SELF_RESERVATION_NOT_ALLOWED]:
    '본인이 등록한 숙소는 예약할 수 없습니다.',
  [RESERVATION_ERROR.SOLD_OUT]:
    '방금 다른 예약이 먼저 들어와 선택한 날짜가 마감되었습니다. 다른 객실이나 날짜를 골라 주세요.',
  [RESERVATION_ERROR.INVALID_DATE_RANGE]: '날짜 범위가 올바르지 않습니다.',
  [RESERVATION_ERROR.DATE_RANGE_TOO_LONG]: '날짜 범위가 너무 깁니다.',
  [RESERVATION_ERROR.NOTHING_TO_UPDATE]:
    '수량, 가격, 판매 마감 중 하나 이상을 입력해 주세요.',
  [RESERVATION_ERROR.TOTAL_COUNT_TOO_SMALL]:
    '이미 예약되었거나 선점된 수량보다 적게 설정할 수 없습니다.',
}
