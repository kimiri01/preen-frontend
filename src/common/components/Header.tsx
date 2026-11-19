import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/**
 * 헤더 메뉴를 눌렀을 때 버튼 아래에 펼쳐질 내용입니다.
 * 내용은 각 Feature가 만들고 App에서 넣어 줍니다. (Common은 Feature를 import하지 않음)
 */
export interface HeaderMenuPanels {
  /** "전체 카테고리"를 눌렀을 때 */
  category?: ReactNode
  /** "최근 본 숙소"를 눌렀을 때 */
  recent?: ReactNode
}

type MenuKey = keyof HeaderMenuPanels

interface HeaderProps {
  menuPanels?: HeaderMenuPanels
  memberName: string | null
  restoring: boolean
}

const MENU_PANEL_ID = 'header-menu-panel'

export function Header({ menuPanels = {}, memberName, restoring, }: HeaderProps) {
  // 지금 펼쳐져 있는 메뉴. null이면 모두 닫힌 상태입니다.
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null)
  // 패널을 누른 버튼 바로 아래에 맞추기 위한 왼쪽 위치(px, nav 기준)
  const [panelLeft, setPanelLeft] = useState(0)
  const navRef = useRef<HTMLElement>(null)

  // 메뉴가 열려 있는 동안: 메뉴 바깥을 누르거나 Esc 키를 누르면 닫습니다.
  useEffect(() => {
    if (openMenu === null) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openMenu])

  // 같은 버튼을 다시 누르면 닫고, 다른 버튼을 누르면 그 메뉴로 바꿉니다.
  const toggleMenu = (menu: MenuKey, button: HTMLButtonElement) => {
    setPanelLeft(button.offsetLeft)
    setOpenMenu((current) => (current === menu ? null : menu))
  }

  const openPanel = openMenu === null ? null : menuPanels[openMenu]

  return (
    <header>
      {/* 로고를 누르면 첫 홈페이지(조건 없는 "/")로 이동합니다. 열린 메뉴도 닫습니다. */}
      <h1>
        <Link
          to="/"
          className="header-logo"
          aria-label="PREEN 홈으로"
          onClick={() => setOpenMenu(null)}
        >
          PREEN
        </Link>
      </h1>
      <nav aria-label="주 메뉴" ref={navRef}>
        <button
          type="button"
          aria-expanded={openMenu === 'category'}
          aria-controls={MENU_PANEL_ID}
          onClick={(event) => toggleMenu('category', event.currentTarget)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-layout-grid"
            aria-hidden="true"
          >
            <rect width="7" height="7" x="3" y="3" rx="1"></rect>
            <rect width="7" height="7" x="14" y="3" rx="1"></rect>
            <rect width="7" height="7" x="14" y="14" rx="1"></rect>
            <rect width="7" height="7" x="3" y="14" rx="1"></rect>
          </svg>
          전체 카테고리
        </button>
        <button
          type="button"
          aria-expanded={openMenu === 'recent'}
          aria-controls={MENU_PANEL_ID}
          onClick={(event) => toggleMenu('recent', event.currentTarget)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-history"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
            <path d="M12 7v5l4 2"></path>
          </svg>
          최근 본 숙소
        </button>
        <button type="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-heart"
            aria-hidden="true"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
          </svg>
          찜
        </button>
        <button type="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-shopping-cart"
            aria-hidden="true"
          >
            <circle cx="8" cy="21" r="1"></circle>
            <circle cx="19" cy="21" r="1"></circle>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
          </svg>
          장바구니
        </button>
        {memberName !== null ? (
          <>
            <span className="header-member">{memberName}님</span>
            <Link to="/logout">로그아웃</Link>
          </>
        ) : !restoring ? (
          <>
            <Link to="/login">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-log-in"
                aria-hidden="true"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" x2="3" y1="12" y2="12"></line>
              </svg>
              로그인
            </Link>
            <Link to="/signup">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-user-plus"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" x2="19" y1="8" y2="14"></line>
                <line x1="22" x2="16" y1="11" y2="11"></line>
              </svg>
              회원가입
            </Link>
          </>
        ) : null}
        {openPanel && (
          <div
            id={MENU_PANEL_ID}
            className="header-menu-panel"
            style={{ left: panelLeft }}
            // 패널 안의 링크를 누르면(예: 카테고리 선택) 메뉴를 닫습니다.
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('a')) setOpenMenu(null)
            }}
          >
            {openPanel}
          </div>
        )}
      </nav>
    </header>
  )
}
