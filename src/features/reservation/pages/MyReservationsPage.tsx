import { Link, useSearchParams } from 'react-router-dom'
import { Pagination } from '@/common/components/Pagination'
import { AsyncView, EmptyState } from '@/common/components/StatusViews'
import { ReservationListItem } from '@/features/reservation/components/ReservationParts'
import {
  isHoldExpired,
  useMyReservations,
} from '@/features/reservation/hooks/useReservations'
import '@/features/reservation/reservation.css'

type FilterStatus = 'ALL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

const FILTER_TABS: { key: FilterStatus; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'CONFIRMED', label: '예약 확정' },
  { key: 'COMPLETED', label: '이용 완료' },
  { key: 'CANCELLED', label: '취소 완료' },
]

export function MyReservationsPage() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)
  const currentTab = (params.get('status') as FilterStatus) || 'ALL'
  const query = useMyReservations(page)
  const items = query.data?.content ?? []

  const handleTabClick = (key: FilterStatus) => {
    const nextParams: Record<string, string> = {}
    if (key !== 'ALL') {
      nextParams.status = key
    }
    setParams(nextParams)
  }

  // 선택된 탭 상태에 맞춰 목록 필터링
  const displayedItems = items.filter((item) => {
    if (currentTab === 'ALL') return true
    return item.status === currentTab
  })

  return (
    <main className="medium">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
        <h2>내 예약</h2>
        <p className="muted" style={{ fontSize: '15px' }}>
          숙소명·숙박 일정·예약 상태를 확인하세요.
        </p>
      </div>

      {/* 예약 상태 필터 탭 바 (전체 / 예약 확정 / 이용 완료 / 취소 완료) */}
      <div className="reservation-filter-tabs" role="tablist">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={currentTab === tab.key}
            className={`reservation-tab-item ${currentTab === tab.key ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AsyncView
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={() => void query.refetch()}
        isEmpty={items.length === 0}
        empty={
          <EmptyState
            title="예약 내역이 없습니다"
            action={
              <Link className="btn btn-primary" to="/accommodations">
                숙소 둘러보기
              </Link>
            }
          />
        }
      >
        {displayedItems.length === 0 ? (
          <EmptyState
            title="해당 상태의 예약 내역이 없습니다"
            action={
              <button
                type="button"
                className="btn btn-small"
                onClick={() => handleTabClick('ALL')}
              >
                전체 내역 보기
              </button>
            }
          />
        ) : (
          <ul className="stack plain-list">
            {displayedItems.map((reservation) => (
              <ReservationListItem
                key={reservation.id}
                reservation={reservation}
                actions={
                  <>
                    {reservation.status === 'PENDING' &&
                      !isHoldExpired(reservation) && (
                        <Link
                          className="btn btn-primary btn-small"
                          to={`/reservations/${reservation.id}/payment`}
                        >
                          결제하기
                        </Link>
                      )}
                    {reservation.status === 'COMPLETED' && (
                      <Link
                        className="btn btn-primary btn-small"
                        to={`/reservations/${reservation.id}/review`}
                      >
                        리뷰 남기기
                      </Link>
                    )}
                    <Link
                      className="btn btn-small"
                      to={`/me/reservations/${reservation.id}`}
                    >
                      상세 보기
                    </Link>
                  </>
                }
              />
            ))}
          </ul>
        )}
        <Pagination
          page={page}
          totalPages={query.data?.totalPages ?? 0}
          onChange={(next) => {
            const nextParams: Record<string, string> = {}
            if (currentTab !== 'ALL') nextParams.status = currentTab
            if (next > 1) nextParams.page = String(next)
            setParams(nextParams)
          }}
        />
      </AsyncView>
    </main>
  )
}
