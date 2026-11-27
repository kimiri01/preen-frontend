import { useEffect, useState } from 'react'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { parseKstDateTime } from '@/common/utils/date'
import { inventoryKeys } from '@/features/reservation/tempUtils'
import { reservationApi } from '@/features/reservation/api/reservationApi'
import type {
  Reservation,
  ReservationStatus,
} from '@/features/reservation/types'



export const reservationKeys = {
  all: ['reservation'] as const,
  mine: (page: number, status?: ReservationStatus) =>
    [...reservationKeys.all, 'mine', status ?? 'ALL', page] as const,
  host: (page: number) => [...reservationKeys.all, 'host', page] as const,
  detail: (id: number) => [...reservationKeys.all, 'detail', id] as const,
}


/** status를 넘기면 그 상태의 예약만 (서버에서 필터 후 페이지 나눔) */
export function useMyReservations(page: number, status?: ReservationStatus) {
  return useQuery({
    queryKey: reservationKeys.mine(page, status),
    queryFn: () => reservationApi.mine(page, status),
    placeholderData: keepPreviousData,
  })
}

export function useHostReservations(page: number) {
  return useQuery({
    queryKey: reservationKeys.host(page),
    queryFn: () => reservationApi.forHost(page),
    placeholderData: keepPreviousData,
  })
}

export function useReservation(id: number | undefined) {
  return useQuery({
    queryKey: reservationKeys.detail(id ?? 0),
    queryFn: () => reservationApi.detail(id as number),
    enabled: id !== undefined,
    staleTime: 0,
  })
}

/** 예약 생성·취소, 결제 승인 뒤: 내 예약 목록·상세와 해당 숙소의 예약 가능 여부를 무효화한다. */
export function useInvalidateReservations() {
    const queryClient = useQueryClient()
    return (accommodationId? : number) => {
        void queryClient.invalidateQueries({queryKey: reservationKeys.all})
        void queryClient.invalidateQueries({
            queryKey:
                accommodationId!==undefined
                    ? inventoryKeys.availabilityOf(accommodationId)
                    :inventoryKeys.all,
            })
    }
}

/** 예약 생성. 성공·실패 모두 목록과 예약 가능 여부를 다시 불러온다. */
export function useCreateReservation(accommodationId: number | undefined) {
  const invalidate = useInvalidateReservations()
  return useMutation({
    mutationFn: reservationApi.create,
    retry: false,
    onSettled: () => invalidate(accommodationId),
  })
}

/** 예약 취소. 성공하면 목록·상세와 예약 가능 여부를 무효화한다. */
export function useCancelReservation() {
  const invalidate = useInvalidateReservations()
  return useMutation({
    mutationFn: ({ id }: { id: number; accommodationId: number }) =>
      reservationApi.cancel(id),
    retry: false,
    onSuccess: (_result, { accommodationId }) => invalidate(accommodationId),
  })
}

/**
 * PENDING 예약의 결제 제한 시간까지 남은 ms. PENDING이 아니면 null.
 * 서버 스케줄러가 1분 주기라 만료 직후에도 PENDING일 수 있으므로, 0이면 만료로 본다.
 */
export function useHoldRemaining(
  reservation: Reservation | undefined,
): number | null {
  const deadline =
    reservation?.status === 'PENDING' && reservation.holdExpiresAt
      ? parseKstDateTime(reservation.holdExpiresAt).getTime()
      : null
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (deadline === null) return
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [deadline])

  return deadline === null ? null : Math.max(0, deadline - now)
}

export function isHoldExpired(
  reservation: Reservation,
  now: number = Date.now(),
): boolean {
  return (
    reservation.status === 'PENDING' &&
    !!reservation.holdExpiresAt &&
    parseKstDateTime(reservation.holdExpiresAt).getTime() <= now
  )
}
