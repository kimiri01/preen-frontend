import type { SyntheticEvent } from 'react'

/** 숙소 사진이 없거나 깨졌을 때 보여 줄 안내 이미지 */
export const PLACEHOLDER_IMAGE = '/images/image-upload-placeholder.png'

/** 사진 주소가 비어 있으면 안내 이미지 주소를 돌려줍니다. */
export function getImageSrc(image: string | null | undefined): string {
  return image ? image : PLACEHOLDER_IMAGE
}

/** 사진을 불러오지 못하면 안내 이미지로 바꿉니다. */
export function handleImageError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget
  if (!image.src.endsWith(PLACEHOLDER_IMAGE)) image.src = PLACEHOLDER_IMAGE
}
