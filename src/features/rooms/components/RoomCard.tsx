import { useEffect, useId, useRef, useState } from 'react'
import type { Room } from '../types'
import { RoomSpotifyPlayer } from './RoomSpotifyPlayer'

function safeImage(value: string) {
  if (
    value.startsWith('/images/') &&
    !value.includes('\\') &&
    !value.includes('..')
  )
    return value
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' && !url.username && !url.password)
      return url.href
  } catch {
    /* Unsupported image URL. */
  }
  return null
}
const bedNames: Record<string, string> = {
  SINGLE: '싱글',
  SUPER_SINGLE: '슈퍼싱글',
  DOUBLE: '더블',
  QUEEN: '퀸',
  KING: '킹',
  BUNK: '이층 침대',
  FLOOR_BEDDING: '침구 세트',
}
const money = (value: string) =>
  Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 2 })

export function RoomCard({
  room,
  onSelectRoom,
}: {
  room: Room
  onSelectRoom?: (room: Room) => void
}) {
  const facilities = room.facilities ?? []
  const bedSummary = (room.beds ?? [])
    .map((bed) => `${bedNames[bed.type] ?? bed.type} ${bed.count}개`)
    .join(' · ')
  const [failedImages, setFailedImages] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const images = room.images.flatMap((image) => {
    const url = safeImage(image.imageUrl)
    return url ? [{ ...image, url }] : []
  })
  const current = images.find((image) => image.id === selected) ?? images[0]
  const hasImage = current && !failedImages.includes(current.id)
  useEffect(() => {
    const element = dialog.current
    return () => element?.close()
  }, [])
  const chooseImage = (index: number) =>
    setSelected(images[(index + images.length) % images.length].id)
  const currentIndex = images.findIndex((image) => image.id === current?.id)
  const image = hasImage ? (
    <img
      src={current.url}
      alt={`${room.name} 사진 ${currentIndex + 1}`}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailedImages((previous) => [...previous, current.id])}
    />
  ) : (
    <div className="room-photo-empty">
      <span aria-hidden="true">▧</span>객실 이미지를 준비하고 있어요
    </div>
  )
  return (
    <article className="room-card">
      <div className="room-photo">
        {hasImage ? (
          <button
            className="room-photo-open"
            type="button"
            onClick={() => dialog.current?.showModal()}
            aria-label={`${room.name} 사진 크게 보기`}
          >
            {image}
            <span className="room-photo-count">
              사진 {currentIndex + 1} / {images.length} ↗
            </span>
          </button>
        ) : (
          image
        )}
        {images.length > 1 && (
          <div
            className="room-photo-controls"
            aria-label={`${room.name} 사진 선택`}
          >
            {images.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={current?.id === item.id}
                onClick={() => setSelected(item.id)}
              >
                사진 {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="room-details">
        <div className="room-card-labels">
          <span className="room-eyebrow">ROOM</span>
          {room.audio && (
            <span className="room-audio-badge">♫ 오디오 기본 구비</span>
          )}
        </div>
        <h3>{room.name}</h3>
        <p className="room-summary-line">
          기준 {room.capacity}인 · 최대 {room.maxCapacity}인
          {bedSummary && ` · ${bedSummary}`}
          {room.areaSqm && ` · ${Number(room.areaSqm)}㎡`}
        </p>
        <p className="room-booking-status">일정 선택 후 예약 가능 여부 확인</p>
        <details className="room-more">
          <summary>
            객실 스펙 · 편의시설{room.audio ? ' · Spotify' : ''} 보기
          </summary>
          <p className="room-extra">
            추가 인원 1인·1박 {money(room.extraPersonFee)}원
          </p>
          {facilities.length > 0 && (
            <ul
              className="room-facility-tags"
              aria-label={`${room.name} 편의시설`}
            >
              {facilities.slice(0, 4).map((facility) => (
                <li key={facility.code}>{facility.name}</li>
              ))}
              {facilities.length > 4 && <li>+{facilities.length - 4}</li>}
            </ul>
          )}
          {room.audio && (
            <RoomSpotifyPlayer
              recommendedTrackId={room.audio.spotifyTrackId}
              roomName={room.name}
            />
          )}
          {room.audio && (
            <details className="room-audio-info">
              <summary>
                <span>음악이 있는 객실</span>
                <span>이용 안내 ＋</span>
              </summary>
              <div className="room-audio-body">
                <p className="room-audio-included">
                  객실 요금에 포함 · 별도 신청 없이 이용
                </p>
                <h4>{room.audio.equipmentName}</h4>
                <dl>
                  <div>
                    <dt>연결 방법</dt>
                    <dd>{room.audio.connectionGuide}</dd>
                  </div>
                  <div>
                    <dt>이용 시간</dt>
                    <dd>
                      {room.audio.availableFrom}–{room.audio.availableUntil}
                    </dd>
                  </div>
                </dl>
                <p>{room.audio.volumeGuide}</p>
              </div>
            </details>
          )}
          <details className="room-specs">
            <summary>객실 정보 자세히 보기</summary>
            <dl>
              <div>
                <dt>객실 종류</dt>
                <dd>{room.roomType ?? '정보 준비 중'}</dd>
              </div>
              <div>
                <dt>객실 면적</dt>
                <dd>
                  {room.areaSqm
                    ? `${Number(room.areaSqm).toLocaleString('ko-KR')}㎡`
                    : '정보 준비 중'}
                </dd>
              </div>
              <div>
                <dt>침대·침구</dt>
                <dd>{bedSummary || '정보 준비 중'}</dd>
              </div>
              <div>
                <dt>기본 요금 포함 인원</dt>
                <dd>{room.capacity}명</dd>
              </div>
              <div>
                <dt>최대 투숙 인원</dt>
                <dd>{room.maxCapacity}명</dd>
              </div>
              <div>
                <dt>추가 인원 요금</dt>
                <dd>1인·1박 {money(room.extraPersonFee)}원</dd>
              </div>
            </dl>
            <div className="room-facility-detail">
              <h4>객실 편의시설</h4>
              {facilities.length ? (
                <ul>
                  {facilities.map((facility) => (
                    <li key={facility.code}>{facility.name}</li>
                  ))}
                </ul>
              ) : (
                <p>등록된 편의시설 정보가 없습니다.</p>
              )}
            </div>
            <p>
              기준 인원을 초과하면 추가 인원 요금이 적용됩니다. 최대 인원을
              초과하여 투숙할 수 없습니다.
            </p>
          </details>
        </details>
      </div>
      <div className="room-pricing">
        <p className="room-price-label">기본 1박 요금</p>
        <p className="room-price">
          {money(room.nightlyPrice)}
          <span>원 / 1박</span>
        </p>
        <button
          className="room-reserve-button"
          type="button"
          disabled={!onSelectRoom}
          onClick={() => onSelectRoom?.(room)}
        >
          {onSelectRoom ? '객실 선택' : '일정 선택 후 예약'}
        </button>
        <p className="room-price-note">
          날짜별 최종 요금과
          <br />
          예약 가능 여부는 별도 확인
        </p>
      </div>
      <dialog
        ref={dialog}
        className="room-dialog"
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close()
        }}
      >
        <div className="room-dialog-heading">
          <h3 id={titleId}>{room.name}</h3>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="사진 크게 보기 닫기"
          >
            닫기 ×
          </button>
        </div>
        <div className="room-dialog-image">{image}</div>
        {images.length > 1 && (
          <div className="room-dialog-nav">
            <button type="button" onClick={() => chooseImage(currentIndex - 1)}>
              ← 이전 사진
            </button>
            <span>
              {currentIndex + 1} / {images.length}
            </span>
            <button type="button" onClick={() => chooseImage(currentIndex + 1)}>
              다음 사진 →
            </button>
          </div>
        )}
      </dialog>
    </article>
  )
}
