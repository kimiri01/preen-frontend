
import { useState } from 'react'

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('이름을 입력해 주세요.')
      return
    }

    if (trimmedName.length > 100) {
      setError('이름은 100자 이하로 입력해 주세요.')
      return
    }

    if (!birthDate) {
      setError('생년월일을 입력해 주세요.')
      return
    }

    const parsedDate = new Date(`${birthDate}T00:00:00`)

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toLocaleDateString('sv-SE') !== birthDate
    ) {
      setError('올바른 생년월일을 입력해 주세요.')
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (parsedDate >= today) {
      setError('생년월일은 오늘 이전 날짜여야 합니다.')
      return
    }

    setError('현재는 저장 기능을 사용할 수 없습니다.')
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
          }}
        />
      </div>

      {error && <p role="alert">{error}</p>}

      <div>
        <button type="button" onClick={onCancel}>
          취소
        </button>
        <button type="submit">입력값 확인</button>
      </div>
    </form>
  )
}
