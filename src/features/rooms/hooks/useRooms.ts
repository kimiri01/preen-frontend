import { useQuery } from '@tanstack/react-query'
import { getRooms } from '../api/roomApi'
import { HttpError } from '@/common/api/http'
export function isValidStayId(value: string) {
  return (
    /^[1-9][0-9]{0,18}$/.test(value) && BigInt(value) <= 9223372036854775807n
  )
}
export function useRooms(accommodationId: string) {
  return useQuery({
    queryKey: ['rooms', accommodationId],
    queryFn: ({ signal }) => getRooms(accommodationId, signal),
    enabled: isValidStayId(accommodationId),
    retry: (count, error) =>
      !(error instanceof HttpError && error.status < 500) && count < 1,
  })
}
