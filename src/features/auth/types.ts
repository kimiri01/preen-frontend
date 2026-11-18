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
