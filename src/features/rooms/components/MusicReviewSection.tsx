import type { ApiResponse, PageResponse } from '@/common/types/api'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQueries, useQuery } from '@tanstack/react-query'
import { http, HttpError } from '@/common/api/http'
import { isValidStayId } from '../hooks/useRooms'

type MusicReview = {
  id: string
  roomName: string
  spotifyTrackId: string
  rating: number
  authorLabel: string
  stayedOn: string
  title: string | null
  artist: string | null
  album: string | null
  createdAt: string
}
type ReviewList = {
  accommodationId: string
  total: number
  filteredTotal: number
  page: number
  pageSize: number
  reviews: MusicReview[]
}
export function useMusicReviews(
  id: string,
  rating = 0,
  sort = 'latest',
  page = 0,
  size = 20,
) {
  return useQuery({
    queryKey: ['music-reviews', id, rating, sort, page, size],
    queryFn: async ({ signal }): Promise<ReviewList> => {
      const response = await http.get<ApiResponse<PageResponse<MusicReview>>>(
        `/api/accommodations/${encodeURIComponent(id)}/reviews?rating=${rating}&sort=${sort}&page=${page}&size=${size}`,
        { signal },
      )
      const result = response.data
      return {
        accommodationId: id,
        total: result.totalElements,
        filteredTotal: result.totalElements,
        page: result.page,
        pageSize: result.size,
        reviews: result.content,
      }
    },
    enabled: isValidStayId(id),
    retry: (count, error) =>
      !(error instanceof HttpError && error.status < 500) && count < 1,
  })
}
export function MusicReviewSection({
  accommodationId,
  onBack,
}: {
  accommodationId: string
  onBack: () => void
}) {
  const [params, setParams] = useSearchParams()
  const rawRating = params.get('rating') ?? ''
  const rating = /^[1-5]$/.test(rawRating) ? Number(rawRating) : 0
  const rawSort = params.get('reviewSort') ?? ''
  const sort = ['rating-desc', 'rating-asc'].includes(rawSort)
    ? rawSort
    : 'latest'
  const rawPage = params.get('reviewPage') ?? ''
  const page =
    /^\d{1,5}$/.test(rawPage) && Number(rawPage) <= 10000 ? Number(rawPage) : 0
  const size = [10, 20, 50].includes(Number(params.get('reviewSize')))
    ? Number(params.get('reviewSize'))
    : 20
  const update = (patch: {
    rating?: number
    sort?: string
    page?: number
    size?: number
  }) => {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      const nextRating = patch.rating ?? rating
      const nextSort = patch.sort ?? sort
      const nextPage = patch.page ?? 0
      const nextSize = patch.size ?? size
      if (nextSize !== 20) next.set('reviewSize', String(nextSize))
      else next.delete('reviewSize')
      if (nextRating) next.set('rating', String(nextRating))
      else next.delete('rating')
      if (nextSort !== 'latest') next.set('reviewSort', nextSort)
      else next.delete('reviewSort')
      if (nextPage) next.set('reviewPage', String(nextPage))
      else next.delete('reviewPage')
      return next
    })
    setPlaying(null)
  }
  const setRating = (value: number) => update({ rating: value })
  const setSort = (value: string) => update({ sort: value })
  const setPage = (value: number) => update({ page: value })
  const [playing, setPlaying] = useState<string | null>(null)
  const summary = useMusicReviews(accommodationId)
  const query = useMusicReviews(accommodationId, rating, sort, page, size)
  const trackCollection = useQuery({
    queryKey: ['music-review-tracks', accommodationId],
    queryFn: async ({ signal }) =>
      (
        await http.get<
          ApiResponse<
            {
              spotifyTrackId: string
              reviewCount: number
              latestCreatedAt: string
            }[]
          >
        >(`/api/accommodations/${encodeURIComponent(accommodationId)}/tracks`, {
          signal,
        })
      ).data,
    enabled: isValidStayId(accommodationId),
    retry: false,
  })
  const trackIds = [
    ...new Set(
      (query.data?.reviews ?? []).map((review) => review.spotifyTrackId),
    ),
  ].filter((id) => /^[a-zA-Z0-9]{22}$/.test(id))
  const tracks = useQueries({
    queries: trackIds.map((id) => ({
      queryKey: ['spotify-track-metadata', id],
      queryFn: async ({ signal }: { signal: AbortSignal }) =>
        (
          await http.get<
            ApiResponse<{
              title: string
              artist: string | null
              album: string | null
            }>
          >(`/api/spotify/tracks/${id}/metadata`, { signal })
        ).data,
      staleTime: 10 * 60 * 1000,
      retry: false,
    })),
  })

  useEffect(() => {
    setPlaying(null)
  }, [accommodationId, rating, sort, page, size])
  return (
    <section className="music-reviews" aria-labelledby="music-review-heading">
      <h2 id="music-review-heading">이곳에 머문 사람들이 고른 음악</h2>
      <p className="music-review-caption">
        음악 리뷰 {summary.data?.total ?? '—'}개 · 한 곡과 별점으로 남기는
        머무름입니다. 텍스트 리뷰는 작성하지 않습니다.
      </p>
      <p className="music-filter-count" role="status" aria-live="polite">
        {query.data
          ? `전체 ${summary.data?.total ?? '—'}개 · ${rating ? `${rating}점` : '전체 별점'} 리뷰 ${query.data.filteredTotal}개`
          : '리뷰 건수를 확인하고 있습니다.'}
      </p>
      <div className="music-review-toolbar">
        <div
          className="music-rating-filter"
          role="group"
          aria-label="리뷰 별점 필터"
        >
          {[0, 5, 4, 3, 2, 1].map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={rating === value}
              onClick={() => {
                setRating(value)
                setPlaying(null)
              }}
            >
              {value === 0 ? '전체' : `${value}점`}
            </button>
          ))}
        </div>
        <label>
          정렬{' '}
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value)
              setPlaying(null)
            }}
          >
            <option value="latest">최신순 ↓</option>
            <option value="rating-desc">별점 높은 순</option>
            <option value="rating-asc">별점 낮은 순</option>
          </select>
        </label>
        <label>
          페이지당 리뷰{' '}
          <select
            value={size}
            onChange={(event) => update({ size: Number(event.target.value) })}
          >
            {[10, 20, 50].map((value) => (
              <option key={value} value={value}>
                {value}개
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="music-review-hint">
        정렬: 최신순 / 별점 높은 순 / 별점 낮은 순 · 별점 필터와 함께
        적용됩니다.
      </p>
      <aside className="music-spotify-notice">
        Spotify 공식 플레이어 · 페이지 안에서 감상합니다. 다른 곡을 열면 이전
        플레이어가 닫힙니다.
      </aside>
      {query.isPending ? (
        <p className="room-state" role="status">
          음악 리뷰를 불러오고 있어요…
        </p>
      ) : query.isError ? (
        <div className="room-state" role="alert">
          <p>음악 리뷰를 불러오지 못했습니다.</p>
          <button type="button" onClick={() => void query.refetch()}>
            다시 시도
          </button>
        </div>
      ) : (
        query.data && (
          <>
            {query.data.reviews.length ? (
              <div className="music-review-list">
                {query.data.reviews.map((review) => {
                  const valid = /^[a-zA-Z0-9]{22}$/.test(review.spotifyTrackId)
                  const track =
                    tracks[trackIds.indexOf(review.spotifyTrackId)]?.data
                  return (
                    <article className="music-review-card" key={review.id}>
                      <div className="music-review-meta">
                        <p>
                          {review.authorLabel || '투숙객'} ·{' '}
                          {(
                            review.stayedOn ??
                            review.createdAt?.slice(0, 10) ??
                            ''
                          ).replaceAll('-', '.')}{' '}
                          이용 완료 · {review.roomName}
                        </p>
                        <span aria-label={`${review.rating}점`}>
                          <b aria-hidden="true">
                            {'★'.repeat(review.rating)}
                            {'☆'.repeat(5 - review.rating)}
                          </b>{' '}
                          {review.rating}점
                        </span>
                      </div>
                      <div className="music-review-track">
                        <span className="music-track-icon" aria-hidden="true">
                          ♪
                        </span>
                        <div>
                          <h3>{track?.title || '이 머무름에 남긴 한 곡'}</h3>
                          <p>
                            {[track?.artist, track?.album]
                              .filter(Boolean)
                              .join(' · ') ||
                              '곡 정보는 Spotify 플레이어에서 확인하세요.'}
                          </p>
                        </div>
                        {valid ? (
                          <button
                            className="music-review-play"
                            type="button"
                            aria-expanded={playing === review.id}
                            onClick={() =>
                              setPlaying(
                                playing === review.id ? null : review.id,
                              )
                            }
                            aria-label={`${review.roomName} 음악 플레이어 ${playing === review.id ? '닫기' : '열기'}`}
                          >
                            {playing === review.id
                              ? '닫기 ■'
                              : 'Spotify로 듣기 ▶'}
                          </button>
                        ) : (
                          <span className="music-review-caption">
                            재생 정보를 확인 중입니다.
                          </span>
                        )}
                      </div>
                      {playing === review.id && valid && (
                        <div className="music-review-player">
                          <iframe
                            title={`${review.roomName} 음악 리뷰 Spotify 플레이어`}
                            src={`https://open.spotify.com/embed/track/${review.spotifyTrackId}`}
                            width="100%"
                            height="152"
                            allow="encrypted-media; fullscreen; picture-in-picture"
                            referrerPolicy="no-referrer"
                            allowFullScreen
                          />
                          <a
                            href={`https://open.spotify.com/track/${review.spotifyTrackId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Spotify에서 곡 열기 ↗
                          </a>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="music-review-empty" role="status">
                <p>
                  {query.data.filteredTotal > 0
                    ? '이 페이지에는 리뷰가 없습니다. 첫 페이지에서 확인해주세요.'
                    : rating
                      ? `아직 ${rating}점 리뷰가 없습니다.`
                      : '아직 등록된 음악 리뷰가 없습니다.'}
                </p>
                {page > 0 && query.data.filteredTotal > 0 && (
                  <button type="button" onClick={() => setPage(0)}>
                    첫 페이지로
                  </button>
                )}
                {rating > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setRating(0)
                    }}
                  >
                    전체 리뷰 보기
                  </button>
                )}
              </div>
            )}
            {query.data.filteredTotal > query.data.pageSize && (
              <nav
                className="music-review-pagination"
                aria-label="음악 리뷰 페이지"
              >
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => {
                    setPage(page - 1)
                    setPlaying(null)
                  }}
                >
                  ← 이전
                </button>
                <span>
                  {page + 1} /{' '}
                  {Math.ceil(query.data.filteredTotal / query.data.pageSize)}
                </span>
                <button
                  type="button"
                  disabled={
                    (page + 1) * query.data.pageSize >= query.data.filteredTotal
                  }
                  onClick={() => {
                    setPage(page + 1)
                    setPlaying(null)
                  }}
                >
                  다음 →
                </button>
              </nav>
            )}
          </>
        )
      )}
      <details className="music-track-collection">
        <summary>이 숙소의 음악 모음 · 중복 없이 최대 50곡</summary>
        <p>
          현재 별점 필터와 별개로, 숙소의 공개 리뷰에 남겨진 곡을 최근 등록
          순으로 보여줍니다.
        </p>
        {trackCollection.isPending ? (
          <p>음악 모음을 불러오고 있습니다.</p>
        ) : trackCollection.isError ? (
          <p>
            음악 모음을 불러오지 못했습니다. 리뷰 목록은 계속 이용할 수
            있습니다.
          </p>
        ) : trackCollection.data?.length ? (
          <ul>
            {trackCollection.data.map((track, index) => {
              const valid = /^[A-Za-z0-9]{22}$/.test(track.spotifyTrackId)
              const key = `track:${track.spotifyTrackId}`
              const title =
                tracks[trackIds.indexOf(track.spotifyTrackId)]?.data?.title ||
                `음악 ${index + 1}`
              return (
                <li key={track.spotifyTrackId}>
                  <p>
                    이 곡을 남긴 리뷰 {track.reviewCount}개 · 최근{' '}
                    {track.latestCreatedAt.slice(0, 10)}
                  </p>
                  {valid && (
                    <button
                      type="button"
                      aria-expanded={playing === key}
                      onClick={() => setPlaying(playing === key ? null : key)}
                    >
                      {title} · Spotify로 듣기
                    </button>
                  )}
                  {valid && playing === key && (
                    <iframe
                      title={`${title} Spotify 플레이어`}
                      src={`https://open.spotify.com/embed/track/${track.spotifyTrackId}`}
                      width="100%"
                      height="152"
                      allow="encrypted-media; fullscreen; picture-in-picture"
                      referrerPolicy="no-referrer"
                      allowFullScreen
                    />
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p>아직 등록된 곡이 없습니다.</p>
        )}
      </details>
      <aside className="music-review-guide">
        <h3>나의 머무름도 음악으로 남겨보세요.</h3>
        <p>
          체크아웃 완료 후 이용한 예약에서 한 곡과 별점을 남길 수 있습니다. 리뷰
          작성은 로그인 사용자와 이용 완료 예약 확인 후 가능합니다.
        </p>
        <Link
          className="review-write-link"
          to={`/accommodations/${encodeURIComponent(accommodationId)}/reviews/new?${params}`}
        >
          음악 리뷰 작성 →
        </Link>
      </aside>
      <p className="music-review-hint">
        재생 범위는 Spotify 로그인 상태와 이용 조건에 따라 달라질 수 있습니다.
      </p>
      <button type="button" className="music-back-button" onClick={onBack}>
        숙소 정보·객실 선택으로
      </button>
      <span className="music-review-hint"> 숙소·선택 일정은 유지됩니다.</span>
    </section>
  )
}
