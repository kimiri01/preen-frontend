
import { http } from '@/common/api/http'

// 백엔드 공통 응답 형식
interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
}

// 결제 상태
export type PaymentStatus = 'WAITING' | 'COMPLETED' | 'EXPIRED'

// 결제 정보
export interface TestPayment {
  paymentId: number
  bankName: string
  accountNumber: string
  amount: number
  status: PaymentStatus
  expiresAt: string
}

// 테스트 결제 생성
export async function createTestPayment(): Promise<TestPayment> {
  const response = await http.post<ApiResponse<TestPayment>>(
    '/api/payments/test',
  )

  return response.data
}

// 결제 상태 조회
export async function getTestPayment(
  paymentId: number,
): Promise<TestPayment> {
  const response = await http.get<ApiResponse<TestPayment>>(
    `/api/payments/${paymentId}`,
  )

  return response.data
}

// 테스트 결제 완료 처리
export async function completeTestPayment(
  paymentId: number,
): Promise<TestPayment> {
  const response = await http.post<ApiResponse<TestPayment>>(
    `/api/payments/${paymentId}/complete`,
  )

  return response.data
}
