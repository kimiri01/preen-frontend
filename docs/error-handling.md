# HTTP 에러 처리 가이드

브랜치 `test/password-and-reservation-integration-yjhb` · 커밋 `[01]`~`[13]` 반영 기준 (2026-11-27)

서버 요청과 에러 처리를 어떻게 하는지 정리한 문서예요. 새 API·화면을 만들거나 에러 처리를 고칠 때 이 문서를 기준으로 해요.
작업 중에 나온 메모 문서 4개(구현 순서, auth 방식 전환, QueryPage 설계, 도메인별 에러 코드 표)를 리팩터링이 끝난 코드 기준으로 합쳤어요.

---

## 0. 요약 (먼저 읽기)

1. 요청은 **`http`(`@/common/http`)로만** 보내요. `fetch`를 직접 쓰지 않아요.
2. 실패는 **항상 `ApiError`** 하나로 와요. (`status`, `code`, `message`, `data`)
3. 로그인 사용자 전용 API에는 **`{ auth: true }`**를 넣어요. 401 처리는 `client.ts`가 해서 화면에서는 하지 않아요.
4. 화면 문구는 **`getErrorMessage(error, 도메인 문구 표)`** 하나로 정해요.
5. 코드로 분기하는 건 **전용 UI(D)가 필요할 때만** `isErrorCode(error, 도메인_ERROR.XXX)`로 해요. `error.status === 404` 같은 상태 코드 분기는 하지 않아요.
6. 화면 상태는 공통 컴포넌트로 보여줘요: 목록 → **`AsyncView`**, 상세 → **`QueryPage`**, 페이지 전체 → **`Screens`**.
7. **토스트는 쓰지 않아요.** 에러·성공 모두 화면 안에 남는 형태로 보여줘요.

---

## 1. 에러가 지나가는 길

```
fetch ─► unwrap ─► client.ts ─► TanStack Query ─► 화면
         │          │            │                 │
         │          │            │                 └ AsyncView / QueryPage / 폼 문구
         │          │            └ queryClient: 4xx·취소는 재시도 안 함
         │          └ normalizeError로 ApiError 통일, 401 refresh·로그아웃
         └ 4xx·5xx·success:false → ApiError, 성공이면 data만 꺼냄
```

화면 코드는 성공하면 `data`만 받고, 실패하면 `ApiError`만 다뤄요.

---

## 2. 파일 지도

```
src/common/
├── http/
│   ├── ApiError.ts         ApiError 클래스, CLIENT_ERROR_CODE, isApiError
│   ├── normalizeError.ts   fetch가 던진 에러(TypeError·AbortError·TimeoutError) → ApiError
│   ├── unwrap.ts           응답 본문 읽기. 성공이면 data, 실패면 ApiError
│   ├── client.ts           request(): 모든 요청이 지나감. auth·sameOrigin, 401 처리
│   ├── http.ts             http.get/post/put/patch/delete
│   ├── types.ts            ApiResponse<T>, HttpRequestOptions
│   ├── status.ts           statusOf, isNotFound
│   ├── getErrorMessage.ts  getErrorMessage, isErrorCode, fieldErrorsOf, commonErrorMessages
│   └── index.ts            밖에서 쓰는 것만 export → 항상 '@/common/http'에서 import
├── query/queryClient.ts    재시도 규칙, staleTime
├── auth/accessToken.ts     authSession (메모리 access token, version, refresh/clear 연결)
└── components/
    ├── StatusViews.tsx     LoadingBlock, EmptyState, ErrorState, AsyncView
    ├── QueryPage.tsx       상세 페이지용 (AsyncView를 감싼 껍데기)
    └── Screens.tsx         NotFoundView, ForbiddenView, RouteError, ComingSoon

src/features/<도메인>/errorMessages.ts   도메인 코드 상수 + 문구 표 (지금: auth, reservation)
```

삭제된 것: `common/api/http.ts`(`HttpError`), `common/api/getApiError.ts`, `common/utils/error.ts`, `features/reservation/components/Toast.tsx`, `ToastProvider`.

---

## 3. 요청 보내기

### 기본

```ts
import { http } from '@/common/http'

export const reservationApi = {
  get: (id: number) => http.get<Reservation>(`/api/reservations/${id}`, { auth: true }),
  create: (body: CreateReservationBody) =>
    http.post<Reservation>('/api/reservations', body, { auth: true }),
}
```

