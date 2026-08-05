import {
  SIDEBAR_GROUPS,
  SIDEBAR_ICON_MAP,
  TAB_LABELS,
} from '../lib/appShellConfig'
import type { AppShellContractsArgs } from './appShellContracts'

export function useWorkspaceFrameProps({ state, ops }: AppShellContractsArgs) {
  const { session } = state

  return {
    mobileViewport: ops.shell.mobileViewport,
    isSidebarCollapsed: ops.shell.isSidebarCollapsed,
    isMobileSidebarOpen: ops.shell.isMobileSidebarOpen,
    activeSidebarMenu: ops.shell.activeSidebarMenu,
    sidebarGroups: SIDEBAR_GROUPS,
    tabLabels: TAB_LABELS,
    iconMap: SIDEBAR_ICON_MAP,
    toggleSidebarCollapse: ops.shell.toggleSidebarCollapse,
    onSelectSidebarMenu: ops.shell.onSelectSidebarMenu,
    onLogout: ops.authFlow.onLogout,
    currentShopName: session.currentShop?.name || '',
    branchName: session.branchName,
    currentRole: session.currentShop?.role || 'User',
    bodyScrollRef: session.bodyScrollRef,
  }
}

export type WorkspaceFrameProps = ReturnType<typeof useWorkspaceFrameProps>
