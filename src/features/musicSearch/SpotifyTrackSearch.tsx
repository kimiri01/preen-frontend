import { useEffect, useRef, useState } from 'react'
import { HttpError } from '@/common/api/http'
import { searchTracks, type SpotifyTrack } from './musicSearchApi'
import './musicSearch.css'
export function SpotifyTrackSearch({
  disabled = false,
  selectedId,
  onSelect,
}: {
  disabled?: boolean
  selectedId?: string | null
  onSelect: (track: SpotifyTrack) => void
}) {
  const [input, setInput] = useState(''),
    [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [pending, setPending] = useState(false),
    [message, setMessage] = useState(''),
    [searched, setSearched] = useState(false)
  const controller = useRef<AbortController | null>(null),
    sequence = useRef(0)
  useEffect(() => () => controller.current?.abort(), [])
  useEffect(() => {
    if (disabled) {
      sequence.current++
      controller.current?.abort()
      setPending(false)
      setTracks([])
      setSearched(false)
    }
  }, [disabled])
  return (
    <section className="spotify-search" aria-label="Spotify 음악 검색">
      <label htmlFor="spotify-query">곡 제목·가수로 검색</label>
      <div className="spotify-search-input">
        <input
          id="spotify-query"
          value={input}
          maxLength={200}
          placeholder="곡 제목 또는 가수 이름"
          disabled={disabled}
          onChange={(e) => {
            setInput(e.target.value)
            sequence.current++
            controller.current?.abort()
            setPending(false)
            setTracks([])
            setSearched(false)
            setMessage('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              e.currentTarget.parentElement?.querySelector('button')?.click()
            }
          }}
        />
        <button
          type="button"
          disabled={disabled || pending}
          onClick={async () => {
            const q = input.trim()
            if (!q || [...q].length > 100) {
              setMessage('검색어를 1~100자로 입력해주세요.')
              return
            }
            controller.current?.abort()
            const abort = new AbortController()
            controller.current = abort
            const request = ++sequence.current
            setPending(true)
            setMessage('')
            setTracks([])
            setSearched(false)
            try {
              const result = await searchTracks(q, abort.signal)
              if (sequence.current !== request) return
              setTracks(result)
              setSearched(true)
            } catch (error) {
              if (abort.signal.aborted || sequence.current !== request) return
              const code =
                error instanceof HttpError &&
                typeof error.data === 'object' &&
                error.data !== null &&
                'code' in error.data
                  ? error.data.code
                  : ''
              setMessage(
                code === 'SPOTIFY_NOT_CONFIGURED'
                  ? '음악 검색이 설정되지 않았습니다. 팀 Spotify 키 설정 후 이용할 수 있습니다.'
                  : error instanceof HttpError && error.status === 401
                    ? '로그인이 필요하거나 세션이 만료되었습니다.'
                    : error instanceof HttpError && error.status === 429
                      ? '검색 요청이 많습니다. 잠시 후 다시 시도해주세요.'
                      : '음악 검색을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.',
              )
            } finally {
              if (sequence.current === request) setPending(false)
            }
          }}
        >
          검색
        </button>
      </div>
      <p className="spotify-search-attribution">
        Spotify 검색 · 최대 10곡 · 검색 결과에서 한 곡을 선택하세요.
      </p>
      {disabled && <p role="status">로그인 후 곡을 검색할 수 있습니다.</p>}
      {pending && <p role="status">Spotify에서 곡을 찾고 있습니다…</p>}
      {message && <p role="alert">{message}</p>}
      {searched && !tracks.length && (
        <p role="status">
          검색 결과가 없습니다. 다른 곡 제목이나 가수로 검색해주세요.
        </p>
      )}
      <ul>
        {tracks.map((track) => (
          <li key={track.id}>
            {track.imageUrl ? (
              <img
                src={track.imageUrl}
                alt={`${track.albumName} 앨범 표지`}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span aria-hidden="true">♫</span>
            )}
            <div>
              <strong>{track.name}</strong>
              <p>
                {track.artists.join(', ')} · {track.albumName}
              </p>
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Spotify에서 보기
              </a>
            </div>
            <button
              type="button"
              aria-pressed={selectedId === track.id}
              onClick={() => onSelect(track)}
            >
              {selectedId === track.id ? '선택됨' : '이 곡 선택'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