- 반환값은 `ApiResponse`의 `data`만이에요. 껍데기(`success`, `code`, `message`)는 `unwrap`이 벗겨요.
- body가 객체면 JSON으로 보내고, `FormData`·`Blob`·`URLSearchParams`·문자열은 그대로 보내요. (`FormData`는 브라우저가 `Content-Type`을 채워요)
- `credentials: 'include'`가 기본이에요. (refresh 쿠키)
- 204·빈 본문 성공은 `undefined`를 돌려줘요.

### 인증 옵션

`auth`, `sameOrigin`은 fetch 옵션이 아니라 우리가 만든 옵션이고, fetch에 넘기기 전에 빼요.

| 옵션 | 언제 | 하는 일 |
| --- | --- | --- |
| 없음 | 공개 API (숙소 조회, 회원가입 등) | `VITE_API_BASE_URL`로 요청. 401이면 그대로 에러 |
| `sameOrigin: true` | login, refresh | `/api/...`(Vite 프록시)로 요청해서 refresh 쿠키를 같은 출처로 주고받음 |
| `auth: true` | 로그인 사용자 전용 API | Bearer 토큰 첨부 + 같은 출처 + 만료 시 refresh 후 1회 재시도 |

- `auth: true`면 `sameOrigin`도 자동 적용돼요.
- **login·refresh에는 `auth: true`를 넣으면 안 돼요.** 실패 401에 다시 refresh를 시도해서 꼬여요. (`features/auth/api/login.ts` 참고)

---

## 4. ApiError

```ts
class ApiError extends Error {
  status: number   // HTTP 상태. 서버 응답이 없으면 0
  code: string     // 백엔드 ErrorCode 이름 또는 CLIENT_ERROR_CODE
  data: unknown    // 서버 응답 data (검증 실패 시 필드 오류 배열)
  isClientError    // status === 0
}
```

서버 응답이 없을 때의 `code` (`CLIENT_ERROR_CODE`):

| code | 언제 |
| --- | --- |
| `NETWORK_ERROR` | 서버에 닿지 못함 (꺼짐, 인터넷 끊김, CORS) |
| `TIMEOUT` | `AbortSignal.timeout()` 초과 |
| `CANCELED` | `AbortController.abort()` (페이지 이동, Query 취소) |
| `INVALID_RESPONSE` | JSON이 아니거나 `ApiResponse` 모양이 아님 (nginx 502 HTML 등) |
| `UNKNOWN` | 서버가 code를 안 보냄, 분류 불가 |

`INVALID_RESPONSE`·`UNKNOWN`은 서버 응답이 있으면 `status`가 그 응답의 상태예요.

---

## 5. 401 처리 (`client.ts`)

`auth: true` 요청이 실패했을 때만 해요.

| 응답 | 처리 |
| --- | --- |
| 401 `ACCESS_TOKEN_EXPIRED` | `authSession.refresh()`로 새 토큰을 받아 **1회** 재시도. 다른 요청이 이미 갱신했으면 그 토큰으로 바로 재시도 |
| 401 `SESSION_INVALID` | `authSession.clear()` → 세션 정리, 상단 notice, `RequireLogin`이 로그인 페이지로 |
| 그 밖의 에러 | 그대로 던짐 |

- **refresh 실패:** 화면에는 원래 401을 던지고, 세션 정리는 `useLoginSession`의 `refreshAccessToken`이 해요.
- **동시 요청:** refresh 요청 묶기는 `useLoginSession`의 `refreshAccessToken`이 해요. (`client.ts`에는 공유 Promise가 없어요)
- **요청 도중 세션이 바뀜:** `authSession.getVersion()`이 바뀌었으면(로그아웃·재로그인) refresh·clear를 하지 않아요. 이전 요청이 새 세션을 건드리지 않게 하는 거예요.
- **토큰 없이 보호 API 호출:** 401 `SESSION_INVALID`가 오지만 토큰이 없어서 clear 없이 에러만 던져요.

백엔드 응답 형식 (Security 401·403도 `ApiResponse` JSON):

