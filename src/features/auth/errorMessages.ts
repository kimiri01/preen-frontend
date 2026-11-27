/**
 * 백엔드 AuthErrorCode 이름 중 화면에서 분기하는 코드(전용 UI).
 * 그 밖의 코드는 서버 message가 이미 사용자용 문구라 따로 두지 않는다.
 */
export const AUTH_ERROR = {
  /** 세션 무효 → 세션 정리 */
  SESSION_INVALID: 'SESSION_INVALID',
  /** 재발송 대기 → 재발송 타이머 설정 */
  RESEND_TOO_SOON: 'RESEND_TOO_SOON',
  /** 인증번호 입력을 막는 코드 */
  CODE_EXPIRED: 'CODE_EXPIRED',
  CODE_ATTEMPTS_EXCEEDED: 'CODE_ATTEMPTS_EXCEEDED',
  CODE_ALREADY_VERIFIED: 'CODE_ALREADY_VERIFIED',
} as const

/**
 * 화면 문구. getErrorMessage(error, authErrorMessages)로만 쓴다.
 * 5xx는 서버 message를 숨기므로, 사용자에게 보여줄 5xx 문구만 넣는다.
 */
export const authErrorMessages: Record<string, string> = {
  MAIL_SEND_FAILED:
    '인증메일을 발송하지 못했습니다. 잠시 후 다시 시도해 주세요.', // 503
}
