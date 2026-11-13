# PREEN Frontend

기존 홈페이지 시안을 React + TypeScript + Vite로 옮긴 프로젝트입니다.

## 실행

Node.js 22.12 이상(또는 20.19 이상)이 필요합니다.

```sh
npm ci
npm run dev
npm run typecheck
npm run build
npm run preview
```

## 디렉터리 구조

```text
public/images/                  기존 시안 이미지
src/
├── common/
│   ├── api/http.ts              공통 HTTP 클라이언트와 HttpError
│   ├── components/              Layout, Header, Footer
│   ├── styles/                  공통 스타일과 반응형 레이아웃
│   └── types/                   공통 요청 타입
├── features/
│   ├── accommodation/
│   │   ├── components/          숙소 카드 및 목록 섹션
│   │   ├── data/                시안용 예시 숙소 데이터
│   │   ├── hooks/               화면 내 찜 상태
│   │   ├── public.ts            다른 Feature에 공개하는 진입점
│   │   └── types.ts             숙소 타입
│   └── mainPage/
│       ├── components/          배너, 검색, 지역, 큐레이션, 고객 지원
│       ├── pages/MainPage.tsx   메인 화면 조합
│       ├── mainPage.css         메인 화면 스타일
│       ├── public.ts            공개 라우트
│       └── routes.ts            메인 페이지 경로
├── App.tsx                      Feature 라우트와 공통 Layout 조합
└── main.tsx                     React 및 QueryClientProvider 초기화
```

아직 구현하지 않은 auth 및 API 연동용 디렉터리는 기능을 개발할 때 추가합니다.

## 협업 규칙

- `@/`는 `src/`를 가리킵니다. Vite와 TypeScript에 모두 설정되어 있습니다.
- Common은 Feature를 import하지 않습니다.
- 다른 Feature의 코드는 해당 Feature의 `public.ts`를 통해서만 사용합니다.
- 페이지는 `pages/`, 기능 UI는 `components/`, 상태 로직은 `hooks/`, 타입은 `types.ts`에 둡니다.
- 새로운 페이지는 Feature의 `routes.ts`에서 정의하고 공개 진입점을 통해 App에서 조합합니다.
- 서버 연동 시 URL과 메서드는 Feature의 `api/`에 정의하고 `@/common/api/http`를 사용합니다.
- 서버 상태는 Feature의 Custom Hook에서 TanStack Query로 관리하고, 조회 조건을 Query Key에 포함합니다.

## 현재 구현 범위

기존 시안의 화면, 이미지, 반응형 스타일을 유지했습니다. 개발용 인증 흐름 설명 영역은 화면에서 제거했습니다.
숙소 찜은 React의 메모리 상태이며 페이지를 새로고침하면 초기화됩니다.
검색, 카테고리, 더 보기, 로그인, 예약 및 푸터 버튼은 기존 시안처럼 UI만 있으며 서버에 연결되어 있지 않습니다.

TanStack Query Provider는 설정되어 있으며, 정적 예시 데이터에 불필요한 서버 요청은 하지 않습니다.
백엔드 계약이 정해지면 Feature의 `api/`와 조회·변경 Hook을 추가하세요.
`.env.example`을 참고하여 `VITE_API_BASE_URL`을 지정할 수 있습니다.
공통 HTTP 클라이언트는 JSON 요청, 응답 처리, HTTP 오류, 쿠키 전송을 지원합니다.
토큰 저장·갱신은 인증 API 계약 확정 후 공통 클라이언트에 통합해야 합니다.

정적 호스팅에서 하위 경로를 추가한다면 SPA fallback을 `index.html`로 설정해야 합니다.
