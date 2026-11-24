export const RESERVATION_ADULT_ONLY = 'RESERVATION-002'
export const INVENTORY_SOLD_OUT = 'INVENTORY-001'
export const RESERVATION_ROOM_NOT_AVAILABLE = 'RESERVATION-005'

export const reservationErrorMessages: Record<string, string> = {
  'RESERVATION-001': '예약을 찾을 수 없습니다.',
  'RESERVATION-002': '예약은 성인만 할 수 있습니다.',
  'RESERVATION-003':
    '체크인은 오늘 이후, 체크아웃은 체크인 다음 날 이후여야 합니다.',
  'RESERVATION-004': '객실의 최대 인원을 넘었습니다.',
  'RESERVATION-005': '지금은 예약할 수 없는 객실입니다.',
  'RESERVATION-006': '취소할 수 없는 예약입니다.',
  'INVENTORY-001':
    '방금 다른 예약이 먼저 들어와 선택한 날짜가 마감되었습니다. 다른 객실이나 날짜를 골라 주세요.',
  'INVENTORY-002': '날짜 범위가 올바르지 않습니다.',
}
