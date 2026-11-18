import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorState, LoadingBlock } from '@/common/components/StatusViews'
import { getErrorMessage, statusOf } from '@/common/utils/error'
import {
  formatFullDate,
  formatPrice,
  formatRate,
  formatShortDate,
} from '@/common/utils/format'
import { nightsBetween } from '@/common/utils/date'
import { reservationApi } from '@/features/reservation/api/reservationApi'
import { HoldCountdown } from '@/features/reservation/components/ReservationParts'
import { reservationErrorMessages } from '@/features/reservation/errorMessages'
import {
  isHoldExpired,
  useHoldRemaining,
  useInvalidateReservations,
  useReservation,
} from '@/features/reservation/hooks/useReservations'
import type { CancelResult } from '@/features/reservation/types'
import { ConfirmDialog } from '@/features/reservation/components/Dialog'
import { useToast } from '@/features/reservation/components/Toast'
import { NotFoundView } from '@/features/reservation/components/Screens'
import { MockRefundPolicyTable as RefundPolicyTable } from '@/features/reservation/mockDeps'
import { ReservationSummaryCard } from '@/features/reservation/components/Checkout'
import { useMockAccommodationDetail } from '@/features/reservation/tempUtils'
import '@/features/reservation/reservation.css'

function fullDateWithWeekdayAndTime(iso: string, time: string = '15:00') {
  if (!iso) return ''
  const dateStr = `${formatFullDate(iso)} ${formatShortDate(iso).slice(6)}`
  return `${dateStr} ${time}`
}

