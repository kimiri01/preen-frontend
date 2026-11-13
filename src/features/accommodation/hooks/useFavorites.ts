import { useState } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(() => new Set())
  const toggleFavorite = (id: number) => {
    setFavorites((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  return { favorites, toggleFavorite }
}
