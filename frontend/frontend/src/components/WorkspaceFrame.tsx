import { useEffect, useState, type RefObject, type ReactNode } from 'react'
import { WorkspaceSidebar } from './WorkspaceSidebar'

type ThemeMode = 'day' | 'dark'

type SidebarGroup = {
  title: string
  items: readonly string[]
}

type WorkspaceFrameProps = {
  isSidebarCollapsed: boolean
  activeSidebarMenu: string
  sidebarGroups: readonly SidebarGroup[]
  tabLabels: Record<string, string>
  iconMap: Record<string, string>
  toggleSidebarCollapse: () => void
  onSelectSidebarMenu: (key: string, isUiTab: boolean) => void
  onLogout: () => void
  currentShopName: string
  branchName: string
  currentRole: string
  bodyScrollRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}

export function WorkspaceFrame({
  isSidebarCollapsed,
  activeSidebarMenu,
  sidebarGroups,
  tabLabels,
  iconMap,
  toggleSidebarCollapse,
  onSelectSidebarMenu,
  onLogout,
  currentShopName,
  branchName,
  currentRole,
  bodyScrollRef,
  children,
}: WorkspaceFrameProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'day'
    }

    const savedTheme = window.localStorage.getItem('smart-dairy-theme')
    return savedTheme === 'dark' ? 'dark' : 'day'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode)
    window.localStorage.setItem('smart-dairy-theme', themeMode)
  }, [themeMode])

  const toggleThemeMode = () => {
    setThemeMode((currentTheme) => (currentTheme === 'day' ? 'dark' : 'day'))
  }

  return (
    <div className="workspace-frame">
      <header className="topbar">
        <div>
          <p className="eyebrow">Smart Dairy ERP</p>
          <p className="topbar-breadcrumb">Dashboard / Operations / Agent Workspace</p>
        </div>
        <div className="user-box">
          <div className="header-context" aria-label="Current context">
            <p className="current-shop-badge">Shop: {currentShopName || 'Mapped Shop'}</p>
            <p className="current-shop-badge">Branch: {branchName || 'Current Branch'}</p>
          </div>

          <div className="header-user-card" aria-label="User details">
            <span className="header-user-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                <circle cx="12" cy="8" r="3.6" />
                <path d="M4.5 19c0-3.6 3.3-5.8 7.5-5.8s7.5 2.2 7.5 5.8" />
              </svg>
            </span>
            <span className="header-user-meta">{currentRole || 'User'}</span>
          </div>

          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleThemeMode}
            aria-label={themeMode === 'day' ? 'Switch to dark mode' : 'Switch to day mode'}
          >
            {themeMode === 'day' ? 'Dark' : 'Day'}
          </button>

          <button type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="app-body-scroll" ref={bodyScrollRef}>
        <div className={isSidebarCollapsed ? 'workspace-shell sidebar-collapsed' : 'workspace-shell'}>
          <WorkspaceSidebar
            isSidebarCollapsed={isSidebarCollapsed}
            activeSidebarMenu={activeSidebarMenu}
            sidebarGroups={sidebarGroups}
            tabLabels={tabLabels}
            iconMap={iconMap}
            toggleSidebarCollapse={toggleSidebarCollapse}
            onSelectSidebarMenu={onSelectSidebarMenu}
          />

          {children}
        </div>
      </div>

      <footer className="footer-note footer-copy">
        Copyright {new Date().getFullYear()} SmartDairy ERP. All rights reserved.
      </footer>
    </div>
  )
}
