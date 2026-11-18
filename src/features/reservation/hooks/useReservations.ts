import { useEffect, useState } from 'react'
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { parseKstDateTime } from '@/common/utils/date'
import { inventoryKeys } from '@/features/reservation/tempUtils'
import { reservationApi } from '@/features/reservation/api/reservationApi'
import type { Reservation } from '@/features/reservation/types'



export const reservationKeys = {
  all: ['reservation'] as const,
  mine: (page: number) => [...reservationKeys.all, 'mine', page] as const,
  host: (page: number) => [...reservationKeys.all, 'host', page] as const,
  detail: (id: number) => [...reservationKeys.all, 'detail', id] as const,
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
