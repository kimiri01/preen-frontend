// 숙소 예약 관련 계산 함수 모음

// 총 숙박 요금을 계산한다.
// nights: 숙박일 수, pricePerNight: 1박 가격(원)
// discountRate: 할인율. 0~100 사이의 퍼센트 값으로 들어온다 (예: 10 → 10% 할인)
export function calcTotalPrice(nights, pricePerNight, discountRate) {
  // 할인 전 금액 = 숙박일 수 × 1박 가격
  const total = nights * pricePerNight;
  // 할인 전 금액에서 할인 금액을 빼서 최종 금액을 돌려준다
  return total - total * discountRate;
}
