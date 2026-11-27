import type { ReactNode } from 'react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

function FullMessage({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <main className="narrow centered">
      <h2>{title}</h2>
      {description && <small>{description}</small>}
      <div className="actions">
        {children ?? (
          <Link className="btn btn-primary" to="/">
            메인으로
          </Link>
        )}
      </div>
    </main>
  )
}

/** 2차 구현 예정 기능의 자리. 제목, 안내, 메인으로 가는 버튼만 둔다. */
export function ComingSoon({ title }: { title: string }) {
  return <FullMessage title={title} description="준비 중입니다." />
}

export function NotFoundView({
  title = '페이지를 찾을 수 없습니다',
  description = '주소가 바르지 않거나 더 이상 제공되지 않는 페이지입니다.',
}: {
  title?: string
  description?: string
}) {
  return <FullMessage title={title} description={description} />
}

export function ForbiddenView({ isGuest = false }: { isGuest?: boolean }) {
  return (
    <FullMessage
      title="권한이 없습니다"
      description={
        isGuest
          ? '호스트만 사용할 수 있는 화면입니다. 사업자 등록 후 이용해 주세요.'
          : '이 화면에 접근할 수 있는 권한이 없습니다.'
      }
    >
      {isGuest && (
        <Link className="btn btn-primary" to="/host/register">
          사업자 등록하기
        </Link>
      )}
      <Link className="btn" to="/">
        메인으로
      </Link>
    </FullMessage>
  )
}

/** 라우트 `errorElement` */
export function RouteError() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404)
    return <NotFoundView />
  return (
    <FullMessage
      title="문제가 발생했습니다"
      description="잠시 후 다시 시도해 주세요."
    >
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => window.location.reload()}
      >
        새로고침
      </button>
      <Link className="btn" to="/">
        메인으로
      </Link>
    </FullMessage>
  )
}
