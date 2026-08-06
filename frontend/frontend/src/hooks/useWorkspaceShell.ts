import { useCallback, useEffect, useState } from 'react'

const MOBILE_SIDEBAR_BREAKPOINT = 980
const RELOAD_TO_COLLECTION_FLAG = 'smart_dairy_reload_to_collection'

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
  const shouldOpenMilkCollectionsOnReload =
    typeof window !== 'undefined'
      ? window.sessionStorage.getItem(RELOAD_TO_COLLECTION_FLAG) === '1'
      : false

  const resolvedInitialTab = shouldOpenMilkCollectionsOnReload
    ? milkCollectionsTab
    : initialTab

  const [activeTab, setActiveTab] = useState<TTab>(resolvedInitialTab)
  const [activeSidebarMenu, setActiveSidebarMenu] = useState<string>(resolvedInitialTab)
  const [mobileViewport, setMobileViewport] = useState<boolean>(isMobileViewport)
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const isSidebarCollapsed = mobileViewport ? false : desktopSidebarCollapsed

  useEffect(() => {
    if (typeof window !== 'undefined' && shouldOpenMilkCollectionsOnReload) {
      window.sessionStorage.removeItem(RELOAD_TO_COLLECTION_FLAG)
    }

    const syncViewport = () => {
      setMobileViewport(isMobileViewport())
    }

    syncViewport()
    window.addEventListener('resize', syncViewport)

    return () => {
      window.removeEventListener('resize', syncViewport)
    }
  }, [shouldOpenMilkCollectionsOnReload])

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
