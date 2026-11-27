import { http } from '@/common/http'
import type { SignupRequest, SignupResponse } from '@/features/auth/types'

export function signup(request: SignupRequest) {
  return http.post<SignupResponse>('/api/auth/signup', request)
}
