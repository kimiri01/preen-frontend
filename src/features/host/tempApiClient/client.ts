import type {
  ApiResponse,
  FieldErrors,
  HttpRequestOptions,
  QueryValue,
} from '@/features/host/tempApiClient/types'

export const NETWORK_ERROR_CODE = 'NETWORK'
export const INVALID_INPUT_CODE = 'COMMON-001'

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fieldErrors?: FieldErrors,
  ) {
    super(message)
    this.name = 'HttpError'
  }

  get isNetworkError() {
    return this.code === NETWORK_ERROR_CODE
  }

  get isServerError() {
    return this.status >= 500 || this.isNetworkError
  }
}

export function buildQueryString(query?: Record<string, QueryValue>) {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    params.set(key, String(value))
  }
  const text = params.toString()
  return text ? `?${text}` : ''
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { success?: unknown }).success === 'boolean'
  )
}

/** 인증 처리 없이 요청을 보내고 ApiResponse를 언래핑한다. */
export async function sendRequest<T>(
  path: string,
  options: HttpRequestOptions = {},
): Promise<T> {
  const { body, query, headers, ...init } = options
  const requestHeaders = new Headers(headers)
  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body
  } else if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json')
    payload = JSON.stringify(body)
  }

  let response: Response
  try {
    response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL ?? ''}${path}${buildQueryString(query)}`,
      { ...init, headers: requestHeaders, body: payload },
    )
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError')
      throw error
    throw new HttpError(0, NETWORK_ERROR_CODE, '네트워크 연결을 확인해 주세요.')
  }

  const text = await response.text()
  let parsed: unknown
  if (text && response.headers.get('content-type')?.includes('json')) {
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = undefined
    }
  }

  if (isApiResponse(parsed)) {
    if (!parsed.success || !response.ok) {
      const fieldErrors =
        parsed.code === INVALID_INPUT_CODE &&
        typeof parsed.data === 'object' &&
        parsed.data !== null
          ? (parsed.data as FieldErrors)
          : undefined
      throw new HttpError(
        response.status,
        parsed.code,
        parsed.message ?? '요청을 처리하지 못했습니다.',
        fieldErrors,
      )
    }
    return parsed.data as T
  }

  if (!response.ok) {
    throw new HttpError(
      response.status,
      `HTTP-${response.status}`,
      '요청을 처리하지 못했습니다.',
    )
  }
  return undefined as T
}
