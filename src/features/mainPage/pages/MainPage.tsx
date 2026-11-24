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
