import { MusicBanner } from '@/features/mainPage/components/MusicBanner'
import { SearchSection } from '@/features/mainPage/components/SearchSection'
import { RegionSection } from '@/features/mainPage/components/RegionSection'
import { CurationSection } from '@/features/mainPage/components/CurationSection'
import { SupportSection } from '@/features/mainPage/components/SupportSection'
import { AccommodationSection } from '@/features/accommodation/public'
import '@/features/mainPage/mainPage.css'

export function MainPage() {
  return (
    <>
      <MusicBanner />
      <main>
        <SearchSection />
        <AccommodationSection />
        <RegionSection />
        <CurationSection />
        <SupportSection />
      </main>
    </>
  )
}
