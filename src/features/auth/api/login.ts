import { http } from '@/common/http'
import type {
  AccessTokenResponse,
  CurrentMember,
  LoginRequest,
} from '@/features/auth/types'

export const loginApi = {
  // login·refresh는 sameOrigin: refresh 쿠키를 같은 출처로 주고받고, 401이어도 refresh를 시도하지 않는다.
  login: (request: LoginRequest) =>
    http.post<AccessTokenResponse>('/api/auth/login', request, {
      sameOrigin: true,
    }),
  refresh: () =>
    http.post<AccessTokenResponse>('/api/auth/refresh', undefined, {
      sameOrigin: true,
    }),
  me: () => http.get<CurrentMember>('/api/auth/me', { auth: true }),
  logout: () => http.post<void>('/api/auth/logout', undefined, { auth: true }),
}
