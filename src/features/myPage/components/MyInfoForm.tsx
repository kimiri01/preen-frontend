
import { useState, type FormEvent } from 'react'
import {
  updateMyInfo,
  type MyInfo,
} from '@/features/myPage/api/myInfo'

type MyInfoFormProps = {
  initialName: string
  initialBirthDate: string
  onCancel: () => void
  onSaved: (updatedInfo: MyInfo) => void
}

export function MyInfoForm({
  initialName,
  initialBirthDate,
  onCancel,
  onSaved,
}: MyInfoFormProps) {
  const [name, setName] = useState(initialName)
  const [birthDate, setBirthDate] = useState(initialBirthDate)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // 저장 중에는 중복 제출 방지
    if (isSaving) return

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

    const inputDate = new Date(year, month - 1, day)

    if (inputDate >= today) {
      setError('생년월일은 오늘 이전 날짜여야 합니다.')
      return
    }

    // 입력값 검증을 통과한 경우 서버에 저장 요청
    setIsSaving(true)

    try {
      const response = await updateMyInfo({
        name: trimmedName,
        birthDate,
      })

      if (!response.success || !response.data) {
        setError('회원정보 저장에 실패했습니다.')
        return
      }

      setSuccess('회원정보가 수정되었습니다.')

      // 부모 페이지에 수정된 회원정보 전달
      onSaved(response.data)
    } catch {
      setError(
        '회원정보 저장에 실패했습니다. 로그인 상태를 확인해 주세요.',
      )
    } finally {
      setIsSaving(false)
    }
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
          disabled={isSaving}
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
          disabled={isSaving}
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
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
        >
          취소
        </button>

        <button
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? '저장 중...' : '정보 저장'}
        </button>
      </div>
    </form>
  )
}