| 상황 | 응답 |
| --- | --- |
| 토큰 만료 | 401 `ACCESS_TOKEN_EXPIRED` |
| 토큰 위조·형식 오류, 다른 곳에서 로그인 | 401 `SESSION_INVALID` |
| 권한 부족 | 403 `ACCESS_DENIED` |
| 세션 DB 조회 실패 | 503 `SESSION_LOOKUP_UNAVAILABLE` |

refresh API: `POST /api/auth/refresh` (`loginApi.refresh`)

---

## 6. 재시도 (`queryClient.ts`)

| 대상 | 규칙 |
| --- | --- |
| query | 4xx·취소는 재시도 안 함. 5xx·네트워크·타임아웃만 1회 (`MAX_RETRY`) |
| mutation | 재시도 안 함 (기본값) |

`staleTime`은 60초예요. 페이지별로 `retry`를 따로 두지 않아요.

---

## 7. 문구 정하기 (`getErrorMessage`)

```ts
getErrorMessage(error, reservationErrorMessages)
```

순서:

1. `ApiError`가 아니면(코드 버그 등) → 일반 문구 `잠시 후 다시 시도해 주세요.`
2. `status === 0` → 클라이언트 문구 (네트워크·타임아웃 등)
3. **도메인 문구 표** → **공통 문구 표(`commonErrorMessages`)**
4. 5xx면 → 일반 문구 (**서버 message를 숨김**)
5. 서버 `message` → 없으면 일반 문구

그래서:

- 서버 message가 이미 사용자용 문구면 **문구 표에 넣지 않아요.**
- **5xx인데 보여줄 문구가 있으면 반드시 표에 넣어요.** (예: `MAIL_SEND_FAILED`, `SESSION_LOOKUP_UNAVAILABLE`)
- `INVALID_INPUT`은 일부러 넣지 않아요. 서버가 첫 번째 필드 오류나 구체적인 reason을 `message`로 주는데, 표에 넣으면 덮여요.

`commonErrorMessages` 키:

| 출처 | 키 |
| --- | --- |
| `CommonErrorCode` | `TOO_MANY_REQUESTS` |
| `SecurityErrorCode` | `SESSION_INVALID`, `ACCESS_DENIED`, `SESSION_LOOKUP_UNAVAILABLE` |
| `ResponseStatusException` (`status.name()`) | `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND` |
| `StorageErrorCode` | `EMPTY_FILE`, `UNSUPPORTED_IMAGE_TYPE`, `IMAGE_TOO_LARGE` (이 브랜치 백엔드에는 아직 없음) |

### 그 밖의 함수

| 함수 | 용도 |
| --- | --- |
| `isErrorCode(error, ...codes)` | 전용 UI(D) 분기에만 |
| `fieldErrorsOf(error)` | 검증 실패 `data` `[{ field, message }]` → `{ field: message }`. 같은 필드는 첫 번째만 |
| `isNotFound(error)`, `statusOf(error)` | 공통 컴포넌트·queryClient 내부용. 도메인 화면에서는 직접 쓰지 않아요 |

---

## 8. 화면 표시 기준

| 상황 | 표시 방법 |
| --- | --- |
| 주소 오류, 권한 없음, 렌더링 에러 | **Screens** (페이지 전체: `NotFoundView`, `ForbiddenView`, `RouteError`) |
| 상세 페이지 데이터 404 | **EmptyState** + 돌아갈 링크 (QueryPage `notFound`) |
| 상세·목록 데이터의 그 밖의 에러 | **ErrorState** + 다시 시도 |
| 폼 제출 실패 | 필드 옆 `fieldErrorsOf` + 폼 아래 문구 |
| 폼 없는 버튼 동작 실패 | 버튼 근처 문구 (`form-error`, `role="alert"`) |
| 동작 성공 | 화면 상태 변화 (안내 박스, 상태 문구, 페이지 이동) |
| 보조 데이터 실패 (카테고리, 지역) | 표시 없이 기능을 줄여서 동작 |

라우터 (`App.tsx`):

- 최상위 `ErrorBoundary: RouteError` — 헤더(Layout) 자체 에러
- 페이지 묶음 `ErrorBoundary: RouteError` — 페이지 렌더링 에러. 헤더는 남고 본문만 바뀜
- `{ path: '*', Component: NotFoundView }` — 없는 주소. 헤더를 남긴 채 404

