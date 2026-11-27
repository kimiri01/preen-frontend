import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams} from 'react-router-dom'
//import { useSession } from '@/common/auth/session'
import { FormField } from '@/features/reservation/components/FormField'
import { NotFoundView } from '@/common/components/Screens'
import { ErrorState, LoadingBlock } from '@/common/components/StatusViews'
import { addDays, isIsoDate, todayKst } from '@/common/utils/date'
import {
  errorCodeOf,
  fieldErrorsOf,
  getErrorMessage,
} from '@/common/utils/error'
import { formatFullDate, formatTime } from '@/common/utils/format'
import {
  //RefundPolicyTable,
  accommodationDetailPath,
  accommodationListPath,
  //useAccommodationDetail,
} from '@/features/accommodation/public'
//import {
//  estimateExtraPersonFee,
//  useAvailability,
//} from '@/features/inventory/public'
import {
  CheckoutLayout,
  StaySummaryCard,
} from '@/features/reservation/components/Checkout'
import {
  INVENTORY_SOLD_OUT,
  RESERVATION_ROOM_NOT_AVAILABLE,
  reservationErrorMessages,
} from '@/features/reservation/errorMessages'
import { useCreateReservation } from '@/features/reservation/hooks/useReservations'


import {
  MockRefundPolicyTable as RefundPolicyTable,
  mockEstimateExtraPersonFee as estimateExtraPersonFee,
  useMockAccommodationDetail as useAccommodationDetail,
  useMockAvailability as useAvailability,

} from '@/features/reservation/mockDeps'

import { useLoginSession } from '@/features/auth/public'




const PHONE_PATTERN = /^[0-9\-+ ]{9,20}$/

function positiveInt(value: string | null) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

