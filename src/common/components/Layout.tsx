import { Outlet } from 'react-router-dom'
import { Header } from '@/common/components/Header'
import type { HeaderMenuPanels } from '@/common/components/Header'
import { Footer } from '@/common/components/Footer'

interface LayoutProps {
  headerMenuPanels?: HeaderMenuPanels
  memberName: string | null
  restoring: boolean
  notice?: string
}

export function Layout({
  headerMenuPanels,
  memberName,
  restoring,
  notice,
}: LayoutProps) {
  return (
    <div className="page">
      <Header
        menuPanels={headerMenuPanels}
        memberName={memberName}
        restoring={restoring}
      />
      {notice && (
        <p className="session-notice" role="status">
          {notice}
        </p>
      )}
      <Outlet />
      <Footer />
    </div>
  )
}