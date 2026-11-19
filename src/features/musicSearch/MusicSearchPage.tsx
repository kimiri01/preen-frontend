import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLoginSession } from '@/features/auth/public'
import { SpotifyTrackSearch } from './SpotifyTrackSearch'
import type { SpotifyTrack } from './musicSearchApi'
export function MusicSearchPage() {
  const { member, restoring } = useLoginSession()
  const [track, setTrack] = useState<SpotifyTrack | null>(null)
  return (
    <main className="music-search-page">
      <h1>리뷰에 남길 음악 찾기</h1>
      <p>숙박의 분위기를 표현할 Spotify 음악 한 곡을 찾아보세요.</p>
      {!member && !restoring && <Link to="/login">로그인하기</Link>}
      <SpotifyTrackSearch
        disabled={restoring || !member}
        selectedId={track?.id}
        onSelect={setTrack}
      />
      {track && (
        <section>
          <h2>선택한 곡: {track.name}</h2>
          <p>{track.artists.join(', ')}</p>
          <iframe
            title="선택한 Spotify 곡"
            src={`https://open.spotify.com/embed/track/${track.id}`}
            width="100%"
            height="152"
            allow="encrypted-media; fullscreen; picture-in-picture"
          />
          <button type="button" onClick={() => setTrack(null)}>
            선택 취소
          </button>
        </section>
      )}
    </main>
  )
}
