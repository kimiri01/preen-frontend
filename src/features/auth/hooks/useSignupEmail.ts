import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { getApiError } from '@/common/api/getApiError'
import { emailVerificationApi } from '@/features/auth/api/emailVerification'
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
  // 실패하면 오류 메시지를 표시하고, 요청이 끝나면 중복 요청 방지를 해제합니다.
  async function sendCode() {
    if (busy.current) return
    busy.current = true
    setError('')
    setNotice('')
    try {
      // 이메일 앞, 뒤 공백 제거 및 소문자 변경
      const normalizedEmail = email.trim().toLowerCase()

      // 1. 정리한 이메일을 넘겨 인증번호 발송 API 실행
      // 2. 서버가 돌려준 인증 요청 ID, 만료 시각, 재발송 대기 시간을 response에 저장해둠
      const response = await sendMutation.mutateAsync(normalizedEmail)

      // 응답을 받은 직후의 시각을 밀리초 단위로 기록
      const receivedAt = Date.now()
      setEmail(normalizedEmail)
      setChallenge(response) // 지금 방송한 번호를 확인하는 데 필요한 정보
      setProof(null) // 번호를 맞혔을 때 받는 인증 성공 정보
      setCode('')
      setBlocked(false)
      setNow(receivedAt)
      setResendAt(receivedAt + response.resendAfterSeconds * 1000)
      setNotice('인증번호를 발송했습니다. 메일함을 확인해 주세요.')
    } catch (cause) {
      const failure = getApiError(cause)
      setError(failure.message)

      // 재발송이 너무 빠르면, 현재 시각부터 60초 뒤에 다시 보낼 수 있도록 설정.
      if (failure.code === 'RESEND_TOO_SOON') {
        setResendAt(Date.now() + 60_000)
        setNow(Date.now()) // 남은 대기 시간을 계산해 기준 시각을 갱신.
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
    event.preventDefault() // 폼 제출로 페이지가 새로고침되는 것을 막음.

    // 처리 중, 발생 기록 없음, 시간 만료, 입력 차단, 이미 인증 완료 중 하나라도 해당하면 종료.
    if (busy.current || !challenge || remaining === 0 || blocked || verified)
      return

    // 인증번호가 숫자 6자리 형식이 아니면 오류 메시지를 표시하고 종료.
    if (!/^[0-9]{6}$/.test(code)) {
      setError('인증번호는 숫자 6자리로 입력해 주세요.')
      return
    }

    busy.current = true
    setError('')
    setNotice('')

    try {
      // 인증번호 검증 API를 호출하고 서버 응답을 대기.
      const response = await verifyMutation.mutateAsync({
        email, // 인증 번호를 받은 이메일 주소
        verificationId: challenge.verificationId, // 발송 응답에서 저장해 둔 인증 요청 ID
        code, // 사용자가 입력한 인증번호
      })
      setProof(response)
      setNow(Date.now())
      setCode('')
      setNotice('이메일 인증이 완료되었습니다.')
    } catch (cause) {
      const failure = getApiError(cause)
      setError(failure.message)

      // 시도 횟수 초과, 번호 만료, 이미 검증 완료인 경우 추가 검증을 막음.
      if (
        [
          'CODE_ATTEMPTS_EXCEEDED',
          'CODE_EXPIRED',
          'CODE_ALREADY_VERIFIED',
        ].includes(failure.code ?? '')
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
