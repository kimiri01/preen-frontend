import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AsyncView, EmptyState } from '@/common/components/StatusViews'
import { useHostAccommodations } from '../hooks/useHostQueries'
import { type ListingStatus } from '@/features/host/mockHostdeps'
import { PLACEHOLDER_IMAGE } from '@/features/accommodation/utils/imageFallback'
import { hostErrorMessages } from '../api/hostApi'
import '@/features/host/host.css'

export const LISTING_LABELS: Record<
  ListingStatus,
  { label: string; className: string }
> = {
  DRAFT: { label: '작성 중', className: 'badge badge-warn' },
  LISTED: { label: '공개', className: 'badge badge-ok' },
  HIDDEN: { label: '숨김', className: 'badge badge-off' },
}

type FilterStatus = 'ALL' | ListingStatus

export function HostAccommodationsPage() {
  const query = useHostAccommodations()
  const items = query.data ?? []

  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL')

  // 검색어 및 공개 상태 필터링
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesKeyword =
        !keyword.trim() ||
        item.name.toLowerCase().includes(keyword.trim().toLowerCase()) ||
        item.regionName.toLowerCase().includes(keyword.trim().toLowerCase()) ||
        item.categoryName.toLowerCase().includes(keyword.trim().toLowerCase())

      const matchesStatus =
        statusFilter === 'ALL' || item.listingStatus === statusFilter

      return matchesKeyword && matchesStatus
    })
  }, [items, keyword, statusFilter])

  return (
    <main className="host-accommodations-page">
      {/* 1. 상단 타이틀 및 신규 등록 버튼 */}
      <div className="host-page-header">
        <div>
          <h2>내 숙소 관리</h2>
          <p>등록한 숙소를 확인하고, 객실과 환불 정책을 설정하여 판매를 관리하세요.</p>
        </div>
        <Link className="btn-host-new" to="/host/accommodations/new">
          <span>+</span> 새 숙소 등록
        </Link>
      </div>

      {/* 2. 검색 및 필터 탭 바 */}
      {items.length > 0 && (
        <div className="host-filter-bar">
          {/* 상태별 필터 칩 */}
          <div className="host-filter-chips">
            {(
              [
                { key: 'ALL', label: `전체 (${items.length})` },
                {
                  key: 'LISTED',
                  label: `공개 (${items.filter((i) => i.listingStatus === 'LISTED').length})`,
                },
                {
                  key: 'DRAFT',
                  label: `작성 중 (${items.filter((i) => i.listingStatus === 'DRAFT').length})`,
                },
                {
                  key: 'HIDDEN',
                  label: `숨김 (${items.filter((i) => i.listingStatus === 'HIDDEN').length})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`filter-chip ${statusFilter === tab.key ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 검색창 */}
          <div className="host-search-box">
            <input
              type="text"
              className="host-search-input"
              placeholder="숙소명, 지역, 카테고리 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <span className="host-search-icon">🔍</span>
          </div>
        </div>
      )}

      {/* 3. 상태 뷰 및 목록 렌더링 */}
      <AsyncView
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        errorMessages={hostErrorMessages}
        onRetry={() => void query.refetch()}
        isEmpty={items.length === 0}
        empty={
          <EmptyState
            title="등록한 숙소가 없습니다"
            description="새 숙소를 등록하고 객실과 환불 정책을 설정해 보세요."
          />
        }
      >
        {filteredItems.length === 0 ? (
          <div className="host-no-results">
            검색 조건에 맞는 숙소가 없습니다.
          </div>
        ) : (
          <ul className="host-accommodation-list">
            {filteredItems.map((item) => {
              const status = LISTING_LABELS[item.listingStatus]
              return (
                <li key={item.id} className="host-card-item">
                  {/* 좌측 정보 영역 (썸네일 + 텍스트) */}
                  <div className="host-card-info">
                    <img
                      src={item.thumbnailUrl || PLACEHOLDER_IMAGE}
                      alt={item.name}
                      className="host-card-thumbnail"
                      loading="lazy"
                    />
                    <div className="host-card-details">
                      <div className="host-card-title-row">
                        <span className={status.className}>{status.label}</span>
                        <h3 className="host-card-title">{item.name}</h3>
                      </div>

                      <div className="host-card-meta">
                        <span>{item.regionName}</span> · <span>{item.categoryName}</span> ·{' '}
                        <span>
                          객실 {item.roomCount}개 (판매 중 {item.activeRoomCount}개)
                        </span>
                      </div>

                      {/* 미공개 상태일 때 안내 문구 */}
                      {item.listingStatus !== 'LISTED' && (
                        <div className="host-card-guide">
                          {item.readyToList ? (
                            <span className="host-card-guide ready">
                              ✓ 필수 정보가 모두 설정되어 공개할 수 있습니다.
                            </span>
                          ) : (
                            <span className="host-card-guide warn">
                              ※ 공개를 위해{' '}
                              {[
                                item.activeRoomCount === 0 ? '판매 중인 객실 등록' : '',
                                item.hasRefundPolicy ? '' : '환불 정책 등록',
                              ]
                                .filter(Boolean)
                                .join(', ')}
                              이(가) 필요합니다.
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 우측 관리 액션 버튼 */}
                  <div className="host-card-actions">
                    <Link
                      to={`/host/accommodations/${item.id}`}
                      className="btn-host-manage"
                    >
                      관리
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </AsyncView>
    </main>
  )
}
