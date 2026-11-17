import type { Accommodation } from '@/features/accommodation/types'

interface AccommodationCardProps {
  accommodation: Accommodation
  isFavorite: boolean
  onToggleFavorite: (id: number) => void
  /** 숙소(사진 또는 이름)를 눌렀을 때 호출됩니다. "최근 본 숙소" 기록에 씁니다. */
  onView: (id: number) => void
}

export function AccommodationCard({
  accommodation,
  isFavorite,
  onToggleFavorite,
  onView,
}: AccommodationCardProps) {
  return (
    <article className="stay">
      <div className="photo">
        <img
          src={accommodation.image}
          alt={`${accommodation.name} 전경`}
          onClick={() => onView(accommodation.id)}
        />
        <button
          type="button"
          className="favorite"
          aria-label={`${accommodation.name} 찜${isFavorite ? ' 해제' : '하기'}`}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(accommodation.id)}
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>
      <h3>
        <button type="button" onClick={() => onView(accommodation.id)}>
          {accommodation.name}
        </button>
      </h3>
      <small>{accommodation.location}</small>
      <p>₩{accommodation.pricePerNight.toLocaleString('ko-KR')} / 1박</p>
    </article>
  )
}
