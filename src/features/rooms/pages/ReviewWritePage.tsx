import { useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { HttpError } from '@/common/api/http'
import {
  createReview,
  getReviewContext,
  getReviewReservations,
  type CreatedReview,
} from '../api/reviewWriteApi'
import { isValidStayId } from '../hooks/useRooms'
import { spotifyTrackId } from '../utils/spotifyTrack'
import '../rooms.css'

function failureMessage(error: unknown) {
  if (error instanceof HttpError) {
    if (error.status === 401)
      return '로그인 사용자 확인이 필요합니다. 로그인 기능 연결 후 등록할 수 있습니다.'
    if (error.status === 403)
      return '인증 또는 보안 토큰을 확인하지 못했습니다. 로그인 상태를 확인하고 다시 시도해주세요.'
    if (error.status === 404) return '본인 예약을 찾을 수 없습니다.'
    if (error.status === 409)
      return '이미 리뷰를 작성했거나 이용이 완료되지 않은 예약입니다. 예약 상태를 다시 확인해주세요.'
    if (error.status === 400) return '별점과 선택한 Spotify 곡을 확인해주세요.'
  }
  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.'
}
export function ReviewWritePage() {
  const params = useParams()
  return (
    <ReviewWriteForm
      key={`${params.reservationId ?? ''}:${params.accommodationId ?? ''}`}
    />
  )
}
function ReviewWriteForm() {
  const { accommodationId = '', reservationId = '' } = useParams()
  const [params] = useSearchParams()
  const client = useQueryClient()
  const [selectedReservation, setSelectedReservation] = useState('')
  const [rating, setRating] = useState(0)
  const [input, setInput] = useState('')
  const [track, setTrack] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<CreatedReview | null>(null)
  const lock = useRef(false)
  const direct = Boolean(reservationId)
  const valid = isValidStayId(direct ? reservationId : accommodationId)
  const reservations = useQuery({
    queryKey: [
      'review-write-context',
      direct ? 'reservation' : 'accommodation',
      direct ? reservationId : accommodationId,
    ],
    queryFn: async ({ signal }) =>
      direct
        ? [await getReviewContext(reservationId, signal)]
        : getReviewReservations(accommodationId, signal),
    enabled: valid,
    retry: false,
  })
  const contexts = reservations.data ?? []
  const selected =
    contexts.find((item) => item.reservationId === selectedReservation) ??
    (contexts.length === 1 ? contexts[0] : undefined)
  const canSave = Boolean(
    selected?.eligible &&
    rating &&
    track &&
    !saving &&
    !created &&
    !reservations.isError,
  )
  const backId = selected?.accommodationId ?? accommodationId
  const backParams = new URLSearchParams(params)
  backParams.set('tab', 'music')
  backParams.delete('rating')
  backParams.delete('reviewPage')
  backParams.delete('reviewSort')
  const backPath = isValidStayId(backId)
    ? `/accommodations/${backId}?${backParams}`
    : '/'
  return (
    <main className="rooms-page stay-detail review-write-page">
      <Link className="room-list-back" to={backPath}>
        ← 음악 리뷰로
      </Link>
      <p className="stay-kicker">별점과 한 곡으로 남기는 머무름</p>
      <h1>음악 리뷰 작성</h1>
      <p>
        이용한 숙소의 분위기를 별점과 Spotify 음악 한 곡으로 남겨주세요. 글·사진
        리뷰는 작성하지 않습니다.
      </p>
      {!valid ? (
        <p role="alert">올바른 숙소 또는 예약 주소가 아닙니다.</p>
      ) : reservations.isPending ? (
        <p role="status">작성 가능한 본인 예약을 확인하고 있습니다…</p>
      ) : reservations.isError ? (
        <aside className="review-write-notice" role="status">
          <p>{failureMessage(reservations.error)}</p>
          <p>
            아래에서 별점과 곡 선택을 미리 확인할 수 있습니다. 예약 확인 전에는
            저장되지 않습니다.
          </p>
          <button type="button" onClick={() => void reservations.refetch()}>
            예약 확인 다시 시도
          </button>
        </aside>
      ) : contexts.length === 0 ? (
        <p role="status">
          이 숙소에서 아직 리뷰를 작성하지 않은 이용 완료 예약이 없습니다.
        </p>
      ) : null}
      {created ? (
        <section className="review-write-success" role="status">
          <h2>음악 리뷰가 등록되었습니다.</h2>
          <p>별점 {created.rating}점과 선택한 곡을 저장했습니다.</p>
          <Link to={`/accommodations/${created.accommodationId}?${backParams}`}>
            등록된 음악 리뷰 보기 →
          </Link>
        </section>
      ) : (
        <form
          className="review-write-form"
          onSubmit={async (event) => {
            event.preventDefault()
            if (lock.current) return
            if (!canSave || !selected || !track) {
              setNotice(
                '이용 완료된 본인 예약, 별점, Spotify 곡을 모두 확인해주세요.',
              )
              return
            }
            lock.current = true
            setSaving(true)
            setNotice('')
            try {
              const result = await createReview({
                reservationId: selected.reservationId,
                rating,
                spotifyTrackId: track,
              })
              setCreated(result)
              await client.invalidateQueries({
                queryKey: ['music-reviews', result.accommodationId],
              })
              await client.invalidateQueries({
                queryKey: ['music-review-tracks', result.accommodationId],
              })
              await client.invalidateQueries({
                queryKey: ['review-write-context'],
              })
            } catch (error) {
              setNotice(failureMessage(error))
              if (error instanceof HttpError && error.status === 409)
                void reservations.refetch()
            } finally {
              lock.current = false
              setSaving(false)
            }
          }}
        >
          <fieldset disabled={saving}>
            <legend>이용한 예약</legend>
            {contexts.length > 1 && (
              <label>
                리뷰를 남길 예약
                <select
                  value={selectedReservation}
                  onChange={(event) => {
                    setSelectedReservation(event.target.value)
                    setNotice('')
                  }}
                >
                  <option value="">예약 선택</option>
                  {contexts.map((item) => (
                    <option key={item.reservationId} value={item.reservationId}>
                      {item.roomName} · {item.checkOut} 이용 완료
                    </option>
                  ))}
                </select>
              </label>
            )}
            {selected ? (
              <div className="review-write-booking">
                <strong>
                  {selected.accommodationName} · {selected.roomName}
                </strong>
                <p>
                  {selected.checkIn} — {selected.checkOut}
                </p>
                <p>
                  {selected.eligible
                    ? '이용 완료 · 리뷰 작성 가능'
                    : selected.reasonCode === 'ALREADY_REVIEWED'
                      ? '이미 리뷰를 작성한 예약입니다.'
                      : '이용이 완료된 예약만 작성할 수 있습니다.'}
                </p>
              </div>
            ) : (
              <p>로그인 후 이용 완료된 본인 예약을 선택해주세요.</p>
            )}
          </fieldset>
          <fieldset disabled={saving}>
            <legend>이번 숙박은 어떠셨나요?</legend>
            <div
              className="review-write-stars"
              role="radiogroup"
              aria-label="리뷰 별점"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} data-selected={value <= rating}>
                  <input
                    type="radio"
                    name="review-rating"
                    value={value}
                    checked={rating === value}
                    onChange={() => {
                      setRating(value)
                      setNotice('')
                    }}
                  />
                  <span aria-hidden="true">★</span>
                  <span>{value}점</span>
                </label>
              ))}
            </div>
            <p role="status">
              {rating
                ? `${rating}점을 선택했습니다.`
                : '별점을 1~5점 중 선택해주세요.'}
            </p>
          </fieldset>
          <fieldset disabled={saving}>
            <legend>머무름에 어울리는 한 곡</legend>
            <label htmlFor="review-track">Spotify 곡 링크 또는 트랙 ID</label>
            <input
              id="review-track"
              type="text"
              maxLength={500}
              value={input}
              placeholder="https://open.spotify.com/track/…"
              onChange={(event) => {
                setInput(event.target.value)
                setTrack(null)
                setNotice('')
              }}
            />
            <button
              type="button"
              onClick={() => {
                const id = spotifyTrackId(input)
                setTrack(id)
                setNotice(
                  id
                    ? ''
                    : 'Spotify의 개별 곡 링크 또는 영문·숫자 22자 트랙 ID를 입력해주세요.',
                )
              }}
            >
              이 곡 선택
            </button>
            <p>
              Spotify에서 곡의 ‘공유 → 링크 복사’를 사용할 수 있습니다. 곡 검색
              기능은 담당 기능 연결 후 제공됩니다.
            </p>
            {track && (
              <div className="review-write-preview">
                <p role="status">리뷰에 남길 곡 1개를 선택했습니다.</p>
                <iframe
                  key={track}
                  title="리뷰에 선택한 Spotify 곡"
                  src={`https://open.spotify.com/embed/track/${track}`}
                  width="100%"
                  height="152"
                  allow="encrypted-media; fullscreen; picture-in-picture"
                  referrerPolicy="no-referrer"
                  allowFullScreen
                />
                <button
                  type="button"
                  onClick={() => {
                    setTrack(null)
                    setInput('')
                  }}
                >
                  곡 선택 취소
                </button>
              </div>
            )}
          </fieldset>
          {notice && (
            <p className="review-write-error" role="alert">
              {notice}
            </p>
          )}
          <p>
            예약당 리뷰는 한 번만 등록할 수 있습니다. 저장하는 정보는 별점과 곡
            ID입니다.
          </p>
          <button
            type="submit"
            className="review-write-submit"
            disabled={!canSave}
          >
            {saving ? '등록 중…' : '음악 리뷰 등록'}
          </button>
          {!selected?.eligible && (
            <p>로그인 사용자·이용 완료 예약 확인 후 등록할 수 있습니다.</p>
          )}
        </form>
      )}
    </main>
  )
}
