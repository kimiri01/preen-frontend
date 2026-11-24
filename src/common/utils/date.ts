export const KST = 'Asia/Seoul'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

/** 오늘(Asia/Seoul)을 YYYY-MM-DD로 돌려준다. */
export function todayKst(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: KST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const pick = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '00'
  return `${pick('year')}-${pick('month')}-${pick('day')}`
}

function toUtcDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function toIso(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

export function addDays(iso: string, days: number): string {
  const date = toUtcDate(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return toIso(date)
}

/** 숙박일수 = 체크아웃 − 체크인 */
export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round(
    (toUtcDate(checkOut).getTime() - toUtcDate(checkIn).getTime()) / 86_400_000,
  )
}

export function weekdayOf(iso: string): number {
  return toUtcDate(iso).getUTCDay()
}

/** 날짜 문자열 검사 (YYYY-MM-DD) */
export function isIsoDate(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return toIso(toUtcDate(value)) === value
}

/** 이번 주말(다가오는 토요일 체크인, 일요일 체크아웃)을 돌려준다. */
export function upcomingWeekend(today: string = todayKst()) {
  const weekday = weekdayOf(today)
  const offset = weekday === 6 ? 0 : weekday === 0 ? 6 : 6 - weekday
  const checkIn = addDays(today, offset)
  return { checkIn, checkOut: addDays(checkIn, 1) }
}

/** 서버의 LocalDateTime(Asia/Seoul, 시간대 표기 없음)을 Date로 바꾼다. */
export function parseKstDateTime(value: string): Date {
  const trimmed = value.replace(/(\.\d{3})\d+/, '$1')
  return new Date(`${trimmed}+09:00`)
}

/** 라이브러리 없이 달력을 그리기 위한 월 계산: 'YYYY-MM' 기준 */
export function monthRange(month: string) {
  const [year, mon] = month.split('-').map(Number)
  const first = `${year}-${pad(mon)}-01`
  const last = toIso(new Date(Date.UTC(year, mon, 0)))
  return { first, last, daysInMonth: Number(last.slice(8)) }
}

export function shiftMonth(month: string, delta: number): string {
  const [year, mon] = month.split('-').map(Number)
  const date = new Date(Date.UTC(year, mon - 1 + delta, 1))
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`
}
