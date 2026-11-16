import type { RouteObject } from 'react-router-dom'
import { RoomListPage } from './pages/RoomListPage'
export const roomRoutes: RouteObject[] = [
  { path: 'accommodations/:accommodationId', Component: RoomListPage },
  { path: 'accommodations/:accommodationId/rooms', Component: RoomListPage },
]
