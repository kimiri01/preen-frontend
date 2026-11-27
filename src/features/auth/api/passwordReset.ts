import { http } from '@/common/http'

export function requestPasswordReset(email: string) {
  return http.post<null>('/api/auth/password-reset/request', { email })
}

export function confirmPasswordReset(token: string, newPassword: string) {
  return http.post<null>('/api/auth/password-reset/confirm', {
    token,
    newPassword,
  })
}
