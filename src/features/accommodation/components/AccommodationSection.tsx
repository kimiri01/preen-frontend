import '@/features/accommodation/accommodation.css'
import { AccommodationCard } from '@/features/accommodation/components/AccommodationCard'
import { useAccommodations } from '@/features/accommodation/hooks/useAccommodations'
import { useFavorites } from '@/features/accommodation/hooks/useFavorites'
import type { AccommodationFilter } from '@/features/accommodation/types'

interface AccommodationSectionProps {
  /** 카테고리 바에서 선택된 조회 조건 */
  filter: AccommodationFilter
}

export function AccommodationSection({ filter }: AccommodationSectionProps) {
  const { favorites, toggleFavorite } = useFavorites()
  const { accommodations, status } = useAccommodations(filter)

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
      ) : accommodations.length === 0 ? (
        <p className="stay-status">조건에 맞는 숙소가 아직 없습니다.</p>
      ) : (
        <div className="grid-four">
          {accommodations.map((accommodation) => (
            <AccommodationCard
              key={accommodation.id}
              accommodation={accommodation}
              isFavorite={favorites.has(accommodation.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </section>
  )
}
