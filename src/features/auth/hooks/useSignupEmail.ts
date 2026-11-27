import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { getErrorMessage, isErrorCode } from '@/common/http'
import { emailVerificationApi } from '@/features/auth/api/emailVerification'
import { AUTH_ERROR, authErrorMessages } from '@/features/auth/errorMessages'
import type { EmailChallenge, EmailProof } from '@/features/auth/types'

export function useSignupEmail() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [challenge, setChallenge] = useState<EmailChallenge | null>(null)
  const [proof, setProof] = useState<EmailProof | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [blocked, setBlocked] = useState(false)
  const [resendAt, setResendAt] = useState(0)
  const [now, setNow] = useState(Date.now())
  const busy = useRef(false)
  const sendMutation = useMutation({
    mutationFn: emailVerificationApi.send,
    retry: false,
  })
  const verifyMutation = useMutation({
    mutationFn: emailVerificationApi.verify,
    retry: false,
  })
  const pending = sendMutation.isPending || verifyMutation.isPending

  useEffect(() => {
    if (!challenge && resendAt === 0) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [challenge, resendAt])

  const remaining = challenge
    ? Math.max(0, Math.ceil((Date.parse(challenge.expiresAt) - now) / 1000))
    : 0
  const resendRemaining = Math.max(0, Math.ceil((resendAt - now) / 1000))
  const verified = proof !== null && Date.parse(proof.expiresAt) > now
  const proofExpired = proof !== null && !verified

  function changeEmail(value: string) {
    setEmail(value)
    setError('')
    setNotice('')
  }

  function changeCode(value: string) {
    setCode(value.replace(/[^0-9]/g, '').slice(0, 6))
    setError('')
    setNotice('')
  }

  // 인증번호를 발송하고 인증 화면과 재발송 대기 시간을 갱신합니다.
  async function sendCode() {
    if (busy.current) return
    busy.current = true
    setError('')
    setNotice('')
    try {
      const normalizedEmail = email.trim().toLowerCase()

      const response = await sendMutation.mutateAsync(normalizedEmail)

      const receivedAt = Date.now()
      setEmail(normalizedEmail)
      setChallenge(response)
      setProof(null)
      setCode('')
      setBlocked(false)
      setNow(receivedAt)
      setResendAt(receivedAt + response.resendAfterSeconds * 1000)
      setNotice('인증번호를 발송했습니다. 메일함을 확인해 주세요.')
    } catch (cause) {
      setError(getErrorMessage(cause, authErrorMessages))

      if (isErrorCode(cause, AUTH_ERROR.RESEND_TOO_SOON)) {
        setResendAt(Date.now() + 60_000)
        setNow(Date.now())
      }
    } finally {
      busy.current = false
    }
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = event.currentTarget.elements.namedItem(
      'email',
    ) as HTMLInputElement
    if (!input.validity.valid || !email.trim()) {
      setError('올바른 이메일 주소를 입력해 주세요.')
      input.focus()
      return
    }
    await sendCode()
  }

  // 입력한 인증번호를 서버에서 검증하고, 성공하면 가입용 토큰을 저장.
  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (busy.current || !challenge || remaining === 0 || blocked || verified)
      return

    if (!/^[0-9]{6}$/.test(code)) {
      setError('인증번호는 숫자 6자리로 입력해 주세요.')
      return
    }

    busy.current = true
    setError('')
    setNotice('')

    try {
      const response = await verifyMutation.mutateAsync({
        email,
        verificationId: challenge.verificationId,
        code,
      })
      setProof(response)
      setNow(Date.now())
      setCode('')
      setNotice('이메일 인증이 완료되었습니다.')
    } catch (cause) {
      setError(getErrorMessage(cause, authErrorMessages))

      if (
        isErrorCode(
          cause,
          AUTH_ERROR.CODE_ATTEMPTS_EXCEEDED,
          AUTH_ERROR.CODE_EXPIRED,
          AUTH_ERROR.CODE_ALREADY_VERIFIED,
        )
      ) {
        setBlocked(true)
      }
    } finally {
      busy.current = false
    }
  }

  function changeAddress() {
    if (busy.current) return
    setChallenge(null)
    setProof(null)
    setCode('')
    setBlocked(false)
    setError('')
    setNotice('')
  }

  return {
    email,
    code,
    challenge,
    proof,
    error,
    notice,
    pending,
    verified,
    proofExpired,
    remaining,
    resendRemaining,
    blocked,
    sending: sendMutation.isPending,
    changeEmail,
    changeCode,
    submitEmail,
    submitCode,
    sendCode,
    changeAddress,
  }
}
