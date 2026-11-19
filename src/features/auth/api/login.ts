import { http } from '@/common/api/http'
import type { ApiResponse } from '@/common/types/api'
import type {
  AccessTokenResponse,
  CurrentMember,
  LoginRequest,
} from '@/features/auth/types'

export const loginApi = {
  login: (request: LoginRequest) =>
    http
      .post<ApiResponse<AccessTokenResponse>>('/api/auth/login', request, {
        sameOrigin: true,
      })
      .then((response) => response.data),
  refresh: () =>
    http
      .post<ApiResponse<AccessTokenResponse>>('/api/auth/refresh', undefined, {
        sameOrigin: true,
      })
      .then((response) => response.data),
  me: () =>
    http
      .get<ApiResponse<CurrentMember>>('/api/auth/me', { auth: true })
      .then((response) => response.data),
  logout: () => http.post<void>('/api/auth/logout', undefined, { auth: true }),
}
