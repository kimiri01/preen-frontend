import { useState } from 'react'
import { MusicBanner } from '@/features/mainPage/components/MusicBanner'
import { SearchSection } from '@/features/mainPage/components/SearchSection'
import { RegionSection } from '@/features/mainPage/components/RegionSection'
import { CurationSection } from '@/features/mainPage/components/CurationSection'
import { SupportSection } from '@/features/mainPage/components/SupportSection'
import { AccommodationSection } from '@/features/accommodation/public'
import type { AccommodationFilter } from '@/features/accommodation/public'
import '@/features/mainPage/mainPage.css'

export function MainPage() {
  // 카테고리 바(SearchSection)와 숙소 목록(AccommodationSection)이 함께 쓰는 조회 조건.
  // 처음에는 "전체 숙소"입니다.
  const [filter, setFilter] = useState<AccommodationFilter>({ type: 'all' })

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
