import type { AppShellOperations } from './useAppShellOperations'
import type { AppShellState } from './useAppShellState'
import type { PublicAuthProps } from './usePublicAuthProps'
import type { WorkspaceFrameProps } from './useWorkspaceFrameProps'
import type { WorkspacePanelGridProps } from './useWorkspacePanelGridProps'

export type AppShellViewProps = {
  publicAuthProps: PublicAuthProps
  workspaceFrameProps: WorkspaceFrameProps
  workspacePanelGridProps: WorkspacePanelGridProps
}

type AppShellSession = AppShellState['session']

export type AppShellController = AppShellViewProps & {
  token: AppShellSession['token']
  toasts: AppShellSession['toasts']
  onDismissToast: AppShellSession['onDismissToast']
}

export type AppShellContractsArgs = {
  state: AppShellState
  ops: AppShellOperations
}
