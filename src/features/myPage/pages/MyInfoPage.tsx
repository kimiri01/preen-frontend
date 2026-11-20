
import { useEffect, useState } from 'react'
import { getMyInfo, type MyInfo } from '@/features/myPage/api/myInfo'
import { MyInfoForm } from '@/features/myPage/components/MyInfoForm'
import '@/features/myPage/myPage.css'

export function MyInfoPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [myInfo, setMyInfo] = useState<MyInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadMyInfo() {
      try {
        const response = await getMyInfo()

        if (!active) return

        if (!response.success || !response.data) {
          setError('회원정보를 불러오지 못했습니다.')
          return
        }

        setMyInfo(response.data)
      } catch {
        if (active) {
          setError('회원정보를 불러오지 못했습니다. 로그인 상태를 확인해 주세요.')
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadMyInfo()

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="my-info-page">
      <h1>내 정보</h1>
      <p>회원정보를 확인하고 수정할 수 있습니다.</p>

      <section aria-labelledby="my-info-heading">
        <h2 id="my-info-heading">기본 정보</h2>

        {isLoading ? (
          <p role="status">회원정보를 불러오는 중입니다.</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : myInfo ? (
        isEditing ? (
            <MyInfoForm
              initialName={myInfo.name}
              initialBirthDate={myInfo.birthDate}
              onCancel={() => setIsEditing(false)}
              onSaved={(updatedInfo) => {
                setMyInfo(updatedInfo)
                setIsEditing(false)
              }}
            />

          ) : (
            <>
              <div>
                <p>이름</p>
                <p>{myInfo.name}</p>
              </div>

              <div>
                <p>이메일</p>
                <p>{myInfo.email}</p>
              </div>

              <div>
                <p>생년월일</p>
                <p>{myInfo.birthDate}</p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
              >
                정보 수정
              </button>
            </>
          )
        ) : (
          <p role="alert">표시할 회원정보가 없습니다.</p>
        )}
      </section>
    </main>
  )
}
