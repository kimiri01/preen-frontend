# REVIEW-002 음악 검색 — 최신 구현

## 상태
- 검색 화면·서버 API·리뷰 선택 연결 구현. 키 없이 가능한 자동 검증 완료.
- 실제 Spotify Client ID/Secret 미발급 상태이므로 실서비스 검색 결과 수신·계정별 접근 가능 여부는 아직 미검증. 전체 완료로 표시하지 않음.
- 실제 키가 없을 때 가짜 검색 결과나 다른 공급자의 곡을 Spotify 결과로 표시하지 않음.
- 커밋·푸시 전.

## 팀 기반 확인
- 원격 develop 백엔드24545a4 및 확인 가능한 원격 브랜치에서 /api/spotify/tracks/search 구현은 찾지 못함. 노션에는 백엔드 구현으로 표시되어 있으므로 별도 기존 구현이 있다면 담당자와 계약 확인 필요.
- 프론트는 팀 로그인 origin/feature/login-logout-syj 350b417의 공통 http/auth 모듈을 사용. 백엔드 기능본은 develop 기준이며 공통 보안에서 로그인 필수 처리.
- 신규 기능 브랜치: 양쪽 feature/music-search_Moon. 기능본은 검색 API·재사용 검색 컴포넌트·독립 /music/search 화면만 추가.
- 기존 리뷰 작성 연결 시험: team-tests/review-login의 test/review-login_Moon에 이번 로컬 변경을 추가. 이전에 올린 커밋 이후 이번 변경은 미업로드.

## API 및 동작
- GET /api/spotify/tracks/search?q= (로그인 필요). 1~100자 검색어, 최대10곡, market KR, type track.
- ApiResponse.data 배열: id, name, artists[], albumName, imageUrl, spotifyUrl.
- 고정된 Spotify accounts 토큰 서버 및 api 검색 서버만 호출. 사용자 입력을 외부 주소로 사용하지 않음.
- Client Credentials로 서버 토큰 발급. 서버 메모리에 만료 전까지 보관하고 만료·401 시 갱신. 401 재시도1회, 무한 재시도 없음.
- 키 미설정503 SPOTIFY_NOT_CONFIGURED, 요청제한429, 공급자·연결오류503. 외부 응답 본문·토큰·비밀키는 프론트 오류에 전달하지 않음.
- 검색어 입력 변경 시 진행 요청 취소 및 이전 응답 무시. 버튼/Enter로 검색하고 결과 한 곡 선택.
- 선택한 Spotify 트랙 ID를 REVIEW-001 상태로 전달하여 공식 Embed에서 미리 확인. 기존 링크·ID 입력도 유지.
- 제목·아티스트·앨범·이미지는 표시용이며 DB에 검색 결과를 새로 저장하지 않음.

## 검증
- 백엔드 대역 Spotify 응답 테스트: 토큰 캐시·검색어 인코딩·중복 제거·최대10곡·빈결과·401 재발급·429·오류 비노출·이미지주소 검증·키미설정.
- 프론트3개 테스트: Bearer와 취소 신호·검색어 인코딩, 만료 토큰 공통 재발급, 설정없음/429 오류 구분. 기능본·리뷰 시험본 빌드 통과.
- 팀 정식 JWT/Redis 로그인 통합 시험: 비로그인401, 로그인 후 키미설정503, 빈검색어400. 가상 계정·예약은 롤백.
- 브라우저의 리뷰 작성 화면에서 검색 영역 및 비로그인 비활성 확인. 실제 검색 성공 UI와 등록까지의 브라우저 검증은 키 설정 후 별도.

## 설정 (실제 값은 채팅·GitHub에 올리지 않음)
- 백엔드 실행 환경변수 SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET만 설정. VITE_ 변수에 Secret을 넣지 않음.
- 또는 Git에서 제외된 별도 로컬 Spring 설정의 app.spotify.client-id, app.spotify.client-secret. Spring이 읽도록 실행 설정에 경로를 지정해야 함. .env 파일을 만들기만 하면 자동으로 읽는다고 가정하지 않음.
- 이 작업은 실제 키를 생성·조회·저장하지 않았음.
- 키 설정 후 서버 재시작, 로그인, 제목/가수 검색→한 곡 선택→미리보기→이용 완료 예약 리뷰 등록 확인.

## 실행 화면
- 별도 시험본 http://127.0.0.1:5178/accommodations/32/reviews/new
- 검색 단독 http://127.0.0.1:5178/music/search
- 백엔드8085, Redis6381, 기존 승인 검증 DB 사용. 검색 기능용 DB 변경 없음.

## 공식 참고
- https://developer.spotify.com/documentation/web-api/reference/search
- https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow

다음 순서: 화면 확인 → 팀 노션 작업 페이지 갱신 → 기존 REVIEW-002 명세서 갱신 → 별도 업로드 지시 시 커밋·푸시. 실검색 키 설정·검증 및 재생 길이 응답·표시는 남은 상태로 기록.

## 이번 업로드 범위
- 기능 구현: 양쪽 feature/music-search_Moon.
- 로그인·리뷰 조합: 기존 test/review-login_Moon에 이번 연결 변경 추가.
- 실제 Spotify 키 설정 및 실검색 성공 검증은 미완료.
- 팀 명세의 재생 길이 응답·표시는 미구현.
- 비밀정보·node_modules·개인 설정·실행 도구 제외. develop 머지·PR 생성 없음.
