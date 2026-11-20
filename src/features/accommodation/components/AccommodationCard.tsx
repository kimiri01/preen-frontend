import { useRegionLabel } from '@/features/accommodation/hooks/useRegionLabel'
import type { Accommodation } from '@/features/accommodation/types'
import {
  getImageSrc,
  handleImageError,
} from '@/features/accommodation/utils/imageFallback'

interface AccommodationCardProps {
  accommodation: Accommodation
  isFavorite: boolean
  onToggleFavorite: (id: number) => void
  /** 숙소(사진 또는 이름)를 눌렀을 때 호출됩니다. "최근 본 숙소" 기록에 씁니다. */
  onView: (id: number) => void
}

/**
 * 숙소 카드 한 장 (기능명세서 STAY-001 "숙소 카드 표시")
 * 대표 사진 · 숙소명 · 지역/주소 · 최저 1박 요금을 보여 줍니다.
 * 사진이 없거나 깨지면 "이미지 업로드" 안내 이미지가 나옵니다.
 */
export function AccommodationCard({
  accommodation,
  isFavorite,
  onToggleFavorite,
  onView,
}: AccommodationCardProps) {
  // [kny] 카테고리 바와 같은 지역 이름(예: 제주도)으로 표시
  const toRegionLabel = useRegionLabel()
  return (
    <article className="stay">
      <div className="photo">
        <img
          src={getImageSrc(accommodation.image)}
          alt={`${accommodation.name} 전경`}
          loading="lazy"
          onError={handleImageError}
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
      <small>
        {accommodation.regionName
          ? `${toRegionLabel(accommodation.regionId, accommodation.regionName)} · ${accommodation.location}`
          : accommodation.location}
      </small>
      <p className="stay-price">
        {accommodation.pricePerNight != null ? (
          <>
            <strong>
              {accommodation.pricePerNight.toLocaleString('ko-KR')}원
            </strong>
            <span> / 1박</span>
          </>
        ) : (
          // 서버가 아직 요금을 주지 않는 숙소(판매 중인 객실 없음)
          <span>가격 정보 없음</span>
        )}
      </p>
    </article>
  )
}
