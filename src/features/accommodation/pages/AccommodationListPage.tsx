import { Pagination } from '@/common/components/Pagination'
import { AsyncView, EmptyState } from '@/common/components/StatusViews'
import { SERVER_SUPPORTS_KEYWORD_AND_DATES } from '@/features/accommodation/api/accommodationApi'
import { AccommodationRow } from '@/features/accommodation/components/AccommodationRow'
// [kny] 숙박 유형 타일은 메인 카테고리 바와 겹쳐서 숨김 (파일은 그대로 보관)
// import { CategoryTiles } from '@/features/accommodation/components/CategoryTiles'
import { SearchBar } from '@/features/accommodation/components/SearchBar'
import { useFavoriteBinding } from '@/features/accommodation/favoriteBinding'
import {
  useAccommodationSearch} from '@/features/accommodation/hooks/useAccommodationSearch'

import { useCategories } from '@/features/accommodation/hooks/useCategories'
import { useRegions } from '@/features/accommodation/hooks/useRegions'
import type {
  SearchConditions,
  SearchRequest,
} from '@/features/accommodation/types'
import {
  accommodationDetailPath,
  toSearchParams,
  useSearchConditions,
} from '@/features/accommodation/hooks/useSearchConditions'
import '@/features/accommodation/accommodation.css'

const GUEST_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1)

export const PAGE_SIZE = 20

export function toSearchRequest(c: SearchConditions): SearchRequest {
  return {
    categoryId: c.categoryId,
    regionId: c.regionId,
    keyword: c.keyword,
    guestCount: c.guestCount,
    checkIn: c.checkIn,
    checkOut: c.checkOut,
    page: c.page - 1,
    size: PAGE_SIZE,
  }
}


const ALL_HEADING = {
  title: '전체 숙소',
  description:
    '호텔·리조트부터 한옥·게스트하우스까지, 모든 숙박 유형을 한곳에서 비교하세요.',
}
const WEEKEND_HEADING = {
  title: '이번 주말',
  description:
    '이번 주말에 예약 가능한 숙소를 날짜와 가격으로 빠르게 비교하세요.',
}
const REGION_HEADING = {
  title: '지역으로 찾기',
  description:
    '떠나고 싶은 지역을 먼저 고르고, 그 지역의 숙소를 비교해보세요.',
}
/** 시안의 유형별 소개 문구. 이름이 없는 카테고리는 기본 문구를 쓴다. */
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  '호텔·리조트': '편안한 객실과 서비스를 갖춘 호텔·리조트를 찾아보세요.',
  '독채·풀빌라':
    '우리끼리 머무는 독채와 프라이빗 수영장이 있는 풀빌라를 모았어요.',
  한옥: '나무와 기와, 마당의 여유를 느낄 수 있는 한옥에서 머물러보세요.',
  '감성 스테이':
    '풍경과 인테리어가 여행의 이유가 되는, 취향 있는 작은 숙소를 만나보세요.',
  게스트하우스:
    '가볍게 떠나는 여행을 위한 개인실과 소규모 게스트하우스를 찾아보세요.',
}

