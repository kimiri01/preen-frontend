
import { http } from '@/common/api/http'
import type { ApiResponse } from '@/common/types/api'

export type MyInfo = {
  name: string
  email: string
  birthDate: string
}

export type MyInfoUpdateRequest = {
  name: string
  birthDate: string
}

export function getMyInfo(): Promise<ApiResponse<MyInfo>> {
  return http.get<ApiResponse<MyInfo>>('/api/my/info')
}

export function updateMyInfo(
  request: MyInfoUpdateRequest,
): Promise<ApiResponse<MyInfo>> {
  return http.put<ApiResponse<MyInfo>>('/api/my/info', request)
}
