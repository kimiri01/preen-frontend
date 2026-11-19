import { Outlet } from 'react-router-dom'
import { Header } from '@/common/components/Header'
import type { HeaderMenuPanels } from '@/common/components/Header'
import { Footer } from '@/common/components/Footer'

interface LayoutProps {
  /** 헤더 메뉴를 눌렀을 때 펼쳐질 내용. App에서 각 Feature의 화면을 넣어 줍니다. */
  headerMenuPanels?: HeaderMenuPanels
}

export function Layout({ headerMenuPanels }: LayoutProps) {
  return (
    <div className="page">
      <Header menuPanels={headerMenuPanels} />
      <Outlet />
      <Footer />
    </div>
  )
}
