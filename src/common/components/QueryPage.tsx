import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { AsyncView } from '@/common/components/StatusViews'

interface QueryPageProps<T> {
  query: UseQueryResult<T>
  /** 404이거나 데이터가 비어 있을 때. 돌아갈 곳이 페이지마다 달라서 필수 (보통 EmptyState + 링크) */
  notFound: ReactNode
  errorMessages?: Record<string, string>
  /** 로딩·404·에러 화면을 감쌀 페이지 틀. 기본은 <main className="narrow"> */
  frame?: (content: ReactNode) => ReactNode
  loadingLabel?: string
  /** 데이터 화면. data는 undefined·null이 아님이 보장된다. hook이 필요하면 별도 컴포넌트로 분리 */
  children: (data: NonNullable<T>) => ReactNode
}

const defaultFrame = (content: ReactNode) => (
  <main className="narrow">{content}</main>
)

/**
 * 상세 페이지용: query 하나의 로딩 · 404 · 에러 · 데이터 화면을 정한다.
 *
 * - 주소 id가 잘못된 경우는 처리하지 않는다. (enabled: false인 query는 계속 pending이라
 *   스피너가 끝나지 않는다) 페이지에서 QueryPage 전에 먼저 걸러야 한다.
 */
export function QueryPage<T>({
  query,
  notFound,
  errorMessages,
  frame = defaultFrame,
  loadingLabel,
  children,
}: QueryPageProps<T>) {
  const { data } = query

  // 데이터가 있으면 먼저 보여준다. 백그라운드 갱신이 실패해도(isError + data) 보던 화면을 유지한다.
  if (data !== undefined && data !== null) return <>{children(data)}</>

  return frame(
    <AsyncView
      fullPage
      loadingLabel={loadingLabel}
      isPending={query.isPending}
      isError={query.isError}
      error={query.error}
      onRetry={() => void query.refetch()}
      notFound={notFound}
      errorMessages={errorMessages}
      // 여기까지 왔는데 로딩·에러가 아니면 성공했지만 데이터가 비어 있는 경우
      isEmpty
      empty={notFound}
    >
      {null}
    </AsyncView>,
  )
}
