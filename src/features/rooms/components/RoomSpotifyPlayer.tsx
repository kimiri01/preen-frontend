import { useId, useState } from 'react'

function trackId(value: string): string | null {
  const text = value.trim()
  if (/^[a-zA-Z0-9]{22}$/.test(text)) return text
  try {
    const url = new URL(text)
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'open.spotify.com' ||
      url.username ||
      url.password
    )
      return null
    return (
      url.pathname.match(
        /^\/(?:intl-[a-z]{2}\/)?track\/([a-zA-Z0-9]{22})\/?$/,
      )?.[1] ?? null
    )
  } catch {
    return null
  }
}
export function RoomSpotifyPlayer({
  recommendedTrackId,
  roomName,
}: {
  recommendedTrackId: string | null
  roomName: string
}) {
  const [opened, setOpened] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const inputId = useId()
  const errorId = useId()
  const current = selected ?? trackId(recommendedTrackId ?? '')
  return (
    <section className="room-spotify" aria-label={`${roomName} Spotify 감상`}>
      <div className="room-spotify-title">
        <span>Spotify로 듣는 이 공간</span>
        <span>Spotify</span>
      </div>
      <p>
        숙소 추천 곡을 감상하거나 원하는 Spotify 곡으로 바꿔보세요. 재생 중인
        기기를 객실 오디오와 연결하면 스피커로 들을 수 있어요.
      </p>
      {current && !opened && (
        <button
          type="button"
          className="room-spotify-open"
          onClick={() => setOpened(true)}
        >
          Spotify 플레이어 열기 ↗
        </button>
      )}
      {current && opened && (
        <div className="room-spotify-embed">
          <iframe
            key={current}
            title={`${roomName} Spotify 플레이어`}
            src={`https://open.spotify.com/embed/track/${current}`}
            width="100%"
            height="152"
            allow="encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <a
            href={`https://open.spotify.com/track/${current}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Spotify에서 곡 열기 ↗
          </a>
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const id = trackId(input)
          if (!id) {
            setError('Spotify에서 곡의 공유 링크를 복사해 입력해주세요.')
            return
          }
          setSelected(id)
          setOpened(true)
          setError('')
        }}
      >
        <label htmlFor={inputId}>다른 곡 듣기 · Spotify 곡 링크</label>
        <div className="room-spotify-input">
          <input
            id={inputId}
            type="text"
            value={input}
            onChange={(event) => {
              setInput(event.target.value)
              setError('')
            }}
            placeholder="https://open.spotify.com/track/…"
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
          />
          <button type="submit">곡 변경</button>
        </div>
        {error && (
          <p className="room-spotify-error" id={errorId} role="alert">
            {error}
          </p>
        )}
      </form>
      <small>
        음악은 직접 재생해주세요. 재생 범위는 Spotify 로그인 상태와 이용 조건에
        따라 달라질 수 있습니다.
      </small>
    </section>
  )
}
