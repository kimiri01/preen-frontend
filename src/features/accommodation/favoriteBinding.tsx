import { createContext, useContext } from 'react'
import type { FavoriteBinding } from '@/features/accommodation/types'

const noop: FavoriteBinding = { isFavorite: () => false, toggle: () => {} }

/** favorite feature가 찜 상태와 토글 핸들러를 넣어 주는 Context */
export const FavoriteBindingContext = createContext<FavoriteBinding>(noop)

export function useFavoriteBinding() {
  return useContext(FavoriteBindingContext)
}
