import {
  addDays,
  isIsoDate,
  nightsBetween,
  todayKst,
  upcomingWeekend,
} from '@/common/utils/date'
import { validateStaySelection, roomGuestLimit } from '../utils/staySelection'
import { addRecentlyViewed } from '@/features/accommodation/hooks/useRecentlyViewed'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  accommodationListPath,
  parseSearchConditions,
} from '@/features/accommodation/hooks/useSearchConditions'
import {
  MusicReviewSection,
  useMusicReviews,
} from '../components/MusicReviewSection'
import { HttpError } from '@/common/api/http'
import { RoomListSection } from '../components/RoomListSection'
import { isValidStayId, useRooms } from '../hooks/useRooms'
import '../rooms.css'

export function RoomListPage() {
  const { accommodationId = '' } = useParams()
  const query = useRooms(accommodationId)
  const [searchParams, setSearchParams] = useSearchParams()
  const musicTab = searchParams.get('tab') === 'music'
  const reviewSummary = useMusicReviews(accommodationId)
  const changeTab = (music: boolean) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      if (music) next.set('tab', 'music')
      else next.delete('tab')
      return next
    })
  }
  const [today, setToday] = useState(todayKst)
  useEffect(() => {
    const timer = window.setInterval(() => setToday(todayKst()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  const rawIn = searchParams.get('checkIn')
  const rawOut = searchParams.get('checkOut')
  const checkIn = isIsoDate(rawIn) ? rawIn : ''
  const checkOut = isIsoDate(rawOut) ? rawOut : ''
  const maxGuests = roomGuestLimit(query.data?.rooms ?? [])
  const guests =
    searchParams.get('guestCount') ?? String(Math.min(2, maxGuests))
  const updateConditions = (patch: Record<string, string>) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [key, value] of Object.entries(patch)) {
          if (value) next.set(key, value)
          else next.delete(key)
        }
        return next
      },
      { replace: true },
    )
  }
  const setCheckIn = (value: string) =>
    updateConditions({
      checkIn: value,
      ...(!value || (checkOut && checkOut <= value) ? { checkOut: '' } : {}),
    })
  const setCheckOut = (value: string) => updateConditions({ checkOut: value })
  const setGuests = (value: string) => updateConditions({ guestCount: value })
  const selectionError = validateStaySelection(
    checkIn,
    checkOut,
    guests,
    today,
    maxGuests,
  )
  const [selectionMessage, setSelectionMessage] = useState('')
  const schedule = !selectionError
    ? `${checkIn} — ${checkOut} · ${nightsBetween(checkIn, checkOut)}박 · 성인 ${guests}명`
    : ''
  useEffect(() => {
    const id = Number(accommodationId)
    if (query.data && Number.isSafeInteger(id) && id > 0) addRecentlyViewed(id)
  }, [accommodationId, query.data?.accommodationId])
  const listPath = accommodationListPath(parseSearchConditions(searchParams))
  const [copyMessage, setCopyMessage] = useState('')
  useEffect(() => setCopyMessage(''), [accommodationId])
  const list = useRef<HTMLElement>(null)
  let message = ''
  if (!isValidStayId(accommodationId)) message = '올바른 숙소 주소가 아닙니다.'
  else if (query.isError)
    message =
      query.error instanceof HttpError && query.error.status === 404
        ? '숙소를 찾을 수 없거나 현재 공개되지 않은 숙소입니다.'
        : '객실 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
  const stay = query.data
  const address =
    stay?.address === '학습용 가상 주소'
      ? '주소 안내를 준비하고 있습니다.'
      : stay?.address
  const photos = [
    ...new Set(
      stay?.images?.length
        ? stay.images.map((image) => image.imageUrl)
        : (stay?.rooms.flatMap((room) =>
            room.images.map((image) => image.imageUrl),
          ) ?? []),
    ),
  ]
    .filter(
      (url) =>
        (url.startsWith('/images/') &&
          !url.includes('..') &&
          !url.includes('\\')) ||
        /^https:\/\//.test(url),
    )
    .slice(0, 3)
  const minPrice = stay?.rooms.length
    ? Math.min(...stay.rooms.map((room) => Number(room.nightlyPrice)))
    : null
  const facilities = [
    ...new Set(
      stay?.rooms.flatMap((room) => room.facilities.map((item) => item.name)) ??
        [],
    ),
  ]
  return (
    <main className="rooms-page stay-detail">
      <Link className="room-list-back" to={listPath}>
        ← 숙소 목록으로
      </Link>
      {message ? (
        <section className="room-state" role="alert">
          <p>{message}</p>
          {query.isError &&
            !(query.error instanceof HttpError && query.error.status < 500) && (
              <button type="button" onClick={() => void query.refetch()}>
                다시 시도
              </button>
            )}
        </section>
      ) : query.isPending ? (
        <p className="room-state" role="status">
          객실 정보를 불러오고 있어요…
        </p>
      ) : (
        stay && (
          <>
            <section className="stay-title">
              <p className="stay-kicker">
                Must {musicTab ? '13' : '12'} / 게스트
              </p>
              <div>
                <h1>{stay.accommodationName}</h1>
                {minPrice !== null && (
                  <p>
                    1박 {minPrice.toLocaleString('ko-KR')}원부터
                    <small>기본 객실 요금 · 날짜별 요금 별도 확인</small>
                  </p>
                )}
              </div>
              <p className="stay-address">{address}</p>
            </section>
            <section
              className="stay-search"
              aria-labelledby="stay-search-title"
            >
              <div className="stay-search-heading">
                <h2 id="stay-search-title">숙박 일정과 인원을 선택하세요</h2>
                <span>성인 {guests}명 · 객실 1개</span>
              </div>
              <div
                className="stay-quick-options"
                role="group"
                aria-label="빠른 일정 선택"
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectionMessage('')
                    updateConditions({
                      checkIn: today,
                      checkOut: addDays(today, 1),
                    })
                  }}
                >
                  오늘부터 1박
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectionMessage('')
                    updateConditions(upcomingWeekend(today))
                  }}
                >
                  이번 주말
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectionMessage('')
                    updateConditions({
                      checkIn: '',
                      checkOut: '',
                      guestCount: '',
                    })
                  }}
                >
                  날짜·인원 초기화
                </button>
              </div>
              <form
                noValidate
                aria-describedby="stay-selection-feedback"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (selectionError) {
                    setSelectionMessage(selectionError)
                    return
                  }
                  setSelectionMessage(
                    '선택한 일정과 인원을 반영했습니다. 객실 정보를 확인해주세요.',
                  )
                  changeTab(false)
                  requestAnimationFrame(() =>
                    list.current?.scrollIntoView({ behavior: 'smooth' }),
                  )
                }}
              >
                <label>
                  체크인
                  <input
                    type="date"
                    required
                    min={today}
                    aria-invalid={Boolean(checkIn && checkIn < today)}
                    value={checkIn}
                    onChange={(event) => {
                      setSelectionMessage('')
                      setCheckIn(event.target.value)
                    }}
                  />
                </label>
                <label>
                  체크아웃
                  <input
                    type="date"
                    required
                    min={addDays(
                      checkIn && checkIn >= today ? checkIn : today,
                      1,
                    )}
                    disabled={!checkIn || checkIn < today}
                    aria-invalid={Boolean(checkOut && checkOut <= checkIn)}
                    value={checkOut}
                    onChange={(event) => {
                      setSelectionMessage('')
                      setCheckOut(event.target.value)
                    }}
                  />
                </label>
                <div className="stay-guest-field">
                  <label htmlFor="stay-guest-count">인원 (객실 1개)</label>
                  <div className="stay-guest-stepper">
                    <button
                      type="button"
                      aria-label="인원 줄이기"
                      disabled={Number(guests) <= 1}
                      onClick={() => {
                        setSelectionMessage('')
                        setGuests(
                          String(
                            Math.max(
                              1,
                              Math.min(maxGuests, (Number(guests) || 2) - 1),
                            ),
                          ),
                        )
                      }}
                    >
                      −
                    </button>
                    <input
                      id="stay-guest-count"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={maxGuests}
                      step={1}
                      value={guests}
                      aria-describedby="stay-guest-help"
                      aria-invalid={Number(guests) > maxGuests}
                      onChange={(event) => {
                        setSelectionMessage('')
                        updateConditions({ guestCount: event.target.value })
                      }}
                    />
                    <button
                      type="button"
                      aria-label="인원 늘리기"
                      disabled={Number(guests) >= maxGuests}
                      onClick={() => {
                        setSelectionMessage('')
                        setGuests(
                          String(
                            Math.min(
                              maxGuests,
                              Math.max(1, (Number(guests) || 0) + 1),
                            ),
                          ),
                        )
                      }}
                    >
                      +
                    </button>
                  </div>
                  <small id="stay-guest-help">
                    성인 1~{maxGuests}명 · 객실별 최대 정원 기준
                  </small>
                </div>
                <button
                  type="submit"
                  title="날짜별 재고 조회 없이 선택 조건을 반영합니다"
                >
                  선택 조건 적용
                </button>
              </form>
              <p
                id="stay-selection-feedback"
                role="status"
                aria-live="polite"
                className="stay-selection-feedback"
              >
                {selectionError || selectionMessage}
              </p>
              {!selectionError && (
                <p className="stay-selected-summary">{schedule}</p>
              )}
              <p className="stay-search-note">
                일정 선택은 비교용이며, 날짜별 재고·총액 조회는 예약 기능 연결
                후 제공됩니다.
              </p>
            </section>
            {!musicTab && photos.length > 0 && (
              <div className="stay-gallery" data-count={photos.length}>
                {photos.map((photo, index) => (
                  <img
                    key={photo}
                    src={photo}
                    alt={`${stay.accommodationName} 숙소 사진 ${index + 1}`}
                    referrerPolicy="no-referrer"
                    onError={(event) => {
                      event.currentTarget.style.visibility = 'hidden'
                    }}
                  />
                ))}
              </div>
            )}
            <nav className="stay-tabs" aria-label="숙소 상세 메뉴">
              <button
                type="button"
                onClick={() => {
                  changeTab(false)
                  requestAnimationFrame(() =>
                    document
                      .getElementById('stay-intro')
                      ?.scrollIntoView({ behavior: 'smooth' }),
                  )
                }}
              >
                숙소 소개
              </button>
              <button
                type="button"
                onClick={() => {
                  changeTab(false)
                  requestAnimationFrame(() =>
                    document
                      .getElementById('stay-facilities')
                      ?.scrollIntoView({ behavior: 'smooth' }),
                  )
                }}
              >
                시설·서비스
              </button>
              <button
                type="button"
                aria-current={!musicTab ? 'page' : undefined}
                onClick={() => changeTab(false)}
              >
                객실 선택
              </button>
              <button
                type="button"
                onClick={() => {
                  changeTab(false)
                  requestAnimationFrame(() =>
                    document
                      .getElementById('stay-location')
                      ?.scrollIntoView({ behavior: 'smooth' }),
                  )
                }}
              >
                위치·이용 안내
              </button>
              <button
                type="button"
                aria-current={musicTab ? 'page' : undefined}
                onClick={() => changeTab(true)}
              >
                음악 리뷰
                {reviewSummary.data ? ` ${reviewSummary.data.total}` : ''}
              </button>
            </nav>
            {musicTab ? (
              <MusicReviewSection
                key={accommodationId}
                accommodationId={accommodationId}
                onBack={() => changeTab(false)}
              />
            ) : (
              <>
                <section
                  id="stay-rooms"
                  ref={list}
                  className="stay-room-anchor"
                >
                  {schedule && (
                    <p className="stay-schedule" role="status">
                      선택 일정 {schedule} · 기본 1박 요금 표시
                    </p>
                  )}
                  <RoomListSection
                    key={accommodationId}
                    rooms={stay.rooms}
                    guestCount={
                      Number.isInteger(Number(guests)) && Number(guests) > 0
                        ? Number(guests)
                        : undefined
                    }
                  />
                </section>
                <section id="stay-intro" className="stay-info">
                  <h2>{stay.accommodationName}에서 머무는 시간</h2>
                  <p>{stay.description || '숙소 소개를 준비하고 있습니다.'}</p>
                  <dl className="stay-overview-grid">
                    <div>
                      <dt>숙박 유형</dt>
                      <dd>{stay.categoryName || '안내 준비 중'}</dd>
                    </div>
                    <div>
                      <dt>지역</dt>
                      <dd>{stay.regionName || '안내 준비 중'}</dd>
                    </div>
                    <div>
                      <dt>기준 / 최대 인원</dt>
                      <dd>
                        {stay.rooms[0]
                          ? `${stay.rooms[0].capacity}명 / ${stay.rooms[0].maxCapacity}명`
                          : '안내 준비 중'}
                      </dd>
                    </div>
                    <div>
                      <dt>호스트</dt>
                      <dd>호스트 정보 안내 준비 중</dd>
                    </div>
                  </dl>
                  <div
                    id="stay-facilities"
                    className="stay-facility-row"
                    aria-label="숙소 시설"
                  >
                    <ul>
                      {facilities.map((name) => (
                        <li key={name}>
                          <span aria-hidden="true">◇</span> {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
                <section id="stay-location" className="stay-info">
                  <h2>위치 · 이용 안내</h2>
                  <div className="stay-location-grid">
                    <div>
                      <h3>{stay.accommodationName}</h3>
                      <p>{address}</p>
                      <button
                        type="button"
                        className="music-back-button"
                        disabled={!address || address.includes('준비')}
                        onClick={() => {
                          if (address)
                            void navigator.clipboard
                              .writeText(address)
                              .then(() =>
                                setCopyMessage('주소를 복사했습니다.'),
                              )
                              .catch(() =>
                                setCopyMessage(
                                  '주소를 직접 선택해 복사해주세요.',
                                ),
                              )
                        }}
                      >
                        주소 복사
                      </button>
                      <p role="status">{copyMessage}</p>
                    </div>
                    <dl>
                      <div>
                        <dt>체크인</dt>
                        <dd>{stay.checkInTime} 이후</dd>
                      </div>
                      <div>
                        <dt>체크아웃</dt>
                        <dd>{stay.checkOutTime} 이전</dd>
                      </div>
                      <div>
                        <dt>객실 내 흡연</dt>
                        <dd>숙소 정책 확인 필요</dd>
                      </div>
                      <div>
                        <dt>반려동물</dt>
                        <dd>숙소 정책 확인 필요</dd>
                      </div>
                      <div>
                        <dt>기타 안내</dt>
                        <dd>객실별 정원 및 추가 요금 확인</dd>
                      </div>
                    </dl>
                  </div>
                  <aside className="stay-policy">
                    <h3>예약 전 취소·환불 조건을 확인해주세요</h3>
                    <p>
                      취소·환불 규정은 예약 조건에 따라 달라집니다. 예약
                      기능에서 최종 정책을 확인해주세요.
                    </p>
                  </aside>
                </section>
                <section id="stay-music" className="stay-info stay-music-note">
                  <div>
                    <h2>
                      이 숙소에 남겨진 음악 리뷰{' '}
                      {reviewSummary.data?.total ?? '—'}개
                    </h2>
                    <p>
                      이용을 마친 게스트가 고른 한 곡으로 숙소의 분위기를
                      만나보세요.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="music-back-button"
                    onClick={() => changeTab(true)}
                  >
                    음악 리뷰 보기 →
                  </button>
                </section>
              </>
            )}
          </>
        )
      )}
    </main>
  )
}
