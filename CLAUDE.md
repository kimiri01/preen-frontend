# preen-frontend 작업 규칙

숙박 플랫폼 preen의 프론트엔드다. React 19 + TypeScript + Vite + TanStack Query v5 + React Router v7을 쓴다.
백엔드는 `../preen-backend`(Spring Boot)이고, 개발 서버에서는 Vite가 `/api` 요청을 `http://127.0.0.1:8080`으로 전달한다.

## 작업 전후에 반드시 지킬 것

- 요청받은 범위만 수정한다. 요청받지 않은 기존 코드는 리팩터링하거나 이름을 바꾸지 않는다. 고치면 좋을 부분을 발견하면 수정하지 말고 보고한다.
- `src/common/` 아래 공통 코드와 디렉터리 구조를 바꿔야 하면 먼저 사용자에게 확인을 받는다.
  (공통 HTTP·인증은 윤정, 공통 레이아웃·헤더·푸터는 나영 담당)
- 작업이 끝나면 아래 명령을 실행해서 모두 통과하는지 확인하고 결과를 알려준다.

```bash
npm run typecheck
npm run format:check   # 실패하면 npm run format 으로 정리
npm run build
```

## 1. 디렉터리와 import

- 기능 코드는 `src/features/<기능명>/`에 둔다. 현재 기능: `accommodation`, `auth`, `mainPage`.
- 여러 기능이 같이 쓰는 코드만 `src/common/`에 둔다.
- `src/common/`은 `src/features/`를 import하지 않는다.
- 다른 기능의 코드는 그 기능의 `public.ts`에서만 가져온다. 다른 기능 내부 파일을 직접 import하지 않는다.
- import 경로는 항상 `@/`(= `src/`)로 시작한다. `../` 상대 경로를 쓰지 않는다.

```ts
// ✅
import { useLoginSession } from '@/features/auth/public'
import { http } from '@/common/api/http'

// ❌ 다른 기능 내부 파일 직접 import, 상대 경로
import { useLoginSession } from '@/features/auth/hooks/useLoginSession'
import { http } from '../../common/api/http'
```

### 기능 폴더 안의 역할 (필요한 것만 만든다)

| 위치 | 역할 |
| --- | --- |
| `api/` | `http`로 서버를 호출하는 함수. 서버 응답을 화면용 타입으로 바꿔서 반환한다. |
| `hooks/` | `useQuery`/`useMutation`을 감싼 커스텀 훅과 재사용 로직 |
| `components/` | 기능 UI 조각 |
| `pages/` | 라우트에 연결되는 화면 |
| `data/` | 화면에 고정으로 쓰는 목록 데이터 |
| `utils/` | 기능 전용 유틸 함수 |
| `types.ts` | 기능의 데이터 타입과 API 요청·응답 타입 |
| `routes.ts` | `RouteObject[]`로 경로와 페이지 연결 |
| `public.ts` | 다른 기능과 `App.tsx`에 공개할 것만 export |

## 2. 이름 규칙

- 컴포넌트 파일·함수: PascalCase (`CategoryBar.tsx`, `AccommodationListPage.tsx`). 페이지는 `~Page`로 끝낸다.
- 훅: `use`로 시작하는 camelCase (`useAccommodations.ts`)
- API 함수: `fetch~`(조회), `create~`/`update~`/`delete~`(변경)
- 서버 응답 타입: 백엔드 DTO 이름과 같게 짓는다 (`AccommodationSummaryResponse`)
- 컴포넌트는 `export function`으로 이름 붙여 export한다. `export default`는 쓰지 않는다.

## 3. 라우팅

- 새 페이지는 기능의 `routes.ts`에 추가하고, `public.ts`에서 export한 뒤 `src/App.tsx`의 `children`에 합친다.

```ts
// features/<기능>/routes.ts
export const reservationRoutes: RouteObject[] = [
  { path: 'reservations', Component: ReservationListPage },
]
```

## 4. 서버 호출 (`api/`)

