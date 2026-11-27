

/** 백엔드 공통 응답 ApiResponse<T> */
export interface ApiResponse<T>{
    success: boolean
    /** 성공이면 "OK", 실패면 ErrorCode 이름 */
    code: string
    message: string
    data: T
}

/** http 메서드가 받는 옵션 (fetch 옵션 + 직접 정한 옵션) */
export interface HttpRequestOptions extends Omit<RequestInit, 'body'>{
    /** 객체를 그대로 넘기면 http가 JSON.stringify해서 보냄. FormData는 그대로 전송 */
    body?:unknown
    /** 로그인 필요한 요청: Bearer 토큰을 붙이고, 만료(401)면 refresh 후 한 번 재시도. sameOrigin 포함 */
    auth?: boolean
    /** VITE_API_BASE_URL 없이 /api로 보내 Vite 프록시를 탄다 (refresh 쿠키를 쓰는 login, refresh) */
    sameOrigin?: boolean
}