
import { useState } from 'react'
import { MyInfoForm } from '@/features/myPage/components/MyInfoForm'
import '@/features/myPage/myPage.css'

export function MyInfoPage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <main className="my-info-page">
      <h1>내 정보</h1>
      <p>회원정보를 확인하고 수정할 수 있습니다.</p>

      <section aria-labelledby="my-info-heading">
        <h2 id="my-info-heading">기본 정보</h2>

        {isEditing ? (
          <MyInfoForm
            initialName=""
            initialBirthDate=""
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div>
              <p>이름</p>
              <p>로그인 후 표시됩니다.</p>
            </div>

            <div>
              <p>이메일</p>
              <p>로그인 후 표시됩니다.</p>
            </div>

            <div>
              <p>생년월일</p>
              <p>로그인 후 표시됩니다.</p>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
            >
              정보 수정
            </button>
          </>
        )}
      </section>
    </main>
  )
}
