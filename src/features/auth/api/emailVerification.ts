import { http } from '@/common/http'
import type {
  EmailChallenge,
  EmailProof,
  VerifyEmailRequest,
} from '@/features/auth/types'

export const emailVerificationApi = {
  // 이메일 주소를 보내 인증번호 발송을 요청.
  send: (email: string) =>
    http.post<EmailChallenge>('/api/auth/email/send', { email }),

  // 이메일, 인증 요청 ID, 입력한 인증번호를 보내 검증을 요청.
  verify: (request: VerifyEmailRequest) =>
    http.post<EmailProof>('/api/auth/email/verify', request),
}
