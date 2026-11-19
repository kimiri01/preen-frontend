import { useRef, useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { HttpError } from '@/common/api/http'
import { SIGNUP_TERMS_VERSION } from '@/features/auth/data/signupTerms'
import { signup } from '@/features/auth/api/signup'

export function useSignupDetails(
  email: string,
  signupToken: string,
  onComplete: () => void,
) {
  const mutation = useMutation({ mutationFn: signup, retry: false })
  const [error, setError] = useState('')
  const busy = useRef(false)
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [agreements, setAgreements] = useState([false, false, false])
  const today = new Date()
  const passwordValid =
    password.length >= 8 &&
    password.length <= 50 &&
    /[a-zA-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9\s]/.test(password) &&
    !/\s/.test(password)
  const mismatch = confirmation.length > 0 && password !== confirmation
  const limitYear = today.getFullYear() - 14
  const lastDayOfMonth = new Date(limitYear, today.getMonth() + 1, 0).getDate()
  const ageLimit = new Date(
    limitYear,
    today.getMonth(),
    Math.min(today.getDate(), lastDayOfMonth),
  )
  const latestBirthDate = `${ageLimit.getFullYear()}-${String(ageLimit.getMonth() + 1).padStart(2, '0')}-${String(ageLimit.getDate()).padStart(2, '0')}`
  const birthValid = birthDate !== '' && birthDate <= latestBirthDate
  const valid =
    name.trim().length > 0 &&
    birthValid &&
    passwordValid &&
    password === confirmation &&
    agreements[0] &&
    agreements[1]

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || busy.current || !event.currentTarget.checkValidity()) return
    busy.current = true
    setError('')
    try {
      await mutation.mutateAsync({
        email,
        signupToken,
        name: name.trim(),
        birthDate,
        password,
        passwordConfirmation: confirmation,
        termsAgreed: agreements[0],
        privacyAgreed: agreements[1],
        marketingAgreed: agreements[2],
        termsVersion: SIGNUP_TERMS_VERSION,
      })
      setPassword('')
      setConfirmation('')
      onComplete()
    } catch (cause) {
      if (
        cause instanceof HttpError &&
        typeof cause.data === 'object' &&
        cause.data !== null &&
        'message' in cause.data &&
        typeof cause.data.message === 'string'
      ) {
        setError(cause.data.message)
      } else {
        setError(
          '회원가입 요청을 완료하지 못했습니다. 서버 연결을 확인한 후 다시 시도해 주세요.',
        )
      }
    } finally {
      busy.current = false
    }
  }

  function toggleAgreement(index: number) {
    setAgreements((current) =>
      current.map((value, i) => (i === index ? !value : value)),
    )
  }

  function toggleAll() {
    setAgreements((current) => current.map(() => !current.every(Boolean)))
  }

  return {
    name,
    setName,
    birthDate,
    setBirthDate,
    password,
    setPassword,
    confirmation,
    setConfirmation,
    agreements,
    toggleAgreement,
    toggleAll,
    maxBirthDate: latestBirthDate,
    submit,
    error,
    pending: mutation.isPending,
    passwordValid,
    mismatch,
    valid,
  }
}