export function AccommodationListPage() {
  const { conditions, update } = useSearchConditions()
  const regions = useRegions()
  const categories = useCategories()
  const query = useAccommodationSearch(toSearchRequest(conditions))
  const favorites = useFavoriteBinding()

  const category = categories.data?.find(
    (item) => item.id === conditions.categoryId,
  )
  const region = regions.data?.find((item) => item.id === conditions.regionId)
  const province = region?.parentId
    ? regions.data?.find((item) => item.id === region.parentId)
    : region
  const provinces = regions.data?.filter((item) => !item.parentId) ?? []
  const districts =
    regions.data?.filter(
      (item) => province && item.parentId === province.id,
    ) ?? []

  const heading =
    conditions.view === 'weekend'
      ? WEEKEND_HEADING
      : conditions.view === 'region'
        ? REGION_HEADING
        : category
          ? {
              title: category.name,
              description:
                CATEGORY_DESCRIPTIONS[category.name] ??
                `${category.name} 숙소를 한곳에서 비교하세요.`,
            }
          : ALL_HEADING
  const summaryLabel =
    conditions.view === 'weekend'
      ? '이번 주말'
      : !conditions.view && category
        ? category.name
        : (region?.name ?? '전체 지역')

  const unsupported =
    !SERVER_SUPPORTS_KEYWORD_AND_DATES &&
    (conditions.keyword || conditions.checkIn || conditions.checkOut)
  const hasFilter = Boolean(
    conditions.categoryId || conditions.regionId || conditions.guestCount,
  )
  const items = query.data?.content ?? []

  return (
    <main>
      <div className="list-heading">
        <h2>{heading.title}</h2>
        <p>{heading.description}</p>
      </div>

      {/* [kny] 숨김: 메인 카테고리 바와 같은 역할이라 화면에서 뺌. 다시 쓰려면 주석 해제 */}
      {/* <CategoryTiles conditions={conditions} /> */}

      {conditions.view === 'region' && (
        <section className="region-picker" aria-label="지역 선택">
          <h3>어디로 떠나고 싶으세요?</h3>
          <div className="chips">
            {provinces.map((item) => (
              <button
                key={item.id}
                type="button"
                className="chip-item"
                aria-pressed={province?.id === item.id}
                onClick={() => update({ regionId: item.id })}
              >
                {item.name}
              </button>
            ))}
          </div>
          {province && districts.length > 0 && (
            <div className="chips">
              <button
                type="button"
                className="chip-item"
                aria-pressed={region?.id === province.id}
                onClick={() => update({ regionId: province.id })}
              >
                {province.name} 전체
              </button>
              {districts.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="chip-item"
                  aria-pressed={region?.id === item.id}
                  onClick={() => update({ regionId: item.id })}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <SearchBar
        key={toSearchParams({ ...conditions, page: 1 }).toString()}
        conditions={conditions}
      />
      {unsupported && (
        <p className="form-notice" role="status">
          숙소명·날짜 조건은 아직 목록 검색에 적용되지 않습니다. 날짜별 예약
          가능 여부는 숙소 상세에서 확인할 수 있어요.
        </p>
      )}

      <div className="list-layout">
        <aside className="list-filters" aria-label="검색 필터">
          <fieldset>
            <legend>숙박 유형</legend>
            <label className="check">
              <input
                type="radio"
                name="category"
                checked={!conditions.categoryId}
                onChange={() => update({ categoryId: undefined })}
              />
              전체
            </label>
            {categories.data?.map((item) => (
              <label key={item.id} className="check">
                <input
                  type="radio"
                  name="category"
                  checked={conditions.categoryId === item.id}
                  onChange={() => update({ categoryId: item.id })}
                />
                {item.name}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>지역</legend>
            <label className="check">
              <input
                type="radio"
                name="region"
                checked={!conditions.regionId}
                onChange={() => update({ regionId: undefined })}
              />
              전체 지역
            </label>
            {provinces.map((item) => (
              <label key={item.id} className="check">
                <input
                  type="radio"
                  name="region"
                  checked={province?.id === item.id}
                  onChange={() => update({ regionId: item.id })}
                />
                {item.name}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>인원</legend>
            <select
              aria-label="인원"
              value={conditions.guestCount ?? ''}
              onChange={(event) =>
                update({
                  guestCount: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
            >
              <option value="">인원 무관</option>
              {GUEST_OPTIONS.map((count) => (
                <option key={count} value={count}>
                  {count}명
                </option>
              ))}
            </select>
          </fieldset>
          {hasFilter && (
            <button
              type="button"
              className="btn-link"
              onClick={() =>
                update({
                  categoryId: undefined,
                  regionId: undefined,
                  guestCount: undefined,
                })
              }
            >
              필터 초기화
            </button>
          )}
        </aside>

        <section className="list-results">
          <h3>
            {summaryLabel}
            {query.data &&
              ` · ${query.data.totalElements.toLocaleString('ko-KR')}개 숙소`}
          </h3>
          <AsyncView
            isPending={query.isPending}
            isError={query.isError}
            error={query.error}
            onRetry={() => void query.refetch()}
            isEmpty={items.length === 0}
            empty={
              <EmptyState
                title="조건에 맞는 숙소가 없습니다"
                description="날짜를 변경하거나 필터를 줄여 다시 검색해보세요."
              />
            }
          >
            <ul
              className={
                query.isPlaceholderData
                  ? 'plain-list is-stale'
                  : 'plain-list'
              }
            >
              {items.map((accommodation) => (
                <AccommodationRow
                  key={accommodation.id}
                  accommodation={accommodation}
                  to={accommodationDetailPath(accommodation.id, conditions)}
                  isFavorite={favorites.isFavorite(accommodation.id)}
                  onToggleFavorite={favorites.toggle}
                />
              ))}
            </ul>
            <Pagination
              page={conditions.page}
              totalPages={query.data?.totalPages ?? 0}
              onChange={(page) => update({ page })}
            />
          </AsyncView>
        </section>
      </div>
    </main>
  )
}
