const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function pad(value: number) {
  return String(value).padStart(2, '0')
}

/** 서버 금액(120000.00)을 `₩120,000`으로 표시한다. */
export function formatPrice(value: number): string {
  return `₩${Math.round(value).toLocaleString('ko-KR')}`
}

/** 환불 비율(0~1)을 `%`로 표시한다. */
export function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`
}

/** `2026-11-20` → `11.20 (금)` */
export function formatShortDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return `${pad(month)}.${pad(day)} (${WEEKDAYS[weekday]})`
}

/** `2026-11-20` → `2026.11.20` */
export function formatFullDate(iso: string): string {
  return iso.slice(0, 10).replaceAll('-', '.')
}

/** LocalDateTime 문자열 → `2026.11.20 14:30` (서버 시각 그대로 표시) */
export function formatDateTime(value: string): string {
  return `${formatFullDate(value)} ${value.slice(11, 16)}`
}

/** `15:00:00` → `15:00` */
export function formatTime(value: string): string {
  return value.slice(0, 5)
}

/** 남은 시간(ms)을 `mm:ss`로 표시한다. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}