- 반드시 `@/common/api/http`의 `http.get/post/put/patch/delete`를 쓴다. `fetch`, axios를 직접 쓰지 않는다.
- 로그인이 필요한 API는 `{ auth: true }`를 넘긴다. 토큰을 붙이는 코드·재발급 코드를 기능 안에 따로 만들지 않는다.
- 백엔드는 모든 응답을 `ApiResponse<T>`(`success`, `data`, `code`, `message`)로 감싸서 보낸다. 목록은 `ApiResponse<PageResponse<T>>`다. 둘 다 `@/common/types/api`에 있다.
- `api/` 함수는 `response.data`를 꺼내서 반환한다. 필요하면 화면용 타입으로 변환한다.

```ts
import { http } from '@/common/api/http'
import type { ApiResponse } from '@/common/types/api'

export async function fetchAccommodationDetail(id: number) {
  const response = await http.get<ApiResponse<AccommodationDetailResponse>>(
    `/api/accommodations/${id}`,
  )
  return response.data
}

// 로그인 필요한 API
export async function fetchFavorites() {
  const response = await http.get<ApiResponse<FavoriteResponse[]>>(
    '/api/favorites',
    { auth: true },
  )
  return response.data
}
```

## 5. 서버 상태 (TanStack Query)

- 조회는 `useQuery`, 생성·수정·삭제는 `useMutation`을 쓰고 `hooks/`의 커스텀 훅으로 감싼다. 컴포넌트에서 `api/` 함수를 직접 호출하지 않는다.
- Query Key는 기능별 키 팩토리로 만든다. 첫 요소는 기능명이고, 응답을 바꾸는 조건(ID, 필터, 페이지, 정렬)을 모두 넣는다. 본보기는 `features/accommodation/hooks/useAccommodationSearch.ts`의 `accommodationKeys`다.

```ts
export const reservationKeys = {
  all: ['reservation'] as const,
  list: (filters: ReservationFilter) =>
    [...reservationKeys.all, 'list', filters] as const,
  detail: (id: number) => [...reservationKeys.all, 'detail', id] as const,
}

export function useReservation(id: number) {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: () => fetchReservation(id),
  })
}
```

- 변경 후에는 관련 키를 무효화한다: `queryClient.invalidateQueries({ queryKey: reservationKeys.all })`

## 6. 오류와 로딩 화면

- 서버 오류 메시지는 `@/common/api/getApiError`의 `getApiError(error)`로 꺼낸다. 백엔드 오류 응답의 `code`, `message`를 반환한다.
- 로딩·오류·빈 화면은 `@/common/components/StatusViews`의 컴포넌트를 먼저 찾아서 쓴다.

## 7. 코드 스타일

- Prettier 설정을 따른다: 세미콜론 없음, 작은따옴표, trailing comma. 손으로 맞추지 말고 `npm run format`을 쓴다.
- `any`를 쓰지 않는다. 모르는 값은 `unknown`으로 받고 좁힌다.
- 타입만 가져올 때는 `import type`을 쓴다 (`verbatimModuleSyntax` 설정).
- 주석은 한국어로, "왜 이렇게 했는지"가 필요한 곳에만 단다.

## 8. 환경변수와 보안

- `.env`는 Git에 올리지 않는다(이미 `.gitignore`에 있다).
- `VITE_`로 시작하는 환경변수는 브라우저에 그대로 노출된다. 비밀번호·비밀키는 프론트 `.env`에 절대 넣지 않는다.
- Access Token은 `@/common/auth/accessToken`이 메모리에만 보관한다. `localStorage`/`sessionStorage`에 토큰을 저장하지 않는다.

## 9. Git

- `main`(배포)과 `develop`(통합)에 직접 커밋하지 않는다. `develop`에서 `feature/<작업-내용>` 브랜치를 만든다. 예: `feature/reservation-list`
- 커밋 제목은 `type:제목` 형식. 본문에는 무엇을 왜 바꿨는지 적는다.
  type: `feat` `fix` `docs` `style` `refactor` `test` `build` `ci` `perf` `chore`

```text
feat:예약 목록 화면 추가

마이페이지에서 내 예약을 확인할 수 있도록 예약 목록 조회 화면을 추가한다.
```

- PR 본문 순서: 1. 작업 내용 2. 변경 사항 3. 확인 포인트(확인한 방법·결과) 4. 관련 이슈·문서. 임시 데이터나 API 연동 대기 사항이 있으면 적는다. 리뷰어 2명 승인 후 머지한다.
- 커밋·푸시·PR 생성은 사용자가 요청했을 때만 한다.
