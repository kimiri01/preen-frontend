import type { CreateReservationRequest, Reservation } from "@/features/reservation/types"
import { http } from '@/common/api/http'



export const RESERVATION_PAGE_SIZE = 10

export const reservationApi = {
    create: (body: CreateReservationRequest) =>
        http.post<Reservation>('/api/reservations', body),
    
}