import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { HttpError } from '@/common/api/http'
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
} from '@/common/components/StatusViews'
import {
  parseAccommodationId,
  useAccommodationDetail,
} from '@/features/accommodation/hooks/useAccommodationDetail'
import { addRecentlyViewed } from '@/features/accommodation/hooks/useRecentlyViewed'
import {
  getImageSrc,
  handleImageError,
} from '@/features/accommodation/utils/imageFallback'
import '@/features/accommodation/accommodation.css'
import '@/features/accommodation/accommodationDetail.css'

/** 썸네일로 보여 줄 최대 사진 수 */
const MAX_THUMBNAILS = 5

/**
 * 숙소 소개 글을 "강조 문구(첫 줄)"와 "본문(나머지 줄)"으로 나눕니다.
 * 한 줄뿐이면 강조 문구 없이 본문으로만 보여 줍니다.
 */
function splitDescription(description: string | null) {
  const lines = (description ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length <= 1) return { headline: null, body: lines }
  return { headline: lines[0], body: lines.slice(1) }
}

/**
 * [kny] 숙소 상세페이지 (/accommodations/:accommodationId)
 * 상단 기본 정보(사진 · 유형/지역 · 이름 · 주소) 아래에 "숙소 소개"와 "시설/서비스"를 보여 줍니다.
 */
export function AccommodationDetailPage() {
  const { accommodationId } = useParams()
  const id = parseAccommodationId(accommodationId)
  const query = useAccommodationDetail(id)
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState(0)

  // 다른 숙소로 이동하면 첫 번째 사진부터 보여 줍니다.
  useEffect(() => setSelectedImage(0), [id])

  // 상세 정보를 실제로 불러온 숙소만 "최근 본 숙소"에 기록합니다. (없는 숙소 ID는 기록하지 않음)
  const loadedId = query.data?.id
  useEffect(() => {
    if (loadedId != null) addRecentlyViewed(loadedId)
  }, [loadedId])

  // 앱 안에서 들어왔으면 이전 화면으로, 주소로 바로 들어왔으면 메인으로 돌아갑니다.
  const goBack = () => {
    const historyIndex = (window.history.state as { idx?: number } | null)?.idx
    if (historyIndex && historyIndex > 0) navigate(-1)
    else navigate('/')
  }

  const backButton = (
    <button
      type="button"
      className="btn-link stay-detail-back"
      onClick={goBack}
    >
      ← 이전으로
    </button>
  )

  if (
    id === null ||
    (query.error instanceof HttpError && query.error.status === 404)
  ) {
    return (
      <main className="page stay-detail">
        {backButton}
        <EmptyState
          title="숙소를 찾을 수 없습니다"
          description="삭제되었거나 공개되지 않은 숙소입니다."
          action={
            <Link className="btn" to="/">
              메인으로
            </Link>
          }
        />
      </main>
    )
  }
  if (query.isPending) {
    return (
      <main className="page stay-detail">
        <LoadingBlock fullPage label="숙소 정보를 불러오는 중입니다" />
      </main>
    )
  }
  if (query.isError) {
    return (
      <main className="page stay-detail">
        {backButton}
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </main>
    )
  }

  const stay = query.data
  const images = stay.imageUrls.slice(0, MAX_THUMBNAILS)
  const mainImage = images[selectedImage] ?? images[0]
  const badges = [stay.categoryName, stay.regionName].filter(Boolean)
  const intro = splitDescription(stay.description)

  return (
    <main className="page stay-detail">
      {backButton}

      <section className="stay-detail-gallery" aria-label={`${stay.name} 사진`}>
        <div className="stay-detail-main-photo">
          <img
            src={getImageSrc(mainImage)}
            alt={`${stay.name} 사진 ${selectedImage + 1}`}
            onError={handleImageError}
          />
        </div>
        {images.length > 1 && (
          <ul className="stay-detail-thumbnails">
            {images.map((url, index) => (
              <li key={`${url}-${index}`}>
                <button
                  type="button"
                  aria-label={`${index + 1}번째 사진 보기`}
                  aria-pressed={index === selectedImage}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={getImageSrc(url)}
                    alt=""
                    loading="lazy"
                    onError={handleImageError}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="stay-detail-summary">
        {badges.length > 0 && (
          <p className="stay-detail-badges">
            {badges.map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </p>
        )}
        <h1>{stay.name}</h1>
        <p className="muted">{stay.address}</p>
      </section>

      <section
        className="stay-detail-section"
        aria-labelledby="stay-detail-intro-title"
      >
        <h2 id="stay-detail-intro-title">숙소 소개</h2>
        {intro.body.length === 0 && !intro.headline ? (
          <p className="muted">숙소 소개가 아직 등록되지 않았습니다.</p>
        ) : (
          <>
            {intro.headline && (
              <p className="stay-detail-headline">
                <span aria-hidden="true">ⓘ</span>
                {intro.headline}
              </p>
            )}
            <div className="stay-detail-description">
              {intro.body.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </>
        )}
      </section>

      <section
        className="stay-detail-section"
        aria-labelledby="stay-detail-amenity-title"
      >
        <h2 id="stay-detail-amenity-title">시설/서비스</h2>
        {stay.amenities.length === 0 ? (
          <p className="muted">등록된 시설/서비스 정보가 없습니다.</p>
        ) : (
          <ul className="stay-detail-amenities">
            {stay.amenities.map((amenity) => (
              <li key={amenity}>{amenity}</li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