export function ReservationDetailPage() {
  const params = useParams()
  const id = Number(params.id)
  const valid = Number.isInteger(id) && id > 0
  const query = useReservation(valid ? id : undefined)
  const invalidate = useInvalidateReservations()
  const toast = useToast()
  const remaining = useHoldRemaining(query.data)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelResult, setCancelResult] = useState<CancelResult | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [demoReviewed, setDemoReviewed] = useState(false)
  const expired = remaining === 0
  const { refetch } = query

  // 숙소 상세 mock (체크인/아웃 시각, 주소, 이미지 등)
  const accomDetail = useMockAccommodationDetail(query.data?.accommodationId ?? 0)

  // 제한 시간이 끝나면 예약을 다시 조회한다.
  useEffect(() => {
    if (expired) void refetch()
  }, [expired, refetch])

  if (!valid) return <NotFoundView />
  if (query.isPending) return <LoadingBlock fullPage />
  if (query.isError) {
    if (statusOf(query.error) === 404)
      return <NotFoundView title="예약을 찾을 수 없습니다" />
    return (
      <main className="narrow">
        <ErrorState
          error={query.error}
          messages={reservationErrorMessages}
          onRetry={() => void refetch()}
        />
      </main>
    )
  }

  const reservation = query.data
  const wasPaid = reservation.status === 'CONFIRMED'
  const isExpired = isHoldExpired(reservation)
  const cancellable =
    reservation.status === 'CONFIRMED' ||
    (reservation.status === 'PENDING' && !isExpired)

  const checkInTime = accomDetail.data?.checkInTime?.slice(0, 5) ?? '15:00'
  const checkOutTime = accomDetail.data?.checkOutTime?.slice(0, 5) ?? '11:00'

  // 상태 텍스트 & 색상 매핑
  let statusText = '예약 확정'
  let statusColor = '#4D7764'
  if (reservation.status === 'CONFIRMED') {
    statusText = '예약 확정'
    statusColor = '#4D7764'
  } else if (reservation.status === 'COMPLETED') {
    statusText = '이용 완료'
    statusColor = 'var(--text, #30363d)'
  } else if (reservation.status === 'CANCELLED') {
    statusText = '예약 취소됨'
    statusColor = '#c5221f'
  } else if (reservation.status === 'PENDING') {
    if (isExpired) {
      statusText = '결제 시간 만료'
      statusColor = '#c5221f'
    } else {
      statusText = '결제 대기'
      statusColor = '#b06000'
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const result = await reservationApi.cancel(reservation.id)
      setCancelResult(result)
      invalidate(reservation.accommodationId)
      toast.show('예약을 취소했습니다.', 'success')
    } catch (error) {
      toast.show(getErrorMessage(error, reservationErrorMessages), 'error')
      void refetch()
    } finally {
      setCancelling(false)
      setConfirmOpen(false)
    }
  }

  // ===== Must 21: 이용 완료 예약 상세 화면 =====
  if (reservation.status === 'COMPLETED') {
    const nights = nightsBetween(reservation.checkIn, reservation.checkOut)

    return (
      <main className="reservation-detail-page">
        {/* 1. 상단 타이틀 영역 (Must 21 시안) */}
        <div className="reservation-detail-header">
          
          <h2>이용 완료 예약 상세</h2>
          <p className="muted" style={{ fontSize: '15px' }}>
            본인이 이용 완료한 예약에서만 숙소에 어울리는 한 곡을 남길 수 있어요.
          </p>
        </div>

        {/* 2. 본문 2단 영역 (좌측 상세 + 우측 요약 카드) */}
        <div className="reservation-detail-body">
          <div className="reservation-detail-main">
            {/* 시스템 자동 전환 배너 */}
            <div className="checkout-note" style={{ width: '100%', margin: 0 }}>
              <strong style={{ color: '#4D7764' }}>
                시스템 자동 전환 · 예약 확정 → 이용 완료
              </strong>
              <p style={{ color: '#7B828A', fontSize: '13px', lineHeight: '22px', margin: 0 }}>
                숙소 현지 체크아웃 예정 시각 {reservation.checkOut} {checkOutTime} (Asia/Seoul)이 지나면
                시스템이 자동으로 이용 완료 처리합니다. 취소 예약은 대상에서 제외합니다.
              </p>
            </div>

            {/* 이용 완료 뱃지 & 숙소명 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span className="badge badge-ok" style={{ padding: '6px 10px', fontSize: '12px' }}>
                  이용 완료
                </span>
              </div>
              <h3 className="detail-accommodation-title" style={{ margin: 0 }}>
                {reservation.accommodationName} · {reservation.roomName}
              </h3>
            </div>

            {/* 예약 정보 행 */}
            <div className="detail-rows">
              <div>
                <span>예약번호</span>
                <strong>{reservation.reservationNo}</strong>
              </div>
              <div>
                <span>숙박 일정</span>
                <strong>
                  {formatShortDate(reservation.checkIn)} — {formatShortDate(reservation.checkOut)} · {nights}박
                </strong>
              </div>
              <div>
                <span>예약자 · 인원</span>
                <strong>
                  {reservation.guestName} · 성인 {reservation.guestCount}명
                </strong>
              </div>
              <div>
                <span>결제 금액</span>
                <strong>{formatPrice(reservation.totalPrice)}</strong>
              </div>
              <div>
                <span>취소 가능 여부</span>
                <strong>이용 완료 · 취소 불가</strong>
              </div>
            </div>

            <hr className="detail-divider" />

            {/* 음악 리뷰 섹션 (미등록 상태 vs 등록 완료 상태) */}
            {!demoReviewed ? (
              <div className="music-review-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>머문 순간을, 한 곡으로.</h3>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7b828a',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                    onClick={() => setDemoReviewed(true)}
                  >
                    등록 완료 화면 예시 보기
                  </button>
                </div>
                <p className="music-review-desc">
                  그날의 분위기에 어울리는 한 곡과 숙소에 대한 별점을 함께 남겨주세요. 텍스트
                  리뷰는 작성하지 않습니다.
                </p>
                <Link
                  to={`/reservations/${reservation.id}/review`}
                  className="btn btn-primary"
                  style={{
                    alignSelf: 'flex-start',
                    padding: '14px 22px',
                    borderRadius: '7px',
                    backgroundColor: '#30363D',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '15px',
                  }}
                >
                  음악 리뷰 남기기
                </Link>
                <div className="checkout-note" style={{ width: '100%', margin: 0 }}>
                  <strong style={{ color: '#4D7764' }}>예약 1건당 한 곡만 등록해요</strong>
                  <p style={{ color: '#7B828A', fontSize: '13px', lineHeight: '22px', margin: 0 }}>
                    본인의 이용 완료 예약에만 리뷰 남기기가 표시됩니다. 곡 1개와 별점을 선택한 뒤
                    등록하면 같은 예약 상세로 돌아옵니다.
                  </p>
                </div>
                <small style={{ color: '#7B828A', fontSize: '12px' }}>
                  본인 이용 완료 예약 상세에서만 Must 22 진입
                </small>
              </div>
            ) : (
              <div className="music-review-box reviewed">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#4D7764', fontSize: '18px', fontWeight: 600 }}>
                    등록 완료 · 동일한 예약 상세
                  </div>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7b828a',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                    onClick={() => setDemoReviewed(false)}
                  >
                    미등록 화면 예시 보기
                  </button>
                </div>
                <div className="star-rating-row">
                  <span className="star-filled">★</span>
                  <span className="star-filled">★</span>
                  <span className="star-filled">★</span>
                  <span className="star-filled">★</span>
                  <span className="star-empty">☆</span>
                  <span className="star-score-text">4점</span>
                </div>
                <small style={{ color: '#7B828A', fontSize: '13px' }}>
                  Must 22에서 등록하면 Must 21로 돌아옵니다.
                </small>
                <div className="music-track-card">
                  <div className="music-track-thumb">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  </div>
                  <div className="music-track-info">
                    <div className="music-track-title">밤편지</div>
                    <div className="music-track-artist">아이유 · Palette</div>
                  </div>
                  <div className="music-player-preview">
                    <button
                      type="button"
                      className="music-play-btn"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>
                    <div className="music-progress-wrap">
                      <div className="music-progress-bar">
                        <div
                          className="music-progress-fill"
                          style={{ width: isPlaying ? '65%' : '0%' }}
                        />
                      </div>
                      <div className="music-time-labels">
                        <span>{isPlaying ? '2:45' : '0:00'}</span>
                        <span>4:13</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p style={{ color: '#7B828A', fontSize: '13px', lineHeight: '22px', margin: 0 }}>
                  밤편지 · 아이유 | 예약 1건당 한 곡과 별점 등록 완료
                  <br />
                  등록한 예약에는 리뷰 남기기 버튼을 표시하지 않습니다.
                </p>
              </div>
            )}

            {/* 관리 버튼 */}
            <div
              className="actions"
              style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}
            >
              <Link
                className="btn"
                to={`/accommodations/${reservation.accommodationId}`}
                style={{
                  border: '1px solid var(--border)',
                  padding: '12px 22px',
                  borderRadius: '7px',
                  backgroundColor: '#fff',
                  textDecoration: 'none',
                  color: 'var(--text)',
                }}
              >
                숙소 상세 보기
              </Link>
              <Link
                className="btn"
                to="/me/reservations"
                style={{
                  border: '1px solid var(--border)',
                  padding: '12px 22px',
                  borderRadius: '7px',
                  backgroundColor: '#fff',
                  textDecoration: 'none',
                  color: 'var(--text)',
                }}
              >
                목록으로
              </Link>
            </div>
          </div>

          {/* 우측 숙소 요약 카드 재사용 */}
          <ReservationSummaryCard reservation={reservation} />
        </div>
      </main>
    )
  }

  // ===== Must 20: 일반 예약 상세 화면 (예약 확정 / 결제 대기 / 취소됨 등) =====
  return (
    <main className="reservation-detail-page">
      {/* 1. 상단 타이틀 영역 */}
      <div className="reservation-detail-header">
    
        <h2>예약 상세</h2>
        <p className="muted" style={{ fontSize: '15px' }}>
          예약번호 {reservation.reservationNo} ·{' '}
          {formatFullDate(reservation.createdAt)} 예약
        </p>
      </div>

      {/* 2. 본문 2단 영역 (좌측 상세 + 우측 요약 카드) */}
      <div className="reservation-detail-body">
        <div className="reservation-detail-main">
          {/* 상태 텍스트 */}
          <div className="detail-status-text" style={{ color: statusColor }}>
            {statusText}
          </div>

          {/* 결제 대기 카운트다운 */}
          {reservation.status === 'PENDING' && remaining !== null && (
            <HoldCountdown remaining={remaining} />
          )}

          {/* 숙소명 & 객실명 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 className="detail-accommodation-title">
              {reservation.accommodationName} · {reservation.roomName}
            </h3>
            <p className="detail-address">
              {accomDetail.data?.address ?? '주소 정보 확인 중'} · 숙소 연락처 064-000-0000
            </p>
          </div>

          <hr className="detail-divider" />

          {/* 환불 완료 안내 (취소 직후) */}
          {cancelResult && cancelResult.refundRate !== undefined && (
            <section className="checkout-note" role="status">
              <strong style={{ fontSize: '17px' }}>환불 안내</strong>
              <div className="price-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>환불 비율</span>
                <span>{formatRate(cancelResult.refundRate)}</span>
              </div>
              <div className="price-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>환불 예정 금액</span>
                <strong>{formatPrice(cancelResult.refundAmount)}</strong>
              </div>
              <div className="price-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>위약금</span>
                <span>{formatPrice(cancelResult.penaltyAmount)}</span>
              </div>
              <small className="muted">
                환불은 결제 수단으로 처리됩니다.
              </small>
            </section>
          )}

          {/* 예약 정보 행 (양 끝 정렬) */}
          <div className="detail-rows">
            <div>
              <span>체크인</span>
              <strong>{fullDateWithWeekdayAndTime(reservation.checkIn, checkInTime)}</strong>
            </div>
            <div>
              <span>체크아웃</span>
              <strong>{fullDateWithWeekdayAndTime(reservation.checkOut, checkOutTime)}</strong>
            </div>
            <div>
              <span>예약 인원</span>
              <strong>성인 {reservation.guestCount}명</strong>
            </div>
            <div>
              <span>예약자</span>
              <strong>
                {reservation.guestName}
                {reservation.guestPhone && ` · ${reservation.guestPhone}`}
              </strong>
            </div>
            <div>
              <span>결제 금액</span>
              <strong>
                {formatPrice(reservation.totalPrice)} ·{' '}
                {wasPaid ? '카드 결제 완료' : '결제 대기'}
              </strong>
            </div>
          </div>

          <hr className="detail-divider" />

          {/* 취소 및 환불 안내 */}
          <div className="refund-section">
            <h4>취소 및 환불 안내</h4>
            {reservation.refundPolicy?.policyText ? (
              <p className="refund-highlight">{reservation.refundPolicy.policyText}</p>
            ) : (
              <p className="refund-highlight">체크인 7일 전까지 전액 환불</p>
            )}
            <p>이후 취소 시 숙소 규정에 따른 취소 수수료가 발생합니다.</p>
          </div>

          {/* 관리 버튼 */}
          <div className="actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {cancellable && (
              <button
                type="button"
                className="btn"
                style={{
                  border: '1px solid var(--border)',
                  padding: '12px 22px',
                  borderRadius: '7px',
                  backgroundColor: '#fff',
                }}
                onClick={() => setConfirmOpen(true)}
              >
                예약 취소
              </button>
            )}
            <Link
              className="btn"
              to={`/accommodations/${reservation.accommodationId}`}
              style={{
                border: '1px solid var(--border)',
                padding: '12px 22px',
                borderRadius: '7px',
                backgroundColor: '#fff',
                textDecoration: 'none',
                color: 'var(--text)',
              }}
            >
              숙소 상세 보기
            </Link>
            {reservation.status === 'PENDING' && !isExpired && (
              <Link
                className="btn btn-primary"
                to={`/reservations/${reservation.id}/payment`}
                style={{
                  padding: '12px 22px',
                  borderRadius: '7px',
                  textDecoration: 'none',
                }}
              >
                결제하기
              </Link>
            )}
            <Link
              className="btn"
              to="/me/reservations"
              style={{
                border: '1px solid var(--border)',
                padding: '12px 22px',
                borderRadius: '7px',
                backgroundColor: '#fff',
                textDecoration: 'none',
                color: 'var(--text)',
              }}
            >
              목록으로
            </Link>
          </div>

          {/* 시안 연녹색 안내 상자 1: 음악 리뷰 안내 */}
          <div className="checkout-note" style={{ width: '100%' }}>
            <strong>음악 리뷰는 이용 완료 후 등록할 수 있어요</strong>
            <p>
              본인의 이용 완료 예약에서만 음악 리뷰를 등록할 수 있습니다. Spotify 한 곡과
              1~5점 별점을 함께 선택해요.
            </p>
          </div>

          {/* 시안 연녹색 안내 상자 2: 자동 이용 완료 안내 */}
          <div className="checkout-note" style={{ width: '100%' }}>
            <strong>예약 확정 → 시스템 자동 이용 완료</strong>
            <p>
              숙소 현지 체크아웃 예정 시각 {reservation.checkOut} {checkOutTime} (Asia/Seoul)이 지나면
              시스템이 이용 완료로 전환합니다.
            </p>
          </div>
        </div>

        {/* 3. 우측 숙소 요약 카드 재사용 */}
        <ReservationSummaryCard reservation={reservation} />
      </div>

      {/* 예약 취소 확인 다이얼로그 */}
      <ConfirmDialog
        open={confirmOpen}
        title="예약을 취소할까요?"
        confirmLabel="예약 취소"
        cancelLabel="닫기"
        danger
        pending={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      >
        {wasPaid ? (
          <div className="stack">
            <span>
              취소 시점에 따라 환불정책이 적용됩니다. 취소 후에는 되돌릴 수 없습니다.
            </span>
            <RefundPolicyTable
              policyText={reservation.refundPolicy?.policyText}
              rules={reservation.refundPolicy?.rules}
            />
          </div>
        ) : (
          '결제 전 예약이라 환불 없이 바로 취소됩니다.'
        )}
      </ConfirmDialog>
    </main>
  )
}
