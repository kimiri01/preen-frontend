import { Link } from 'react-router-dom'
import { todayKst, upcomingWeekend } from '@/common/utils/date'
import { useCategories } from '@/features/accommodation/hooks/useCategories'
import { accommodationListPath } from '@/features/accommodation/hooks/useSearchConditions'
import type { SearchConditions } from '@/features/accommodation/types'
import '@/features/accommodation/accommodation.css'

/** 시안 순서를 유지한다. 이름이 일치하는 백엔드 카테고리만 연결한다. */
const CATEGORY_TILES = [
  { label: '호텔·리조트', image: '/images/category-signature-2.png' },
  { label: '독채·풀빌라', image: '/images/category-signature-3.png' },
  { label: '한옥', image: '/images/category-signature-4.png' },
  // 백엔드 카테고리에 없다. 협의 전까지 동작 없음.
  { label: '감성 스테이', image: '/images/category-signature-5.png' },
  { label: '게스트하우스', image: '/images/category-signature-6.png' },
]

interface TileProps {
  image: string
  label: string
  /** 없으면 동작 없는 타일 */
  to?: string
  active?: boolean
}

function Tile({ image, label, to, active }: TileProps) {
  const content = (
    <>
      <span className="category-image">
        <img src={image} alt="" />
      </span>
      {label}
    </>
  )
  if (!to) {
    return (
      <button type="button" disabled>
        {content}
      </button>
    )
  }
  return (
    <Link
      to={to}
      className={active ? 'active' : undefined}
      aria-current={active ? 'page' : undefined}
    >
      {content}
    </Link>
  )
}

interface CategoryTilesProps {
  /** 목록 화면의 현재 조건. 넘기면 선택된 타일을 표시하고 날짜·인원을 유지한다. */
  conditions?: Partial<SearchConditions>
}

/** 홈과 목록이 함께 쓰는 숙박 유형 타일 */
export function CategoryTiles({ conditions }: CategoryTilesProps) {
  const categories = useCategories()
  const view = conditions?.view
  const categoryId = view ? undefined : conditions?.categoryId
  // 주말 타일에서 다른 타일로 옮길 때는 주말 날짜를 끌고 가지 않는다.
  const carry =
    view === 'weekend'
      ? { guestCount: conditions?.guestCount }
      : {
          checkIn: conditions?.checkIn,
          checkOut: conditions?.checkOut,
          guestCount: conditions?.guestCount,
        }

  return (
    <nav
      className={conditions ? 'categories has-active' : 'categories'}
      aria-label="숙박 유형"
    >
      <Tile
        image="/images/category-signature-1.png"
        label="전체 숙소"
        to={accommodationListPath(carry)}
        active={Boolean(conditions) && !view && !categoryId}
      />
      {CATEGORY_TILES.map((tile) => {
        const category = categories.data?.find(
          (item) => item.name === tile.label,
        )
        return (
          <Tile
            key={tile.label}
            {...tile}
            to={
              category &&
              accommodationListPath({ ...carry, categoryId: category.id })
            }
            active={category !== undefined && category.id === categoryId}
          />
        )
      })}
      <Tile
        image="/images/category-signature-7.png"
        label="이번 주말"
        to={accommodationListPath({
          guestCount: conditions?.guestCount,
          view: 'weekend',
          ...upcomingWeekend(todayKst()),
        })}
        active={view === 'weekend'}
      />
      <Tile
        image="/images/category-signature-8.png"
        label="지역으로 찾기"
        to={accommodationListPath({ ...carry, view: 'region' })}
        active={view === 'region'}
      />
    </nav>
  )
}
