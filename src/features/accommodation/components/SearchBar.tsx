import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays, todayKst } from '@/common/utils/date'
import { regionItems } from '@/features/accommodation/data/regionItems'
import type { SearchScope } from '@/features/accommodation/hooks/useFilterIds'
import { useRegions } from '@/features/accommodation/hooks/useRegions'
import { accommodationListPath } from '@/features/accommodation/hooks/useSearchConditions'
import { regionOptions } from '@/features/accommodation/regionUtils'
import type { SearchConditions } from '@/features/accommodation/types'
import '@/features/accommodation/accommodation.css'

const GUEST_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1)

interface SearchBarProps {
  /** 목록 화면의 현재 조건. 없으면(홈) 오늘 1박·성인 2명으로 시작한다. */
  conditions?: Partial<SearchConditions>
  /** 홈 전용: 카테고리 바에서 고른 탭 안에서 검색하기 위한 ID */
  scope?: SearchScope
}

/** 홈과 목록이 함께 쓰는 지역·일정·인원 검색 */
export function SearchBar({ conditions, scope }: SearchBarProps) {
  const navigate = useNavigate()
  const regions = useRegions()
  const today = todayKst()
  const options = regionOptions(regions.data)
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
    const text = place.trim()
    const fixedCode = regionItems.find((item) => item.label === text)?.regionCode
    // [kny] 서버 이름(예: 강원, 제주)으로 써도 지역으로 인식한다. (자동완성은 강원도/제주도로 보임)
    const fixedRegion =
      regions.data?.find((item) => item.code === fixedCode) ??
      regions.data?.find((item) => item.name === text)
    const region =
      options.find((option) => option.label === text) ??
      (fixedRegion ? { id: fixedRegion.id, label: text } : undefined)
    const keepView =
      conditions?.view === 'region' ||
      (conditions?.view === 'weekend' &&
        checkIn === conditions.checkIn &&
        checkOut === conditions.checkOut)
    navigate(
      accommodationListPath({
        view: keepView ? conditions?.view : undefined,
        categoryId: conditions?.categoryId ?? scope?.categoryId,
        regionId: region?.id ?? (conditions ? undefined : scope?.regionId),
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
