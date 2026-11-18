import { addRecentlyViewed } from '../hooks/useRecentlyViewed'
import { Link } from 'react-router-dom'
import { formatPrice } from '@/common/utils/format'
import type { AccommodationSummaryResponse } from '@/features/accommodation/types'

export const FALLBACK_IMAGE = '/images/generated.png'

interface AccommodationCardProps {
  accommodation: AccommodationSummaryResponse
  /** 상세 경로. 목록의 날짜·인원 조건을 붙여 넘긴다. */
  to: string
  isFavorite: boolean
  onToggleFavorite: (id: number) => void
}

export function AccommodationSearchCard({
  accommodation,
  to,
  isFavorite,
  onToggleFavorite,
}: AccommodationCardProps) {
  return (
    <article className="stay">
      <div className="photo">
        <Link
          onClick={() => addRecentlyViewed(accommodation.id)}
          to={to}
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            loading="lazy"
            src={accommodation.thumbnailUrl ?? FALLBACK_IMAGE}
            alt=""
          />
        </Link>
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
        <Link onClick={() => addRecentlyViewed(accommodation.id)} to={to}>
          {accommodation.name}
        </Link>
      </h3>
      <small>
        {accommodation.regionName} · {accommodation.categoryName}
      </small>
      {accommodation.minNightlyPrice != null && (
        <p>{formatPrice(accommodation.minNightlyPrice)} / 1박</p>
      )}
    </article>
  )
}
