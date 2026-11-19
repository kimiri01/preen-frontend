import type { ApiResponse } from '@/common/types/api'
import { http } from '@/common/api/http'
import type {
  EmailChallenge,
  EmailProof,
  VerifyEmailRequest,
} from '@/features/auth/types'

export const emailVerificationApi = {
  send: (email: string) =>
    http
      .post<ApiResponse<EmailChallenge>>('/api/auth/email/send', { email })
      .then((response) => response.data),
  verify: (request: VerifyEmailRequest) =>
    http
      .post<ApiResponse<EmailProof>>('/api/auth/email/verify', request)
      .then((response) => response.data),
}
