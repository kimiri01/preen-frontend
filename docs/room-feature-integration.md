# STAY-004 / Must12·13 — 최신 개인 기능 구현

현재 기능 브랜치 feature/stay-detail-policy_Moon. 팀 develop 기반으로 누적 담당 기능을 포함합니다.
메인/검색/최근본 숙소 -> 실제 숙소ID 상세로 연결하며 선택 날짜·인원을 URL로 유지합니다.

GET /api/accommodations/{id}/rooms는 숙소·객실 이미지/스펙/오디오 외에 다음을 추가 제공합니다.
- latitude/longitude: DB 값이 있을 때만 표시. 없으면 좌표를 만들지 않음.
- amenities: accommodation_amenities를 통해 숙소 전체 편의시설 조회. 객실별 facilities와 구분.
- refundPolicy: 활성 정책 id/version/policyText/rules(daysBefore/refundRate), 없으면null.
환불 규칙은 체크인 N일 전까지의 비율로 표시하며 실제 예약 확정정책과 구분합니다.
빈 값은 안내로 처리. 새 DB 스키마나 예시 데이터 추가 없이 기존 DB 조회로 구현.

남은 부분: 팀 상세 API를 기준으로 한 최종 화면 조합/정식 로그인/음악 검색/날짜별 재고·총액/예약·결제.
별도 통합시험은 test/connected-20261119_Moon에서 하며 기능 브랜치나 팀 develop에 시험용 공통 코드를 섞지 않습니다.
보완 작업은 로컬 저장 상태이며 사용자 지시 전 커밋·푸시하지 않습니다.
