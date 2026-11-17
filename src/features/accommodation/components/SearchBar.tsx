import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays, todayKst } from '@/common/utils/date'
import { useRegions } from '@/features/accommodation/hooks/useRegions'
import { accommodationListPath } from '@/features/accommodation/hooks/useSearchConditions'
import { regionOptions } from '@/features/accommodation/regionUtils'
import type { SearchConditions } from '@/features/accommodation/types'
import '@/features/accommodation/accommodation.css'

const GUEST_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1)

interface SearchBarProps {
  /**
   * 목록 화면의 현재 조건. 넘기면 그 값으로 채우고 숙박 유형·탐색 화면을 유지한다.
   * 없으면(홈) 오늘 1박·성인 2명으로 시작한다.
   */
  conditions?: Partial<SearchConditions>
}

/** 홈과 목록이 함께 쓰는 지역·일정·인원 검색 */
export function SearchBar({ conditions }: SearchBarProps) {
  const navigate = useNavigate()
  const regions = useRegions()
  const today = todayKst()
  const options = regionOptions(regions.data)
  // 지역 목록이 늦게 와도 지역 이름이 채워지도록, 입력 전에는 조건에서 계산한다.
  const [typed, setTyped] = useState<string | null>(null)
  const [checkIn, setCheckIn] = useState(
    conditions ? (conditions.checkIn ?? '') : today,
  )
  const [checkOut, setCheckOut] = useState(
    conditions ? (conditions.checkOut ?? '') : addDays(today, 1),
  )
  const [guestCount, setGuestCount] = useState<number | undefined>(
    conditions ? conditions.guestCount : 2,
  )
  const place =
    typed ??
    options.find((option) => option.id === conditions?.regionId)?.label ??
    conditions?.keyword ??
    ''

  const changeCheckIn = (value: string) => {
    setCheckIn(value)
    if (!value) return setCheckOut('')
    if (checkOut <= value) setCheckOut(addDays(value, 1))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    // 입력이 지역 이름과 같으면 지역 조건, 아니면 숙소명 조건이다.
    const text = place.trim()
    const region = options.find((option) => option.label === text)
    // 날짜를 바꾸면 더 이상 "이번 주말" 화면이 아니다.
    const keepView =
      conditions?.view === 'region' ||
      (conditions?.view === 'weekend' &&
        checkIn === conditions.checkIn &&
        checkOut === conditions.checkOut)
    navigate(
      accommodationListPath({
        view: keepView ? conditions?.view : undefined,
        categoryId: conditions?.categoryId,
        regionId: region?.id,
        keyword: region ? undefined : text || undefined,
        checkIn: checkIn || undefined,
        checkOut: (checkIn && checkOut) || undefined,
        guestCount,
      }),
    )
  }

  return (
    <form className="search" onSubmit={handleSubmit}>
      <label className="search-field">
        <small>여행 지역</small>
        <input
          list="search-regions"
          value={place}
          maxLength={100}
          placeholder="지역 또는 숙소명"
          onChange={(event) => setTyped(event.target.value)}
        />
        <datalist id="search-regions">
          {options.map((option) => (
            <option key={option.id} value={option.label} />
          ))}
        </datalist>
      </label>
      <div className="search-field">
        <small>체크인 · 체크아웃</small>
        <span className="search-dates">
          <input
            type="date"
            aria-label="체크인"
            min={today}
            value={checkIn}
            onChange={(event) => changeCheckIn(event.target.value)}
          />
          —
          <input
            type="date"
            aria-label="체크아웃"
            min={addDays(checkIn || today, 1)}
            value={checkOut}
            disabled={!checkIn}
            onChange={(event) =>
              event.target.value && setCheckOut(event.target.value)
            }
          />
        </span>
      </div>
      <label className="search-field">
        <small>인원 · 객실</small>
        <span>
          <select
            aria-label="인원"
            value={guestCount ?? ''}
            onChange={(event) =>
              setGuestCount(
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          >
            {conditions && <option value="">인원 무관</option>}
            {GUEST_OPTIONS.map((count) => (
              <option key={count} value={count}>
                성인 {count}명
              </option>
            ))}
          </select>{' '}
          · 객실 1개
        </span>
      </label>
      <button type="submit" className="search-submit">
        검색하기
      </button>
    </form>
  )
}
