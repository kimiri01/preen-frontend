import { QueryClient } from '@tanstack/react-query'
import { CLIENT_ERROR_CODE, isApiError, statusOf } from '@/common/http'

/** 서버·네트워크 일시 오류일 때 최대 재시도 횟수 */
const MAX_RETRY = 1

function isCanceled(error: unknown): boolean {
  if (isApiError(error)) return error.code === CLIENT_ERROR_CODE.CANCELED
  return error instanceof DOMException && error.name === 'AbortError'
}

/**
 * 400번대(잘못된 요청·권한 없음·없는 대상)와 취소는 다시 보내도 결과가 같으므로 재시도하지 않는다.
 * 5xx·네트워크 오류·타임아웃만 MAX_RETRY번 재시도한다.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isCanceled(error)) return false
  const status = statusOf(error)
  if (status !== undefined && status >= 400 && status < 500) return false
  return failureCount < MAX_RETRY
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: shouldRetry },
  },
})
