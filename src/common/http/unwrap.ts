import {ApiError, CLIENT_ERROR_CODE } from './ApiError'
import type { ApiResponse } from './types'


function isApiResponse(body: unknown): body is ApiResponse<unknown>{
    return (
        typeof body === 'object' &&
        body !== null &&
        'success' in body &&
        typeof body.success === 'boolean' &&
        'code' in body &&
        typeof body.code === 'string'
    )
}

/**
 * fetch응답을 읽어 성공이면 data만, 실패면 ApiError를 던진다.
 */
export async function unwrap<T>(res: Response): Promise<T> {
    //204 No Content: 본문을 읽지 않는다
    if(res.status === 204) return undefined as T

    const text = await res.text()

    //본문이 비어 있음. 텍스트로 먼저 읽으면 빈 본문, JSON, HTML을 한 곳에서 구분할 수 있다. 
    if(!text) {
        if(res.ok) return undefined as T
        throw new ApiError(
            res.status,
            CLIENT_ERROR_CODE.UNKNOWN,
            '요청을 처리하지 못했습니다.',
        )
    }

    //JSON이 아니면 (nginx 502 HTML등) 해석 불가
    const isJson = res.headers.get('content-type')?.includes('application/json')
    let body: unknown
    if (isJson) {
        try {
            body = JSON.parse(text)
        } catch {
            body = undefined
        }
    }

    //JSON이지만 백엔드 응답 형식과 다른 경우
    if(!isApiResponse(body)){
        throw new ApiError(
            res.status,
            CLIENT_ERROR_CODE.INVALID_RESPONSE,
            '서버 응답을 해석할 수 없습니다.',
        )
    }

    //4xx, 5xx, 또는 200인데 success:false
    if(!res.ok || !body.success){
        throw new ApiError(
            res.status,
            body.code || CLIENT_ERROR_CODE.UNKNOWN,
            body.message || '요청을 처리하지 못했습니다.',
            body.data ?? undefined,
        )
    }

    return body.data as T


}