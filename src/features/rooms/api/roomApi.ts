import { http } from '@/common/api/http'
import type { RoomList } from '../types'
export function getRooms(accommodationId: string, signal?: AbortSignal) {
  return http.get<RoomList>(
    `/api/accommodations/${encodeURIComponent(accommodationId)}/rooms`,
    { signal },
  )
}