---

## 9. 화면 레시피

### 목록: `AsyncView`

```tsx
<AsyncView
  isPending={query.isPending}
  isError={query.isError}
  error={query.error}
  onRetry={() => void query.refetch()}
  isEmpty={items.length === 0}
  empty={<EmptyState title="예약 내역이 없습니다" />}
  errorMessages={reservationErrorMessages}
>
  {/* 목록 */}
</AsyncView>
```

- 선택 옵션: `notFound`(넘기면 404일 때 이걸 보여줌), `fullPage`, `loadingLabel`
- 사용 중: `MyReservationsPage`, `AccommodationListPage`, `AccommodationSection`

### 상세: `QueryPage`

```tsx
export function ReservationSuccessPage() {
  const id = Number(useParams().id)
  const valid = Number.isInteger(id) && id > 0
  const query = useReservation(valid ? id : undefined)

  // ① 주소 id 오류는 QueryPage 전에 거른다 (enabled:false query는 계속 pending → 스피너가 안 끝남)
  if (!valid) return <NotFoundView />

  return (
    <QueryPage
      query={query}
      errorMessages={reservationErrorMessages}
      // ② notFound는 필수. 데이터 404는 EmptyState + 돌아갈 링크
      notFound={
        <EmptyState
          title="예약 정보를 찾을 수 없습니다"
          action={<Link className="btn" to="/me/reservations">내 예약 목록</Link>}
        />
      }
    >
      {/* ③ data는 undefined·null이 아님이 보장됨. hook이 필요하면 별도 컴포넌트로 */}
      {(reservation) => <ReservationSuccess reservation={reservation} />}
    </QueryPage>
  )
}
```

QueryPage 동작:

| 상태 | 화면 |
| --- | --- |
| `data` 있음 | `children(data)` (**데이터 우선**: 백그라운드 갱신이 실패해도 보던 화면 유지) |
| 로딩 | `LoadingBlock fullPage` |
| 404 | `notFound` |
| 그 밖의 에러 | `ErrorState` + 다시 시도 |
| 성공인데 `data`가 `null` | `notFound` |

- `frame`: 로딩·404·에러를 감쌀 페이지 틀. 기본 `<main className="narrow">`. 숙소 상세는 "이전으로" 버튼을 유지하려고 직접 넘겨요.
- **children 함수 안에서는 hook을 못 써요.** 데이터에 의존하는 hook이 있으면 컴포넌트를 분리해요. (`ReservationDetail`, `ReservationSuccess`)
- `refetch`는 TanStack의 안정된 함수를 그대로 넘겨요. 새 함수로 감싸면 그걸 의존성으로 쓰는 `useEffect`가 매 렌더 다시 돌아요.
- 사용 중: `ReservationSuccessPage`, `ReservationDetailPage`, `AccommodationDetailPage`
- 쓰지 않음: `ReservationNewPage` (query 2개 + 폼 페이지)

### 폼 제출 (mutation)

```tsx
createReservation.mutate(body, {
  onSuccess: (r) => navigate(`/reservations/${r.id}/payment`, { replace: true }),
  onError: (error) => {
    // D. 전용 UI가 필요한 코드만 분기
    if (isErrorCode(error, RESERVATION_ERROR.SOLD_OUT, RESERVATION_ERROR.ROOM_NOT_AVAILABLE)) {
      setSoldOut(true)
      return
    }
    setErrors(fieldErrorsOf(error))                                 // A. 필드
    setFormError(getErrorMessage(error, reservationErrorMessages))  // B. 폼 문구
  },
})
```

### 버튼 동작 (폼 없음)

```tsx
cancelReservation.mutate(input, {
  onSuccess: (result) => setCancelResult(result),   // 성공은 "환불 안내" 박스로
  onError: (error) => {
    setCancelError(getErrorMessage(error, reservationErrorMessages))
    void refetch()
  },
})
// ...
{cancelError && <p className="form-error" role="alert">{cancelError}</p>}
```

---

## 10. 도메인 규칙

### 도메인 = 백엔드 ErrorCode enum

