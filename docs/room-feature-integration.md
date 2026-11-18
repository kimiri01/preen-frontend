# Must12·13 연결 (Moon)

기준 origin/test/accmmo-serch-test (33762c9), 작업 feature/room-list-integration_Moon.
기존 Moon 브랜치 및 팀 공유 브랜치는 변경하지 않습니다.

- 팀 Layout/Header/카테고리/검색 화면을 유지하고 src/features/rooms의 상세 화면을 연결합니다.
- 메인 숙소 카드, 검색 결과, 최근 본 숙소에서 /accommodations/{실제ID}로 이동합니다.
- checkIn, checkOut, guestCount를 상세 화면에 전달하고 새로고침·음악 탭 전환에도 유지합니다.
- /accommodations/{id}/rooms도 호환 경로로 유지하며 ?tab=music이 Must13입니다.
- /api/accommodations/{id}/rooms와 /music-reviews 응답은 팀 ApiResponse.data를 사용합니다.
- rooms.css는 .stay-detail 아래로 제한해 팀 공통 화면에 스타일이 새지 않게 했습니다.
- Spotify 제목은 백엔드 공식 oEmbed 조회, 재생은 공식 iframe을 사용합니다. 한 번에 한 플레이어만 엽니다.
- 실제 데이터가 없는 스펙은 안내 상태로 표시합니다. 숙소마다 페이지 파일을 복제하지 않고 ID로 DB 데이터를 구분합니다.

npm run dev 실행 시 /api는 기본8080으로 전달합니다. 격리 검증 시 PREEN_BACKEND_URL로 서버 주소를 바꿀 수 있습니다. npm run build로 확인합니다.

실시간 재고·총액·예약/결제·리뷰 작성은 담당 기능과 추가 연결이 필요합니다. 공식 Spotify 플레이어 로딩과 제목 조회를 확인했으며, 모든 계정의 전체 곡 재생을 보장하지 않습니다. 팀 리뷰 후 develop에 병합하세요.
