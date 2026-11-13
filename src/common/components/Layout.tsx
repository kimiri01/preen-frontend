import { Outlet } from 'react-router-dom'
import { Header } from '@/common/components/Header'
import { Footer } from '@/common/components/Footer'

export function Layout() {
  return (
    <div className="page">
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}