export function ReservationNewPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()


  const {member } = useLoginSession()

  const [guestName, setGuestName ]= useState(member?.name ?? '')
  const [ guestPhone, setGuestPhone ] = useState('')



  const accommodationId = positiveInt(params.get('accommodationId'))
  const roomId = positiveInt(params.get('roomId'))
  const guestCount = positiveInt(params.get('guestCount'))
  const rawCheckIn = params.get('checkIn')
  const rawCheckOut = params.get('checkOut')
  const checkIn =
    isIsoDate(rawCheckIn) && rawCheckIn >= todayKst() ? rawCheckIn : undefined
  const checkOut =
    checkIn && isIsoDate(rawCheckOut) && rawCheckOut > checkIn
      ? rawCheckOut
      : undefined
  const valid =
    !!accommodationId && !!roomId && !!guestCount && !!checkIn && !!checkOut

  const detail = useAccommodationDetail(valid ? accommodationId : undefined)
  const availability = useAvailability(
    valid ? accommodationId : undefined,
    checkIn,
    checkOut,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [soldOut, setSoldOut] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const createReservation = useCreateReservation(accommodationId)
  const submitting = createReservation.isPending

  
  if (!valid) {
    return (
      <NotFoundView
        title="예약 정보를 확인할 수 없습니다"
        description="숙소 상세에서 날짜와 객실을 다시 선택해 주세요."
      />
    )
  }
  if (detail.isPending || availability.isPending)
    return <LoadingBlock fullPage />
  if (detail.isError || availability.isError) {
    return (
      <main className="narrow">
        <ErrorState
          error={detail.error ?? availability.error}
          onRetry={() => {
            void detail.refetch()
            void availability.refetch()
          }}
        />
      </main>
    )
  }

  const backPath = accommodationDetailPath(accommodationId, {
    checkIn,
    checkOut,
    guestCount,
  })
  const room = availability.data.find((item) => item.roomId === roomId)
  const unavailable =
    !room ||
    !room.available ||
    room.totalPrice === undefined ||
    guestCount > room.maxCapacity

  const listPath = accommodationListPath({ checkIn, checkOut, guestCount })

  // 제출 뒤 매진은 아래에서 입력값을 유지한 채 안내한다.
  if (unavailable) {
    return (
      <main className="narrow centered">
        <h2>예약할 수 없는 객실입니다</h2>
        <small>
          {room && guestCount > room.maxCapacity
            ? `이 객실의 최대 인원은 ${room.maxCapacity}명입니다.`
            : reservationErrorMessages[INVENTORY_SOLD_OUT]}
        </small>
        <div className="actions">
          <Link className="btn btn-primary" to={backPath}>
            다른 객실·날짜 고르기
          </Link>
          <Link className="btn" to={listPath}>
            검색 결과로
          </Link>
        </div>
      </main>
    )
  }

  // 미리보기. 확정 금액은 예약 생성 응답의 요금 항목과 totalPrice다.
  const roomPrice = room.totalPrice as number
  const extraFee = estimateExtraPersonFee(guestCount, room)

  // 전액 환불 규칙 중 체크인에 가장 가까운 날까지를 무료 취소 기한으로 안내한다.
  const freeCancelDays = detail.data.refundPolicy?.rules
    .filter((rule) => rule.refundRate >= 1)
    .map((rule) => rule.daysBefore)
    .sort((a, b) => a - b)[0]
  const freeCancelUntil =
    freeCancelDays !== undefined ? addDays(checkIn, -freeCancelDays) : undefined

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    const name = guestName.trim()
    const phone = guestPhone.trim()
    if (name.length > 50) next.guestName = '예약자 이름은 50자 이하여야 합니다.'
    if (phone && !PHONE_PATTERN.test(phone))
      next.guestPhone = '전화번호 형식이 올바르지 않습니다.'
    if (!agreed) next.agreed = '예약 및 취소 규정과 개인정보 제공에 동의해 주세요.'
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length > 0) return

    createReservation.mutate(
      {
        roomId,
        checkIn,
        checkOut,
        guestCount,
        ...(name ? { guestName: name } : {}),
        ...(phone ? { guestPhone: phone } : {}),
      },
      {
        onSuccess: (reservation) => {
          navigate(`/reservations/${reservation.id}/payment`, { replace: true })
        },
        onError: (error) => {
          const code = errorCodeOf(error)
          if (
            code === INVENTORY_SOLD_OUT ||
            code === RESERVATION_ROOM_NOT_AVAILABLE
          ) {
            setSoldOut(true)
            return
          }
          setErrors(fieldErrorsOf(error))
          setFormError(getErrorMessage(error, reservationErrorMessages))
        },
      },
    )
  }

  return (
    <CheckoutLayout
      title="예약 정보 입력"
      step={1}
      summary={
        <StaySummaryCard
          image={detail.data.imageUrls[0]}
          name={detail.data.name}
          caption={`${detail.data.regionName} · ${room.roomName}`}
          checkIn={checkIn}
          checkOut={checkOut}
          guestCount={guestCount}
          prices={[
            { label: `객실 요금 (${room.nights}박)`, amount: roomPrice },
            ...(extraFee > 0
              ? [
                  {
                    label: `추가 인원 요금 (${guestCount - room.capacity}명)`,
                    amount: extraFee,
                  },
                ]
              : []),
          ]}
          totalLabel="예상 결제 금액"
          total={roomPrice + extraFee}
          note="결제 금액은 예약이 만들어질 때 확정됩니다."
        />
      }
    >
      <form className="checkout-form" onSubmit={handleSubmit} noValidate>
        <h3>예약자 정보</h3>
        <FormField
          label="예약자 이름"
          htmlFor="guestName"
          error={errors.guestName}
          hint="비워 두면 회원 정보의 이름을 사용합니다."
        >
          <input
            id="guestName"
            value={guestName}
            maxLength={50}
            autoComplete="name"
            onChange={(event) => setGuestName(event.target.value)}
          />
        </FormField>
        <FormField
          label="휴대전화"
          htmlFor="guestPhone"
          error={errors.guestPhone}
          hint="비워 두면 회원 정보의 전화번호를 사용합니다."
        >
          <input
            id="guestPhone"
            type="tel"
            value={guestPhone}
            autoComplete="tel"
            onChange={(event) => setGuestPhone(event.target.value)}
          />
        </FormField>

        <hr />
        <h3 className="checkout-subtitle">예약 전 확인</h3>
        <div className="checkout-lines">
          <p>
            체크인 {formatTime(detail.data.checkInTime)} 이후 · 체크아웃{' '}
            {formatTime(detail.data.checkOutTime)} 이전
          </p>
          {freeCancelUntil && freeCancelUntil >= todayKst() && (
            <p className="is-free">
              무료 취소: {formatFullDate(freeCancelUntil)}까지
            </p>
          )}
          <p>예약하면 객실이 10분 동안 선점됩니다. 그 안에 결제를 마쳐 주세요.</p>
        </div>
        <details>
          <summary>환불정책 자세히 보기</summary>
          <RefundPolicyTable
            policyText={detail.data.refundPolicy?.policyText}
            rules={detail.data.refundPolicy?.rules}
          />
        </details>
        <label className="check">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          예약 및 취소 규정 확인 · 개인정보 제공 동의 [필수]
        </label>
        {errors.agreed && (
          <p className="form-error" role="alert">
            {errors.agreed}
          </p>
        )}

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        {soldOut ? (
          <div className="checkout-alert" role="alert">
            <strong>선택한 객실이 매진되었어요</strong>
            <p>
              예약자 정보는 유지됩니다. 같은 일정의 다른 객실을 다시
              선택해주세요. 결제는 진행되지 않았습니다.
            </p>
            <div className="actions">
              <Link className="btn btn-primary" to={backPath}>
                객실 다시 선택
              </Link>
              <Link className="btn" to={listPath}>
                검색 결과로
              </Link>
            </div>
          </div>
        ) : (
          <div className="actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? '예약 중…' : '총금액 확인 후 결제로'}
            </button>
            <Link className="btn" to={backPath}>
              날짜·객실 다시 고르기
            </Link>
          </div>
        )}
      </form>
    </CheckoutLayout>
  )
}
