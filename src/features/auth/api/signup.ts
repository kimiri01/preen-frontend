import type { ApiResponse } from '@/common/types/api'
import { http } from '@/common/api/http'
import type { SignupRequest, SignupResponse } from '@/features/auth/types'

export function signup(request: SignupRequest) {
  return http
    .post<ApiResponse<SignupResponse>>('/api/auth/signup', request)
    .then((response) => response.data)
}
