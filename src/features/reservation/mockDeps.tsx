import { useQuery } from '@tanstack/react-query'

/* ───────── 가짜 타입 (외부 feature import 없음) ───────── */
export interface MockRefundRule {
  daysBefore: number
  refundRate: number
}

export interface MockRoomAvailability {
  roomId: number
  roomName: string
  capacity: number
  maxCapacity: number
  extraPersonFee: number
  nights: number
  available: boolean
  totalPrice?: number
}

export interface MockAccommodationDetail {
  id: number
  name: string
  regionName: string
  checkInTime: string // HH:mm:ss
  checkOutTime: string
  imageUrls: string[]
  refundPolicy?: {
    policyText?: string
    rules: MockRefundRule[]
  }
}




/* ───────── estimateExtraPersonFee 대체 ───────── */
export function mockEstimateExtraPersonFee(
  guestCount: number,
  room: { capacity: number; extraPersonFee: number; nights: number },
): number {
  return Math.max(0, guestCount - room.capacity) * room.extraPersonFee * room.nights
}

/* ───────── RefundPolicyTable 대체 ───────── */
export function MockRefundPolicyTable({
  policyText,
  rules = [],
}: {
  policyText?: string
  rules?: MockRefundRule[]
}) {
  const sorted = [...rules].sort((a, b) => b.daysBefore - a.daysBefore)
  if (!policyText && sorted.length === 0) {
    return <small>등록된 환불정책이 없습니다.</small>
  }
  return (
    <div className="stack">
      {policyText && <p className="pre-line">{policyText}</p>}
      {sorted.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">취소 시점</th>
              <th scope="col">환불 비율</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((rule) => (
              <tr key={rule.daysBefore}>
                <td>
                  {rule.daysBefore === 0
                    ? '체크인 당일까지'
                    : `체크인 ${rule.daysBefore}일 전까지`}
                </td>
                <td>{Math.round(rule.refundRate * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <small>위 기간에 해당하지 않으면 환불되지 않습니다.</small>
    </div>
  )
}

/* ───────── 쿼리 키 + mock 데이터 + 훅 (캐시 저장) ───────── */
export const mockKeys = {
  all: ['reservation-mock'] as const,
  detail: (id: number) => [...mockKeys.all, 'accommodation', id] as const,
  availability: (id: number, checkIn: string, checkOut: string) =>
    [...mockKeys.all, 'availability', id, checkIn, checkOut] as const,
}

const mockDetail = (id: number): MockAccommodationDetail => ({
  id,
  name: `테스트 스테이 ${id}`,
  regionName: '강릉시',
  checkInTime: '15:00:00',
  checkOutTime: '11:00:00',
  imageUrls: ['https://picsum.photos/seed/stay1/1200/800'],
  refundPolicy: {
    policyText: '체크인 날짜 기준으로 아래 비율로 환불됩니다.',
    rules: [
      { daysBefore: 7, refundRate: 1 },
      { daysBefore: 3, refundRate: 0.5 },
    ],
  },
})

function nightsBetween(checkIn: string, checkOut: string) {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.max(1, Math.round(ms / 86_400_000))
}

// URL의 roomId가 101 또는 102여야 한다. 102는 일부러 매진(available: false)으로 둔다.
const mockAvailability = (checkIn: string, checkOut: string): MockRoomAvailability[] => {
  const nights = nightsBetween(checkIn, checkOut)
  return [
    {
      roomId: 2,
      roomName: '오션뷰 스탠다드',
      capacity: 2,
      maxCapacity: 3,
      extraPersonFee: 20000,
      nights,
      available: true,
      totalPrice: 120000 * nights,
    },
    {
      roomId: 102,
      roomName: '패밀리 스위트',
      capacity: 4,
      maxCapacity: 6,
      extraPersonFee: 30000,
      nights,
      available: false,
    },
  ]
}

export function useMockAccommodationDetail(id: number | undefined) {
  return useQuery({
    queryKey: mockKeys.detail(id ?? 0),
    queryFn: () => Promise.resolve(mockDetail(id as number)),
    enabled: id !== undefined,
    staleTime: Infinity,
  })
}

export function useMockAvailability(
  id: number | undefined,
  checkIn: string | undefined,
  checkOut: string | undefined,
) {
  return useQuery({
    queryKey: mockKeys.availability(id ?? 0, checkIn ?? '', checkOut ?? ''),
    queryFn: () => Promise.resolve(mockAvailability(checkIn!, checkOut!)),
    enabled: id !== undefined && !!checkIn && !!checkOut && checkOut > checkIn,
    staleTime: Infinity,
  })
}