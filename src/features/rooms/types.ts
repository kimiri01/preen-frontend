export interface RoomImage {
  id: string
  imageUrl: string
  sortOrder: number
}
export interface RoomBed {
  type: string
  count: number
}
export interface RoomFacility {
  code: string
  name: string
}
export interface RoomAudio {
  spotifyTrackId: string | null
  equipmentName: string
  connectionGuide: string
  availableFrom: string
  availableUntil: string
  volumeGuide: string
}
export interface Room {
  audio: RoomAudio | null
  roomType: string | null
  areaSqm: string | null
  beds: RoomBed[]
  facilities: RoomFacility[]
  id: string
  name: string
  capacity: number
  maxCapacity: number
  nightlyPrice: string
  extraPersonFee: string
  images: RoomImage[]
}
export interface RoomList {
  categoryCode: string
  categoryName: string
  regionCode: string
  regionName: string
  images: RoomImage[]
  accommodationId: string
  description: string | null
  address: string
  checkInTime: string
  checkOutTime: string
  accommodationName: string
  rooms: Room[]
}
