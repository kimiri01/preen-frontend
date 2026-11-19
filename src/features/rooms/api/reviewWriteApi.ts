import { http } from '@/common/api/http'
import type { ApiResponse } from '@/common/types/api'

export interface ReviewContext {
  reservationId: string
  accommodationId: string
  accommodationName: string
  roomName: string
  checkIn: string
  checkOut: string
  eligible: boolean
  reasonCode: 'READY' | 'STAY_NOT_COMPLETED' | 'ALREADY_REVIEWED'
  reviewId: string | null
}
export interface CreatedReview {
  id: string
  reservationId: string
  accommodationId: string
  rating: number
  spotifyTrackId: string
}
export async function getReviewContext(id: string, signal: AbortSignal) {
  return (
    await http.get<ApiResponse<ReviewContext>>(
      `/api/review-reservations/${encodeURIComponent(id)}`,
      { signal, auth: true },
    )
  ).data
}
export async function getReviewReservations(id: string, signal: AbortSignal) {
  return (
    await http.get<ApiResponse<ReviewContext[]>>(
      `/api/review-reservations?accommodationId=${encodeURIComponent(id)}`,
      { signal, auth: true },
    )
  ).data
}
export async function createReview(body: {
  reservationId: string
  rating: number
  spotifyTrackId: string
}) {
  const result = await http.post<ApiResponse<CreatedReview>>('/api/reviews', body, { auth: true })
  if (!result.success || !result.data) throw new Error('Invalid review response')
  return result.data
}
