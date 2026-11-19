# REVIEW-001 정식 로그인 연결 시험 — 최신 결과

## 기준
- 팀 백엔드 origin/feature/login-logout-syj a65c6a8.
- 팀 프론트 origin/feature/login-logout-syj 350b417.
- 개인 team-integration의 기존 객실·음악 리뷰·등록 기능을 별도 작업본에 결합.
- 로컬 브랜치: 양쪽 test/review-login_Moon. 원격 develop·다른 팀 브랜치 변경 없음. 사용자 요청에 따라 이 test/ 브랜치에 업로드. develop 머지 없음.

## 내 담당 코드 수정
- ReviewUserResolver가 팀 JWT 필터의 AuthenticatedUser를 신뢰 주체로 인식.
- 리뷰 작성 가능 예약 조회에 공통 http의 auth:true 적용.
- 리뷰 POST는 직접 fetch 대신 팀 공통 http.post(auth:true) 사용. 토큰 첨부·만료 재발급 처리를 팀 모듈에 위임.
- 로그인 상태 복원 후 본인 예약 조회. 회원 ID별 캐시 구분, 비로그인 시 로그인 링크 및 저장 차단.
- 기존 CSRF 조회 API는 호환 유지. JWT 요청은 팀 SecurityConfig 규칙에 따라 처리하며 보안을 임의 해제하지 않음.
- 팀 로그인 구현 자체는 수정하지 않음. 로그인 후 팀 화면은 홈으로 이동하므로 리뷰 페이지에 다시 진입한다.

## 검증
- 프론트 빌드 통과.
- 실제 팀 LoginController→비밀번호 확인→JWT 발급→Redis 세션→JWT 필터→리뷰 API 통합 시험 통과.
- 본인 이용 완료 예약 조회, 별점·곡 저장, 익명 공개 목록 반영 확인.
- 중복 등록 409, 타인 예약 404, 무토큰·위조 토큰 401, 잘못된 비밀번호 401, 로그아웃 후 토큰 401 확인.
- 시험 가상 계정·예약·리뷰는 트랜잭션 롤백. 시험 회원 ID의 Redis 세션 키만 정리. 실제 계정·기존 예약 변경 없음.
- 임시 인증 app.temp-auth.enabled=false. 테스트 인증주체 삽입·mock JWT·mock Redis를 사용하지 않음.
- 화면에서 비로그인 저장 차단 및 팀 로그인 페이지 이동 확인.
- 실제 사용자 계정으로 브라우저에서 로그인→리뷰 제출을 클릭하는 전체 시나리오는 별도 확인 필요. 실제 비밀번호를 요청하거나 읽지 않음.

## 실행
- 프론트 http://127.0.0.1:5178/accommodations/32/reviews/new
- 백엔드 127.0.0.1:8085, 프로젝트 전용 Redis 127.0.0.1:6381(영구 저장 안함).
- 기존 승인 검증 DB preen_team_moon_develop_20261118 사용. 스키마 신규 변경 없음.
- 검증용 JWT 키·개인 설정·node_modules·Redis 런타임은 업로드 대상 아님.

## 남은 항목
- 실제 사용자 계정 및 본인 이용 완료 예약을 이용한 브라우저 최종 확인.
- Spotify 검색 REVIEW-002는 미구현. 곡 링크/트랙 ID 입력 방식 유지.
- 팀 로그인 브랜치의 develop 반영과 최종 배포 설정은 담당자 결정.
- feature로 올릴 때는 본인 리뷰 연결 변경만 선별. 이 전체 팀 시험 조합을 feature로 업로드하지 않음.

## REVIEW-002 음악 검색 연결 보완
- 기능별 music-search 구현을 이 시험본에 연결. 기존 로그인·리뷰 시험 코드를 재커밋하지 않고 변경분만 추가.
- 로그인 필수 검색 API, 키 미설정503, 빈 검색어400 추가 확인.
- 곡 선택 시 REVIEW-001의 선택값으로 ID전달, 기존 링크입력 유지.
- 실제 Spotify 키·검색 성공 검증 및 재생 길이 표시는 미완료.
- 이번 업데이트도 test/ 브랜치이며 develop 머지용 기능 단독 변경과 구분.
