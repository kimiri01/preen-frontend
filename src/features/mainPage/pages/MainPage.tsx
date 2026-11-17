import { MusicBanner } from '@/features/mainPage/components/MusicBanner'
import { SearchSection } from '@/features/mainPage/components/SearchSection'
import { RegionSection } from '@/features/mainPage/components/RegionSection'
import { CurationSection } from '@/features/mainPage/components/CurationSection'
import { SupportSection } from '@/features/mainPage/components/SupportSection'
import {
  AccommodationSection,
  useAccommodationFilter,
} from '@/features/accommodation/public'
import '@/features/mainPage/mainPage.css'

export function MainPage() {
  // 카테고리 바(SearchSection)와 숙소 목록(AccommodationSection)이 함께 쓰는 조회 조건.
  // 주소(URL)에 보관하므로 헤더의 "전체 카테고리" 메뉴에서 고른 값도 여기로 들어옵니다.
  const { filter, setFilter } = useAccommodationFilter()

  return (
    <>
      <MusicBanner />
      <main>
        <SearchSection filter={filter} onChangeFilter={setFilter} />
        <AccommodationSection filter={filter} />
        <RegionSection />
        <CurationSection />
        <SupportSection />
      </main>
    </>
  )
}
