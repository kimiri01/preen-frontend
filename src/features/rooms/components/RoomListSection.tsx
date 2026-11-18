import { useMemo, useState } from 'react'
import type { Room } from '../types'
import { RoomCard } from './RoomCard'
import '../rooms.css'

export function RoomListSection({
  rooms,
  guestCount,
  onSelectRoom,
}: {
  rooms: Room[]
  guestCount?: number
  onSelectRoom?: (room: Room) => void
}) {
  const [audioOnly, setAudioOnly] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const audioCount = rooms.filter((room) => room.audio).length
  const [order, setOrder] = useState('default')
  const sorted = useMemo(() => {
    const result = audioOnly ? rooms.filter((room) => room.audio) : [...rooms]
    if (order === 'price-asc')
      result.sort((a, b) => Number(a.nightlyPrice) - Number(b.nightlyPrice))
    if (order === 'price-desc')
      result.sort((a, b) => Number(b.nightlyPrice) - Number(a.nightlyPrice))
    if (order === 'capacity')
      result.sort((a, b) => b.maxCapacity - a.maxCapacity)
    return result
  }, [rooms, order, audioOnly])
  return (
    <section className="rooms-section" aria-labelledby="room-list-heading">
      <div className="room-section-top">
        <div>
          <h2 id="room-list-heading">객실별 가격 · 예약 가능 여부</h2>
          <p>공간과 인원을 비교하고, 나에게 맞는 객실을 살펴보세요.</p>
        </div>
        <span className="room-count">
          객실 {sorted.length}개{audioOnly && ` / 전체 ${rooms.length}개`}
        </span>
      </div>
      {guestCount !== undefined && (
        <p className="room-capacity-summary" role="status">
          성인 {guestCount}명 정원 충족 객실 유형{' '}
          {rooms.filter((room) => room.maxCapacity >= guestCount).length}개 /
          전체 {rooms.length}개
          <small>
            객실 정원 기준 안내이며, 선택 날짜의 실제 빈방 수는 아닙니다.
          </small>
        </p>
      )}
      {sorted.length === 0 ? (
        <p className="room-state" role="status">
          {audioOnly
            ? '오디오가 구비된 객실이 없습니다. 필터를 해제하고 다른 객실을 확인해주세요.'
            : '현재 안내 가능한 객실이 없습니다.'}
        </p>
      ) : (
        <div className="room-list">
          {(showAll || audioOnly ? sorted : sorted.slice(0, 2)).map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              guestCount={guestCount}
              onSelectRoom={onSelectRoom}
            />
          ))}
        </div>
      )}
      {!audioOnly && sorted.length > 2 && (
        <button
          type="button"
          className="room-show-more"
          aria-expanded={showAll}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll
            ? '기본 객실만 보기'
            : `다른 객실 ${sorted.length - 2}개 더보기`}
        </button>
      )}
      <details className="room-comparison-options">
        <summary>객실 비교 옵션 · 정렬 및 오디오 필터</summary>
        <div className="room-audio-filter">
          <label>
            <input
              type="checkbox"
              checked={audioOnly}
              onChange={(event) => setAudioOnly(event.target.checked)}
            />{' '}
            오디오 구비 객실만 보기 <span>{audioCount}</span>
          </label>
        </div>
        <div className="room-toolbar">
          <p>
            표시된 금액은 <strong>기본 1박 요금</strong>입니다.
          </p>
          <label>
            정렬{' '}
            <select
              value={order}
              onChange={(event) => setOrder(event.target.value)}
            >
              <option value="default">기본순</option>
              <option value="price-asc">낮은 가격순</option>
              <option value="price-desc">높은 가격순</option>
              <option value="capacity">최대 인원 많은순</option>
            </select>
          </label>
        </div>
      </details>
      <aside className="room-notice">
        <h3>객실 선택 전 확인해주세요</h3>
        <ul>
          <li>
            기준 인원은 기본 요금에 포함되는 인원이며, 초과 인원에는 추가 요금이
            적용됩니다.
          </li>
          <li>
            날짜별 판매가격과 잔여 객실은 이 화면의 기본정보와 다를 수 있습니다.
          </li>
          <li>
            오디오 이용은 구비 객실의 안내 시간을 따라주세요. 다른 투숙객을 위해
            적정 음량을 유지해주세요.
          </li>
          <li>
            사진을 누르면 크게 볼 수 있습니다. 사진이 없는 객실은 안내 이미지로
            표시됩니다.
          </li>
        </ul>
      </aside>
    </section>
  )
}
