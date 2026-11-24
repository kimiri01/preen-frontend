import { http } from '@/common/api/http'
import type { ApiResponse } from '@/common/types/api'

export function requestPasswordReset(email: string) {
  return http.post<ApiResponse<null>>('/api/auth/password-reset/request', { email })
}

export function confirmPasswordReset(token: string, newPassword: string) {
  return http.post<ApiResponse<null>>('/api/auth/password-reset/confirm', { token, newPassword })
}