| 백엔드 enum | 프론트 도메인 |
| --- | --- |
| `AuthErrorCode` | `features/auth` |
| `AccommodationErrorCode` (아직 없음) | `features/accommodation` |
| `ReservationErrorCode`, `InventoryErrorCode` | `features/reservation` |
| `HostErrorCode` (이 브랜치에 없음) | `features/host` |
| `CommonErrorCode`, `SecurityErrorCode`, `StorageErrorCode` | `common` (`commonErrorMessages`) |

### `features/<도메인>/errorMessages.ts` 모양

```ts
/** 백엔드 XxxErrorCode 이름. 화면에서 코드로 분기할 때(D)만 쓴다. */
export const RESERVATION_ERROR = {
  SOLD_OUT: 'SOLD_OUT',
  // ...
} as const

/** 화면 문구. getErrorMessage(error, 문구 표)로만 쓴다. 서버 message를 그대로 써도 되는 코드는 넣지 않는다. */
export const reservationErrorMessages: Record<string, string> = {
  [RESERVATION_ERROR.SOLD_OUT]: '방금 다른 예약이 먼저 들어와 ...',
}
```

지금 있는 파일: `features/auth/errorMessages.ts`(`AUTH_ERROR`, `authErrorMessages`), `features/reservation/errorMessages.ts`(`RESERVATION_ERROR`, `reservationErrorMessages`). 숙소는 공통 문구 표로 충분해서 없어요.

### 코드마다 처리 방식 하나 (A~E)

| 방식 | 뜻 | 화면 표시 | 예 |
| --- | --- | --- | --- |
| A. 필드 | 특정 입력칸이 틀림 | 입력칸 옆 (`fieldErrorsOf`) | `INVALID_INPUT` |
| B. 폼 | 다시 입력·선택하면 해결 | 폼·버튼 근처 문구 | `EMAIL_ALREADY_REGISTERED`, `CODE_INVALID`, `NOT_CANCELLABLE` |
| C. 대상 없음 | 조회한 데이터가 없음 | `EmptyState` + 돌아갈 링크 | `RESERVATION_NOT_FOUND`, `NOT_FOUND` |
| D. 전용 UI | 화면이 바뀌어야 함 | 도메인이 만든 UI, `isErrorCode`로 분기 | `SOLD_OUT`, `RESEND_TOO_SOON` |
| E. 공통 | 도메인과 무관 | 공통이 처리 | `SESSION_INVALID`, `ACCESS_DENIED`, 5xx, 네트워크 |

**D가 아니면 화면에서 코드로 분기하지 않아요.**

### 해도 됨 / 하면 안 됨

| 해도 됨 | 하면 안 됨 |
| --- | --- |
| `getErrorMessage(error, 도메인 문구 표)` | 컴포넌트 안에 에러 문구 직접 쓰기 |
| `fieldErrorsOf(error)` | 도메인 전용 에러 함수 만들기 (예전 `getApiError` 등) |
| `isErrorCode(error, DOMAIN_ERROR.XXX)` (D만) | `error.status === 404`처럼 상태 코드로 분기, 코드 문자열 직접 쓰기 |
| `StatusViews`, `Screens`, `QueryPage` | 페이지마다 다른 404·에러 화면, 토스트 |
| 로그인 필요한 API에 `auth: true` | 401을 화면에서 처리, `fetch` 직접 호출 |
| 공통 `queryClient` 재시도 규칙 | 페이지마다 `retry` 따로 두기 |

### PR 체크리스트

- [ ] 새 API는 `http` + 필요한 곳에 `auth: true`를 썼나
- [ ] 새 에러 코드를 A~E로 분류했나
- [ ] 서버 message와 다른 문구가 필요하거나 5xx면 문구 표에 넣었나
- [ ] D 코드는 도메인 상수에 넣고 `isErrorCode`로 분기했나
- [ ] 상세 페이지는 QueryPage(`notFound` + 주소 id 먼저 확인), 목록은 AsyncView를 썼나

---

## 11. 도메인별 에러 코드 표

"문구 표" ✅ = 표에 있음 / – = 서버 message 그대로

### 공통

