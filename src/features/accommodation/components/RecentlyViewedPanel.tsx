import '@/features/accommodation/accommodation.css'
import { useRecentlyViewedAccommodations } from '@/features/accommodation/hooks/useRecentlyViewed'

/**
 * 헤더의 "최근 본 숙소"를 눌렀을 때 펼쳐지는 목록입니다.
 * 숙소 카드의 사진이나 이름을 누른 숙소가 최근 순서대로 최대 10개까지 나옵니다.
 */
export function RecentlyViewedPanel() {
  const { hasRecentIds, accommodations, status } =
    useRecentlyViewedAccommodations()

  let message: string | null = null
  if (!hasRecentIds) message = '최근 본 숙소가 없습니다.'
  else if (status === 'pending') message = '최근 본 숙소를 불러오는 중입니다.'
  else if (status === 'error')
    message = '최근 본 숙소를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
  else if (accommodations.length === 0) message = '최근 본 숙소가 없습니다.'

  return (
    <div className="recent-menu">
      <strong>최근 본 숙소</strong>
      {message !== null ? (
        <p role={status === 'error' && hasRecentIds ? 'alert' : undefined}>
          {message}
        </p>
      ) : (
        <ul>
          {accommodations.map((accommodation) => (
            <li key={accommodation.id}>
              <img src={accommodation.image} alt="" />
              <div>
                <span>{accommodation.name}</span>
                <small>{accommodation.location}</small>
                <span>
                  ₩{accommodation.pricePerNight.toLocaleString('ko-KR')} / 1박
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
