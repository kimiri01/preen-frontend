# REVIEW-003 음악 리뷰·별점·트랙 모음 — 최신 구현

작업 브랜치 feature/review-track-list_Moon. Must13 화면에서 공개·완료 예약 리뷰를 조회합니다.

- GET /api/accommodations/{id}/reviews?rating=&sort=&page=&size= : 공통 PageResponse(content/page/size/totalElements/totalPages/hasNext).
- 기본20개/최대50개. UI는10/20/50개 선택. rating/reviewSort/reviewPage/reviewSize를 URL에 유지.
- 별점/정렬/크기 변경 시 첫 페이지로 이동. 전체 건수와 필터 건수 구분, 빈 결과/조회 실패 안내.
- GET /api/accommodations/{id}/tracks : 곡별 중복 제거, 최근 등록 순 최대50곡, reviewCount/latestCreatedAt 포함.
- 음악 모음은 별점 필터와 별개로 숙소 전체 공개 리뷰 기준. 한 번에 플레이어1개만 열기.
- 기존 /music-reviews API(10개, total/filteredTotal/reviews)는 이전 호출자용으로 유지.
- 곡 메타데이터는 공식oEmbed 일시 조회, 음악 재생은 Spotify 공식iframe. DB에 메타데이터 저장하지 않음.

검증: 페이지 기본/경계/잘못된size, 숨김·미완료 제외, 트랙 중복집계·최근정렬·50개 한도, 원래 필터 회귀 테스트 통과.
정식 로그인/검색은 관련 기능과 연결 대기. 팀 공통 PageResponse 파일은 수정하지 않았습니다.
