import { useNavigate } from 'react-router-dom'
import '@/features/accommodation/accommodation.css'
import { AccommodationCard } from '@/features/accommodation/components/AccommodationCard'
import { useAccommodations } from '@/features/accommodation/hooks/useAccommodations'
import { useAccommodationsByCategory } from '@/features/accommodation/hooks/useAccommodationsByCategory'
import { useFavorites } from '@/features/accommodation/hooks/useFavorites'
import { addRecentlyViewed } from '@/features/accommodation/hooks/useRecentlyViewed'
import { accommodationDetailPath } from '@/features/accommodation/hooks/useSearchConditions'
import type {
  Accommodation,
  AccommodationFilter,
} from '@/features/accommodation/types'

interface AccommodationSectionProps {
  /** 카테고리 바에서 선택된 조회 조건 */
  filter: AccommodationFilter
}

/** 선택한 조건(전체·카테고리·지역)에 맞는 숙소 목록 카드 뷰 */
export function AccommodationSection({ filter }: AccommodationSectionProps) {
  const { favorites, toggleFavorite } = useFavorites()
  const navigate = useNavigate()
  // [kny] 카드를 누르면 "최근 본 숙소"에 기록하고 상세페이지로 이동합니다.
  const viewAccommodation = (id: number) => {
    addRecentlyViewed(id)
    navigate(accommodationDetailPath(id))
  }
  const isAll = filter.type === 'all'

  const single = useAccommodations(filter)
  const grouped = useAccommodationsByCategory(isAll)

  const status = isAll ? grouped.status : single.status
  const isEmpty = isAll
    ? grouped.groups.length === 0
    : single.accommodations.length === 0

  const renderCards = (accommodations: Accommodation[]) => (
    <div className="stay-grid">
      {accommodations.map((accommodation) => (
        <AccommodationCard
          key={accommodation.id}
          accommodation={accommodation}
          isFavorite={favorites.has(accommodation.id)}
          onToggleFavorite={toggleFavorite}
          onView={viewAccommodation}
        />
      ))}
    </div>
  )

  return (
    <section>
      <div className="section-title">
        <h2>지금 예약 가능한 숙소</h2>
        <button type="button">더 보기 →</button>
      </div>
      {status === 'pending' ? (
        <p className="stay-status">숙소를 불러오는 중입니다.</p>
      ) : status === 'error' ? (
        <p className="stay-status" role="alert">
          숙소 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      ) : isEmpty ? (
        <p className="stay-status">조건에 맞는 숙소가 아직 없습니다.</p>
      ) : isAll ? (
        <div className="stay-groups">
          {grouped.groups.map((group) => (
            <div key={group.categoryCode} className="stay-group">
              <h3 className="stay-group-title">{group.label}</h3>
              {renderCards(group.accommodations)}
            </div>
          ))}
        </div>
      ) : (
        renderCards(single.accommodations)
      )}
    </section>
  )
}
