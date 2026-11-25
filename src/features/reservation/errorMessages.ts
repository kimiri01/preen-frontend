export const RESERVATION_ADULT_ONLY = 'ADULT_ONLY'
export const INVENTORY_SOLD_OUT = 'SOLD_OUT'
export const RESERVATION_ROOM_NOT_AVAILABLE = 'ROOM_NOT_AVAILABLE'

/** 에러 코드는 백엔드 Enum name으로 전달된다. */
export const reservationErrorMessages: Record<string, string> = {
  RESERVATION_NOT_FOUND: '예약을 찾을 수 없습니다.',
  ADULT_ONLY: '예약은 성인만 할 수 있습니다.',
  INVALID_DATES:
    '체크인은 오늘 이후, 체크아웃은 체크인 다음 날 이후여야 합니다.',
  GUEST_COUNT_EXCEEDED: '객실의 최대 인원을 넘었습니다.',
  ROOM_NOT_AVAILABLE: '지금은 예약할 수 없는 객실입니다.',
  NOT_CANCELLABLE: '취소할 수 없는 예약입니다.',
  INVALID_SEARCH_RANGE: '검색 시작일이 종료일보다 늦습니다.',
  SOLD_OUT:
    '방금 다른 예약이 먼저 들어와 선택한 날짜가 마감되었습니다. 다른 객실이나 날짜를 골라 주세요.',
  INVALID_DATE_RANGE: '날짜 범위가 올바르지 않습니다.',
  DATE_RANGE_TOO_LONG: '날짜 범위가 너무 깁니다.',
  NOTHING_TO_UPDATE: '수량, 가격, 판매 마감 중 하나 이상을 입력해 주세요.',
  TOTAL_COUNT_TOO_SMALL:
    '이미 예약되었거나 선점된 수량보다 적게 설정할 수 없습니다.',
}
