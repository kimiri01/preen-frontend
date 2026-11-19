import { HttpError } from '@/common/api/http'

export function getApiError(
  error: unknown,
  fallback = '서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.',
) {
  if (
    error instanceof HttpError &&
    typeof error.data === 'object' &&
    error.data !== null
  ) {
    const data = error.data as { code?: unknown; message?: unknown }
    return {
      code: typeof data.code === 'string' ? data.code : undefined,
      message:
        typeof data.message === 'string'
          ? data.message
          : '요청을 처리하지 못했습니다. 다시 시도해 주세요.',
    }
  }

  return { code: undefined, message: fallback }
}
