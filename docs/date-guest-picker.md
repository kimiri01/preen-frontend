# STAY-005 날짜·인원 및 예약 가능 여부·요금 조회 — 최신 구현

## 기존 날짜 선택
- 한국 시간 오늘부터 체크인, 최소1박·최대30박. 실제 날짜와 URL 모두 검증.
- 체크인 변경으로 체크아웃이 유효하지 않으면 초기화.
- 날짜·박수·인원, 빠른 일정 선택·초기화, URL 유지.

## 이번 실제 조회 연결
- GET /api/accommodations/{id}/availability?checkIn=yyyy-MM-dd&checkOut=yyyy-MM-dd
- 인증 불필요. 기존 팀 rooms·room_inventories·accommodations 사용. 테이블·초기 데이터 변경 없음.
- 체크인 포함·체크아웃 제외 각 숙박일에 재고 행이 있어야 함.
- 잔여 수=total_count-booked_count-held_count. 모든 날짜가 판매 중이고 잔여가 1개 이상이어야 예약 가능.
- remainingRooms는 기간 중 최소 잔여 개수. 판매 마감/매진은0, 누락일이 있으면null.
- totalPrice는 날짜별 판매가(BigDecimal)의 합을 문자열로 반환. 불가 상태면null. 기본 1박 요금으로 대체하지 않음.
- 기준 인원 요금 합계이며 추가 인원 요금은 포함하지 않음. 최종 결제 금액 아님.
- 상태 AVAILABLE / MISSING_INVENTORY / CLOSED / SOLD_OUT을 화면에서 구분.
- 조회 중·실패 시 이전 기간 금액을 표시하지 않음. 날짜별 query key와 요청 취소를 사용하며 재조회 버튼·조회 시각 제공.
- 조회는 재고 선점이 아님. 예약 시 재검증 필요.

## 응답 구조
- accommodationId, checkIn, checkOut, nights, currency(KRW), checkedAt, rooms.
- rooms: roomId, roomName, capacity, maxCapacity, extraPersonFee, nights, available, reason, remainingRooms, totalPrice.
- 공개 LISTED 숙소·활성 ACTIVE 객실만. 비공개/없는 숙소404, 날짜 오류400.

## 검증
- 프론트 기존 날짜·Spotify 입력 테스트7개 및 빌드 통과.
- 백엔드 단위9개·기존 가입5개·신규 재고/요금 통합5개 통과.
- 소수점 날짜별 합계, 기간 중 최소잔여, held차감, 체크아웃 날짜 제외, 판매마감·누락·매진, 30/31박, 잘못된날짜·누락파라미터, 비공개·활성객실 조건 확인.
- DB 테스트 데이터 롤백, 조회는 데이터 수정 없음.
- 화면 기존 DB 숙소32: 2026-11-21~23 2박156000원 최소잔여1개 확인.
- 재고 기간 밖 2027-03-30~04-02: 판매정보미등록 및 기간총액 미표시 확인.

## 저장 및 범위
- 기능별 최종본: feature-work/stay-date-validation/preen-frontend 및 preen-backend. 양쪽 feature/stay-date-validation_Moon.
- 백엔드는 origin/develop24545a4 기준 신규 조회 코드만 포함. 프론트는 기존 날짜 선택 branch 이어서 수정.
- 로컬 화면시험: team-tests/stay-availability/preen-backend, test/stay-availability_Moon. 기존 개인 객실/리뷰 조회 코드와 이번 API 조합, 업로드 전.
- 화면 http://127.0.0.1:5179/accommodations/32?checkIn=2026-11-21&checkOut=2026-11-23&guestCount=2 (백엔드8086).
- 예약 생성 RESV-001 연결은 미포함. 예약 버튼 비활성 유지, 조회 가능 상태와 구분.
- 기존 날짜 검증 커밋은 이미 업로드돼 있으나 이번 실제 조회 변경은 사용자 요청에 따라 기능 브랜치에 커밋·푸시합니다. 팀 develop 머지 없음.
