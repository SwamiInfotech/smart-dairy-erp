import { useCallback, useEffect, useState } from 'react'

const MOBILE_SIDEBAR_BREAKPOINT = 980

const isMobileViewport = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= MOBILE_SIDEBAR_BREAKPOINT
}

type UseWorkspaceShellParams<TTab extends string> = {
  initialTab: TTab
  milkCollectionsTab: TTab
}

export function useWorkspaceShell<TTab extends string>({
  initialTab,
  milkCollectionsTab,
}: UseWorkspaceShellParams<TTab>) {
  const [activeTab, setActiveTab] = useState<TTab>(initialTab)
  const [activeSidebarMenu, setActiveSidebarMenu] = useState<string>(initialTab)
  const [mobileViewport, setMobileViewport] = useState<boolean>(isMobileViewport)
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const isSidebarCollapsed = mobileViewport ? false : desktopSidebarCollapsed

  useEffect(() => {
    const syncViewport = () => {
      setMobileViewport(isMobileViewport())
    }

    syncViewport()
    window.addEventListener('resize', syncViewport)

    return () => {
      window.removeEventListener('resize', syncViewport)
    }
  }, [])

  useEffect(() => {
    if (!mobileViewport) {
      setIsMobileSidebarOpen(false)
    }
  }, [mobileViewport])

  const openPrimarySection = useCallback((section: TTab) => {
    setActiveTab(section)
    setActiveSidebarMenu(section)
  }, [])

  const switchToMilkCollections = useCallback(() => {
    openPrimarySection(milkCollectionsTab)
  }, [milkCollectionsTab, openPrimarySection])

  const toggleSidebarCollapse = useCallback(() => {
    if (mobileViewport) {
      setIsMobileSidebarOpen((prev) => !prev)
      return
    }

    setDesktopSidebarCollapsed((prev) => !prev)
  }, [mobileViewport])

  const onSelectSidebarMenu = useCallback((key: string, isUiTab: boolean) => {
    setActiveSidebarMenu(key)
    if (mobileViewport) {
      setIsMobileSidebarOpen(false)
    }
    if (isUiTab) {
      setActiveTab(key as TTab)
    }
  }, [mobileViewport])

  return {
    activeTab,
    activeSidebarMenu,
    mobileViewport,
    isSidebarCollapsed,
    isMobileSidebarOpen,
    openPrimarySection,
    switchToMilkCollections,
    toggleSidebarCollapse,
    onSelectSidebarMenu,
  }
}
