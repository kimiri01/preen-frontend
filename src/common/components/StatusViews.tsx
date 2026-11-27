import type { ReactNode } from 'react'
import { getErrorMessage, isNotFound } from '@/common/http'

export function LoadingBlock({
  fullPage = false,
  label = '불러오는 중입니다',
}: {
  fullPage?: boolean
  label?: string
}) {
  return (
    <div
      className={fullPage ? 'state state-full' : 'state'}
      role="status"
      aria-live="polite"
    >
      <span className="spinner" aria-hidden="true" />
      <small>{label}</small>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="state">
      <p>{title}</p>
      {description && <small>{description}</small>}
      {action}
    </div>
  )
}

export function ErrorState({
  error,
  messages,
  onRetry,
  title = '불러오지 못했습니다',
}: {
  error?: unknown
  messages?: Record<string, string>
  onRetry?: () => void
  title?: string
}) {
  return (
    <div className="state" role="alert">
      <p>{title}</p>
      <small>{getErrorMessage(error, messages)}</small>
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  )
}

/** 목록 화면의 로딩 · 빈 결과 · 오류 상태를 한 곳에서 처리한다. */
export function AsyncView({
  isPending,
  isError,
  error,
  onRetry,
  isEmpty = false,
  empty,
  notFound,
  errorMessages,
  fullPage = false,
  loadingLabel,
  children,
}: {
  isPending: boolean
  isError: boolean
  error?: unknown
  onRetry?: () => void
  isEmpty?: boolean
  empty?: ReactNode
  /** 넘기면 404일 때 ErrorState 대신 이걸 보여준다. 안 넘기면 404도 ErrorState */
  notFound?: ReactNode
  errorMessages?: Record<string, string>
  /** 로딩을 화면 높이로 크게 보여줄지 (상세 페이지용) */
  fullPage?: boolean
  loadingLabel?: string
  children: ReactNode
}) {
  if (isPending) return <LoadingBlock fullPage={fullPage} label={loadingLabel} />
  if (isError) {
    if (notFound !== undefined && isNotFound(error)) return <>{notFound}</>
    return (
      <ErrorState error={error} messages={errorMessages} onRetry={onRetry} />
    )
  }
  if (isEmpty) return <>{empty ?? <EmptyState title="결과가 없습니다" />}</>
  return <>{children}</>
}
