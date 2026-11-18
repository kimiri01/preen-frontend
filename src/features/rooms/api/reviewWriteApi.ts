import { http, HttpError } from '@/common/api/http'
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
      { signal },
    )
  ).data
}
export async function getReviewReservations(id: string, signal: AbortSignal) {
  return (
    await http.get<ApiResponse<ReviewContext[]>>(
      `/api/review-reservations?accommodationId=${encodeURIComponent(id)}`,
      { signal },
    )
  ).data
}
export async function createReview(body: {
  reservationId: string
  rating: number
  spotifyTrackId: string
}) {
  const csrf = (
    await http.get<ApiResponse<{ headerName: string | null; token: string | null }>>(
      '/api/reviews/csrf',
    )
  ).data
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/reviews`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrf.headerName && csrf.token ? { [csrf.headerName]: csrf.token } : {}),
      },
      body: JSON.stringify(body),
    },
  )
  const contentType = response.headers.get('content-type') ?? ''
  const result = contentType.includes('application/json')
    ? ((await response.json()) as ApiResponse<CreatedReview>)
    : undefined
  if (!response.ok) throw new HttpError(response.status, result)
  if (!result?.success || !result.data)
    throw new Error('Invalid review response')
  return result.data
}
