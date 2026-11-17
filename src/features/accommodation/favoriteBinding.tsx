import { createContext, useContext } from 'react'
import type { FavoriteBinding } from '@/features/accommodation/types'

const noop: FavoriteBinding = { isFavorite: () => false, toggle: () => {} }

/**
 * 찜 상태와 토글 핸들러의 통로. accommodation은 favorite을 import하지 않으므로
 * favorite feature가 이 Provider에 값을 넣어 준다.
 */
export const FavoriteBindingContext = createContext<FavoriteBinding>(noop)

export function useFavoriteBinding() {
  return useContext(FavoriteBindingContext)
}
