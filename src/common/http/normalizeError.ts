
import { ApiError, CLIENT_ERROR_CODE } from './ApiError'





/**
 * fetch가 던진 에러(또는 알 수 없는 값)를 ApiError로 바꾼다.
 * 4xx, 5xx는 fetch가 에러를 던지지 않으므로 여기가 아니라 unwrap에서 처리한다.
 */
export function normalizeError(error: unknown): ApiError{
    // 이미 ApiError면 그대로 (unwrap에서 던진 것 등)
    if(error instanceof ApiError) return error

    // AbortSignal.timeout()으로 시간 초과
    if(error instanceof DOMException && error.name === 'TimeoutError'){
        return new ApiError(
            0,CLIENT_ERROR_CODE.TIMEOUT,'요청 시간이 초과되었습니다.',
        )
    }



    // AbortController.abort()로 취소 (페이지 이동, TanStack Query 취소 등)
    if(error instanceof DOMException && error.name === 'AbortError'){
        return new ApiError(0, CLIENT_ERROR_CODE.CANCELED, '요청이 취소되었습니다.')
        
    }


    // 서버에 닿지 못함 (서버 꺼짐, 인터넷 끊김, CORS 차단)
    if (error instanceof TypeError){
        return new ApiError(0, CLIENT_ERROR_CODE.NETWORK_ERROR, '네트워크 연결을 확인해 주세요.',)
    
    }

    // 그 밖의 예상 못 한 값
    return new ApiError(0, CLIENT_ERROR_CODE.UNKNOWN, 
        error instanceof Error? error.message : '알 수 없는 오류가 발생했습니다.',
    )






}