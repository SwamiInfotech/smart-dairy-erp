import type { AppShellState } from './useAppShellState'
import type { AppShellOperations } from './useAppShellOperations'
import type { AppShellContractsArgs, AppShellViewProps } from './appShellContracts'
import {
  usePublicAuthProps,
} from './usePublicAuthProps'
import {
  useWorkspaceFrameProps,
} from './useWorkspaceFrameProps'
import {
  useWorkspacePanelGridProps,
} from './useWorkspacePanelGridProps'

export function useAppShellViewProps(
  state: AppShellState,
  ops: AppShellOperations,
): AppShellViewProps {
  const args: AppShellContractsArgs = { state, ops }

  const publicAuthProps = usePublicAuthProps(args)
  const workspaceFrameProps = useWorkspaceFrameProps(args)
  const workspacePanelGridProps = useWorkspacePanelGridProps(args)

  return {
    publicAuthProps,
    workspaceFrameProps,
    workspacePanelGridProps,
  }
}
