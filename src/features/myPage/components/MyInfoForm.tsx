
import { useState, type FormEvent } from 'react'

type MyInfoFormProps = {
  initialName: string
  initialBirthDate: string
  onCancel: () => void
}

export function MyInfoForm({
  initialName,
  initialBirthDate,
  onCancel,
}: MyInfoFormProps) {
  const [name, setName] = useState(initialName)
  const [birthDate, setBirthDate] = useState(initialBirthDate)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    const trimmedName = name.trim()

    // 이름 검증
    if (!trimmedName) {
      setError('이름을 입력해 주세요.')
      return
    }

    if (trimmedName.length > 100) {
      setError('이름은 100자 이하로 입력해 주세요.')
      return
    }

    // 생년월일 입력 검증
    if (!birthDate) {
      setError('생년월일을 입력해 주세요.')
      return
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/

    if (!datePattern.test(birthDate)) {
      setError('올바른 생년월일을 입력해 주세요.')
      return
    }

    const [year, month, day] = birthDate.split('-').map(Number)
    const parsedDate = new Date(Date.UTC(year, month - 1, day))

    // 실제 존재하는 날짜인지 확인
    if (
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() !== month - 1 ||
      parsedDate.getUTCDate() !== day
    ) {
      setError('올바른 생년월일을 입력해 주세요.')
      return
    }

    // 오늘 날짜 및 미래 날짜 차단
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const inputDate = new Date(
      year,
      month - 1,
      day
    )

    if (inputDate >= today) {
      setError('생년월일은 오늘 이전 날짜여야 합니다.')
      return
    }

    // 입력값 검증 성공
    // 실제 API 저장 기능은 아직 연결되지 않았음
    setSuccess(
      '입력값이 올바릅니다. 실제 회원정보 저장 기능은 아직 연결되지 않았습니다.'
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="my-info-name">이름</label>
        <input
          id="my-info-name"
          type="text"
          value={name}
          maxLength={101}
          onChange={(event) => {
            setName(event.target.value)
            setError('')
            setSuccess('')
          }}
        />
      </div>

      <div>
        <label htmlFor="my-info-birth-date">생년월일</label>
        <input
          id="my-info-birth-date"
          type="date"
          value={birthDate}
          onChange={(event) => {
            setBirthDate(event.target.value)
            setError('')
            setSuccess('')
          }}
        />
      </div>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      {success && (
        <p role="status">
          {success}
        </p>
      )}

      <div>
        <button type="button" onClick={onCancel}>
          취소
        </button>

        <button type="submit">
          입력값 확인
        </button>
      </div>
    </form>
  )
}
