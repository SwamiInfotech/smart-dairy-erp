import { useCallback, useState } from 'react'

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const openPrimarySection = useCallback((section: TTab) => {
    setActiveTab(section)
    setActiveSidebarMenu(section)
  }, [])

  const switchToMilkCollections = useCallback(() => {
    openPrimarySection(milkCollectionsTab)
  }, [milkCollectionsTab, openPrimarySection])

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev)
  }, [])

  const onSelectSidebarMenu = useCallback((key: string, isUiTab: boolean) => {
    setActiveSidebarMenu(key)
    if (isUiTab) {
      setActiveTab(key as TTab)
    }
  }, [])

  return {
    activeTab,
    activeSidebarMenu,
    isSidebarCollapsed,
    openPrimarySection,
    switchToMilkCollections,
    toggleSidebarCollapse,
    onSelectSidebarMenu,
  }
}
