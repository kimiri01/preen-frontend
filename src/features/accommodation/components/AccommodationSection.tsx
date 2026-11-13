import '@/features/accommodation/accommodation.css'
import { AccommodationCard } from '@/features/accommodation/components/AccommodationCard'
import { accommodations } from '@/features/accommodation/data/accommodations'
import { useFavorites } from '@/features/accommodation/hooks/useFavorites'

export function AccommodationSection() {
  const { favorites, toggleFavorite } = useFavorites()
  return (
    <section>
      <div className="section-title">
        <h2>지금 예약 가능한 숙소</h2>
        <button type="button">더 보기 →</button>
      </div>
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
    </section>
  )
}
