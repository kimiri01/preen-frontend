import { http } from '@/common/api/http'
import type { ApiResponse } from '@/common/types/api'
import type { RoomList } from '../types'
export async function getRooms(accommodationId: string, signal?: AbortSignal) {
  const response = await http.get<ApiResponse<RoomList>>(
    `/api/accommodations/${encodeURIComponent(accommodationId)}/rooms`,
    { signal },
  )
  return response.data
}