| code | HTTP | 방식 | 문구 표 | 비고 |
| --- | --- | --- | --- | --- |
| `INVALID_INPUT` | 400 | A / B | – | 넣으면 구체적인 reason이 덮임 |
| `TOO_MANY_REQUESTS` | 429 | E | ✅ | |
| `INTERNAL_ERROR` | 500 | E | – | 일반 문구 |
| `ACCESS_TOKEN_EXPIRED` | 401 | E | – | client.ts가 refresh. 화면까지 안 옴 |
| `SESSION_INVALID` | 401 | E | ✅ | client.ts → 세션 정리 |
| `ACCESS_DENIED` | 403 | E | ✅ | |
| `SESSION_LOOKUP_UNAVAILABLE` | 503 | E | ✅ | 5xx라 표 필수 |
| `UNAUTHORIZED` / `FORBIDDEN` | 401 / 403 | E | ✅ | `ResponseStatusException` (refresh 대상 아님) |
| `NOT_FOUND` | 404 | C | ✅ | 숙소·객실 없음 |

### 인증 (`AUTH_ERROR`, `authErrorMessages`)

| code | HTTP | 방식 | 문구 표 | 처리 |
| --- | --- | --- | --- | --- |
| `INVALID_CREDENTIALS` | 401 | B | – | 로그인 폼 (`sameOrigin`이라 refresh 안 함) |
| `ACCOUNT_LOCKED` | 429 | B | – | 로그인 폼 |
| `SESSION_INVALID` | 401 | E (D) | 공통 | `useLoginSession`이 분기해 세션 무효 처리 |
| `ORIGIN_NOT_ALLOWED` | 403 | E | – | 설정 문제 |
| `SIGNUP_PROOF_INVALID` | 400 | B (D 후보) | – | |
| `PASSWORD_RESET_TOKEN_INVALID` | 400 | B (D 후보) | – | |
| `PASSWORD_INVALID`, `AGE_NOT_ALLOWED`, `TERMS_INVALID`, `CODE_INVALID` | 400 | B | – | |
| `EMAIL_ALREADY_REGISTERED` | 409 | B | – | |
| `RESEND_TOO_SOON` | 429 | **D** | – | `useSignupEmail` 재발송 타이머 |
| `CODE_EXPIRED` | 400 | **D** | – | `useSignupEmail` 입력 막음 |
| `CODE_ATTEMPTS_EXCEEDED` | 429 | **D** | – | 입력 막음 |
| `CODE_ALREADY_VERIFIED` | 409 | **D** | – | 입력 막음 |
| `MAIL_SEND_FAILED` | 503 | B | ✅ | 5xx라 표 필수 |

### 예약 (`RESERVATION_ERROR`, `reservationErrorMessages`)

| code | HTTP | 방식 | 쓰는 화면 |
| --- | --- | --- | --- |
| `RESERVATION_NOT_FOUND` | 404 | C | 예약 상세·완료 (QueryPage `notFound`) |
| `ADULT_ONLY` | 403 | B | 예약 생성 |
| `INVALID_DATES` | 400 | B | 예약 생성 |
| `GUEST_COUNT_EXCEEDED` | 400 | B | 예약 생성 |
| `ROOM_NOT_AVAILABLE` | 409 | **D** | 예약 생성 → 매진 안내 |
| `NOT_CANCELLABLE` | 409 | B | 예약 상세 취소 버튼 근처 |
| `SELF_RESERVATION_NOT_ALLOWED` | ? | B | 예약 생성 (백엔드 코드 이름 미확정) |
| `SOLD_OUT` | 409 | **D** | 예약 생성 → 매진 안내 |
| `INVALID_DATE_RANGE`, `DATE_RANGE_TOO_LONG` | 400 | B | 예약 가능 여부 조회 |
| `NOTHING_TO_UPDATE` | 400 | B | 호스트 재고 수정 |
| `TOTAL_COUNT_TOO_SMALL` | 409 | B | 호스트 재고 수정 |

모든 예약 코드가 문구 표에 있어요.

### 숙소 (enum 없음)

`ResponseStatusException`만 써서 `code`가 `NOT_FOUND`·`FORBIDDEN`·`UNAUTHORIZED`·`INVALID_INPUT`(400)이에요. 모두 공통 문구 표나 서버 message로 처리돼서 도메인 문구 표가 없어요. "숙소 없음"과 "객실 없음"이 같은 `NOT_FOUND`라 코드로 구분할 수 없어요. 필요해지면 백엔드에 `AccommodationErrorCode`를 추가해요.

---

