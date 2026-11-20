import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router-dom'
import {
  DashboardIcon,
  AccommodationsIcon,
  RoomsIcon,
  RatesInventoryIcon,
  ReservationsIcon,
  SettlementIcon,
  InquiriesIcon,
  CouponsIcon,
} from '@/features/host/components/HostIcons'
import '@/features/host/host.css'

/** `/host/**` 전용 레이아웃 */
export function HostLayout() {
  return (
    <div className="host-shell">
      {/* 1. 상단 운영 워크스페이스 헤더 */}
      <header className="host-header">
        <div className="host-header-brand">
          <h1>
            <Link to="/">PREEN</Link>
          </h1>
          <span className="host-header-badge">HOST CENTER</span>
        </div>
        <div className="host-header-user">
          <span className="host-name">호스트 센터</span>
          <Link to="/" className="btn-logout">
            게스트 화면으로
          </Link>
        </div>
      </header>

      {/* 2. 본문 컨테이너 (좌측 내비게이션 + 우측 메인 콘텐츠) */}
      <div className="host-body">
        <aside className="host-side">
          <div className="host-nav-section-title">내 운영 공간</div>
          <nav aria-label="호스트 메뉴" className="host-nav">
            <NavLink to="/host/dashboard">
              <DashboardIcon />
              <span>대시보드</span>
            </NavLink>

            <NavLink to="/host/accommodations">
              <AccommodationsIcon />
              <span>내 숙소</span>
            </NavLink>

            <NavLink to="/host/rooms">
              <RoomsIcon />
              <span>객실</span>
            </NavLink>

            <NavLink to="/host/rates">
              <RatesInventoryIcon />
              <span>요금 및 재고</span>
            </NavLink>

            <NavLink to="/host/reservations">
              <ReservationsIcon />
              <span>예약 관리</span>
            </NavLink>

            <NavLink to="/host/settlement">
              <SettlementIcon />
              <span>정산</span>
            </NavLink>

            <NavLink to="/host/inquiries">
              <InquiriesIcon />
              <span>고객 문의</span>
            </NavLink>

            <NavLink to="/host/coupons">
              <CouponsIcon />
              <span>할인 쿠폰</span>
            </NavLink>
          </nav>

          {/* 하단 안내 문구 */}
          <div className="host-side-footer">
            <div className="host-scope-notice">본인 소유 숙소만 표시</div>
          </div>
        </aside>

        {/* 3. 우측 라우트별 콘텐츠 */}
        <main className="host-main">
          <Outlet />
        </main>
      </div>

      <ScrollRestoration />
    </div>
  )
}
