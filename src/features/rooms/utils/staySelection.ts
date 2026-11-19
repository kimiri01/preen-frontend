import { isIsoDate, nightsBetween } from '@/common/utils/date'

export const MAX_STAY_NIGHTS = 30

export function roomGuestLimit(rooms: { maxCapacity: number }[]) {
  const limits = rooms
    .map((room) => room.maxCapacity)
    .filter((value) => Number.isSafeInteger(value) && value > 0)
  return limits.length ? Math.max(...limits) : 1
}

export function validateStaySelection(
  checkIn: string,
  checkOut: string,
  guests: string,
  today: string,
  maxGuests: number,
) {
  if (!isIsoDate(checkIn)) return '체크인 날짜를 선택해주세요.'
  if (checkIn < today) return '체크인은 오늘 이후 날짜로 선택해주세요.'
  if (!isIsoDate(checkOut)) return '체크아웃 날짜를 선택해주세요.'
  if (checkOut <= checkIn)
    return '체크아웃은 체크인 다음 날부터 선택할 수 있습니다.'
  if (nightsBetween(checkIn, checkOut) > MAX_STAY_NIGHTS)
    return `숙박 기간은 최대 ${MAX_STAY_NIGHTS}박까지 선택할 수 있습니다.`
  const count = Number(guests)
  if (!Number.isInteger(count) || count < 1 || count > maxGuests)
    return `인원은 성인 1~${maxGuests}명으로 선택해주세요.`
  return ''
}
