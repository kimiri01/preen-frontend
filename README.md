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
├── stays/                      숙소 카드 사진 36장 (카테고리별 6장, 출처는 아래 "이미지 출처 및 저작권")
└── image-upload-placeholder.png  숙소 사진이 없거나 깨졌을 때 보여 주는 "이미지 업로드" 안내 이미지
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
│   │   ├── utils/               사진 대체 이미지 처리 (imageFallback.ts)
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

회원가입과 로그인·로그아웃 화면, API, 상태 로직은 `src/features/auth/`에 있습니다.

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
검색, 카테고리, 더 보기, 예약 및 푸터 버튼은 기존 시안처럼 UI만 있으며 서버에 연결되어 있지 않습니다.

TanStack Query Provider는 설정되어 있으며, 정적 예시 데이터에 불필요한 서버 요청은 하지 않습니다.
백엔드 계약이 정해지면 Feature의 `api/`와 조회·변경 Hook을 추가하세요.
공통 HTTP 클라이언트는 JSON 요청, 응답 처리, HTTP 오류, 쿠키 전송을 지원합니다.
보호 API를 호출할 때 공통 `http`에 `{ auth: true }`를 넘기면 Access Token을 붙입니다. 예를 들어 `http.get('/api/favorites', { auth: true })`처럼 호출합니다. Access Token은 메모리에 저장하며, 만료되면 Refresh 쿠키로 한 번 재발급해 요청을 다시 보냅니다.

## 로컬 로그인 확인

1. 백엔드에서 Redis와 Spring Boot를 실행합니다. 백엔드의 `.env`에 `REDIS_PASSWORD`와 `JWT_SIGNING_KEY`를 설정합니다. 로컬 HTTP에서는 `REFRESH_COOKIE_SECURE=false`를 사용합니다.
2. 프론트 개발 서버를 실행하고 브라우저에서 `http://localhost:5173`을 엽니다. 이 주소는 백엔드의 `FRONTEND_ORIGIN`과 같아야 합니다. Vite는 기본적으로 `/api`를 `http://127.0.0.1:8080`에 전달합니다. 백엔드 주소가 다르면 `API_PROXY_TARGET`을 설정합니다.
3. 가입한 계정으로 로그인하면 메인으로 이동하고 헤더에 이름과 로그아웃이 표시됩니다. 새로고침해도 로그인 상태가 복원되는지 확인합니다. 로그인 상태 유지를 선택하면 브라우저에 Refresh 쿠키를 최대 14일간 보관하고, 선택을 해제하면 브라우저 세션 쿠키를 사용합니다.
4. 헤더에서 로그아웃을 누르고 확인 화면의 로그아웃 버튼을 누릅니다. 메인으로 이동하고 헤더에 로그인 링크가 표시되는지 확인합니다.

정적 호스팅에서 하위 경로를 추가한다면 SPA fallback을 `index.html`로 설정해야 합니다.

## 이미지 출처 및 저작권

숙소 카드 사진(`public/images/stays/` 폴더의 36장)은 **핀터레스트(Pinterest, https://www.pinterest.com)** 에서 내려받은 이미지입니다.

- 이 사진들의 저작권은 각 원작자(사진 작가, 숙소, 원 게시자)에게 있습니다.
- 이 프로젝트는 학원 교육용 팀 프로젝트이며, 사진은 화면 구성을 확인하기 위한 예시로만 사용합니다. 상업적으로 사용하지 않습니다.
- 저작권자가 삭제를 요청하면 해당 사진을 바로 삭제하거나 교체합니다.
- 실제 서비스로 운영할 때는 숙소(호스트)가 직접 등록한 사진이나 사용 허락을 받은 사진으로 교체해야 합니다.

| 폴더                                         | 내용                        | 출처         |
| -------------------------------------------- | --------------------------- | ------------ |
| `public/images/stays/motel-1~6.jpg`          | 모텔 숙소 사진              | Pinterest    |
| `public/images/stays/hotel-1~6.jpg`          | 호텔 숙소 사진              | Pinterest    |
| `public/images/stays/private-house-1~6.jpg`  | 독채 숙소 사진              | Pinterest    |
| `public/images/stays/pool-villa-1~6.jpg`     | 풀빌라 숙소 사진            | Pinterest    |
| `public/images/stays/emotional-stay-1~6.jpg` | 감성스테이 숙소 사진        | Pinterest    |
| `public/images/stays/guesthouse-1~6.jpg`     | 게스트하우스 숙소 사진      | Pinterest    |
| `public/images/image-upload-placeholder.png` | "이미지 업로드" 안내 이미지 | 팀 자체 제작 |
