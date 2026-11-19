import type { ApiResponse } from '@/common/types/api'
import { http } from '@/common/api/http'
import type {
  EmailChallenge,
  EmailProof,
  VerifyEmailRequest,
} from '@/features/auth/types'

export const emailVerificationApi = {
  // 이메일 주소를 보내 인증번호 발송을 요청.
  send: (email: string) =>
    http
      .post<ApiResponse<EmailChallenge>>('/api/auth/email/send', { email })
      .then((response) => response.data), // 인증 요청 ID, 만료 시각, 재발송 대기 시간을 반환.

  // 이메일, 인증 요청 ID, 입력한 인증번호를 보내 검증을 요청.
  verify: (request: VerifyEmailRequest) =>
    http
      .post<ApiResponse<EmailProof>>('/api/auth/email/verify', request)
      .then((response) => response.data), // 검증 성공 시 가입용 토큰과 만료 시각을 반환.
}