## 12. 남은 일 · 확인 필요

| 항목 | 내용 |
| --- | --- |
| 백엔드: 예약·재고 code 형식 | 프론트는 이름(`SOLD_OUT`)으로 바꿨어요(`[01]`). 백엔드 `GlobalExceptionHandler.base()`가 `RESERVATION-001` 같은 번호 대신 enum 이름을 내려주는지 확인 필요. 안 바뀌었으면 매진 화면이 안 뜨고 문구 표도 안 맞아요 |
| 백엔드: 검증 실패 필드 오류 | `MethodArgumentNotValidException`이 `data: [{ field, message }]`를 내려주는지 확인. 없으면 `fieldErrorsOf`가 항상 `{}` |
| 백엔드: `SELF_RESERVATION_NOT_ALLOWED` | 코드 이름 확정 후 `RESERVATION_ERROR` 맞추기 |
| 백엔드: 내 예약 status 필터 | 지원 후 `MyReservationsPage`의 페이지 안 필터(TODO) 삭제 |
| host 브랜치 합칠 때 | `HostErrorCode`·`StorageErrorCode` 확인, `hostErrorMessages`를 `features/host/errorMessages.ts` 모양으로 |
| D 후보 결정 | `SIGNUP_PROOF_INVALID`, `PASSWORD_RESET_TOKEN_INVALID`에 전용 UI를 둘지 |
| 브라우저 확인 | 아래 표 |
| ESLint | 프로젝트에 `eslint.config.*`가 없어 실행 못 함 |

### 브라우저 확인 방법

| 확인 | 방법 | 성공 기준 |
| --- | --- | --- |
| 토큰 만료 | access token 만료를 1분으로 줄이고 1분 뒤 요청 | Network 탭에 `401 → refresh → 재시도` |
| 세션 무효 | 다른 브라우저에서 로그인 후 원래 탭에서 요청 | 상단 notice + 로그인 페이지 |
| 예약 완료 서버 에러 | 백엔드를 끄고 예약 완료 페이지 진입 | "찾을 수 없습니다" 대신 다시 시도 버튼 |
| 숙소 상세 404 | `/accommodations/999999` | "숙소를 찾을 수 없습니다" + "이전으로" |
| 예약 상세 404 | 없는 예약 id | EmptyState + "내 예약 목록" |
| 예약 취소 실패 | 취소할 수 없는 예약 취소 | 관리 버튼 위 문구 |
| 매진 | 재고 0인 날짜로 예약 | 입력값 유지 + 매진 안내 |
| 없는 주소 | `/아무거나` | 헤더 유지 + 404 화면 |
| 4xx 재시도 | GUEST로 보호 API 조회 | 재시도 없이 바로 에러 화면 |

---

## 13. 커밋 기록

| 커밋 | 내용 |
| --- | --- |
| `[01]` 69e7ca8 | 에러 코드를 숫자형에서 이름형(enum name)으로 통일 |
| `[02]` 44f807a | `common/http` 추가 (ApiError, normalizeError, unwrap, client, http, getErrorMessage) |
| `[03]` c5a1774 | `queryClient` 분리, 4xx 재시도 제외 |
| `[04]` d05f0eb | Screens를 `common/components`로 이동 |
| `[05]` 3f4d834 | 예약 취소 토스트 제거, Toast 삭제 |
| `[06]` b44c285 | 상세 페이지를 QueryPage로 통일 (예약 완료, 숙소 상세), `status.ts` |
| `[07]` a1b89d7 | 라우터에 `RouteError`, 없는 주소 404 |
| `[08]` 5f59c83 | 예약 도메인 `common/http`로 교체 |
| `[09]` 0cd2a10 | 숙소 도메인 교체, `AccommodationSection` AsyncView |
| `[10]` 9aac88a | 인증 도메인 교체 (`getApiError` → `getErrorMessage`·`isErrorCode`, `AUTH_ERROR`) |
| `[11]` 1b7d8c8 | 기존 `common/api/http` 삭제, 임시 연결 정리 |
| `[12]` ab4feca | 예약 상세 QueryPage 적용 (`ReservationDetail` 분리) |
| `[13]` 68d5668 | 내 예약 status 서버 필터, `SELF_RESERVATION_NOT_ALLOWED` 추가 |
