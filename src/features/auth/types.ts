export interface EmailChallenge {
  verificationId: number
  expiresAt: string
  resendAfterSeconds: number
}

export interface EmailProof {
  signupToken: string
  expiresAt: string
}

export interface VerifyEmailRequest {
  email: string
  verificationId: number
  code: string
}

export interface SignupRequest {
  email: string
  signupToken: string
  name: string
  birthDate: string
  password: string
  passwordConfirmation: string
  termsAgreed: boolean
  privacyAgreed: boolean
  marketingAgreed: boolean
  termsVersion: string
}

export interface SignupResponse {
  userId: number
  role: 'GUEST' | 'HOST' | 'ADMIN'
  status: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe: boolean
}

export interface AccessTokenResponse {
  accessToken: string
}

export interface CurrentMember {
  userId: number
  name: string
  role: 'GUEST' | 'HOST' | 'ADMIN'
}
