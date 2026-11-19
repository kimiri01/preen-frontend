import { http } from '@/common/api/http'
import type { ApiResponse } from '@/common/types/api'
export interface SpotifyTrack {
  id: string
  name: string
  artists: string[]
  albumName: string
  imageUrl: string | null
  spotifyUrl: string
}
export async function searchTracks(q: string, signal: AbortSignal) {
  return (
    await http.get<ApiResponse<SpotifyTrack[]>>(
      `/api/spotify/tracks/search?${new URLSearchParams({ q })}`,
      { signal, auth: true },
    )
  ).data
}
