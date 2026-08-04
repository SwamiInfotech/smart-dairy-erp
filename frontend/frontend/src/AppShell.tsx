import { AuthGateway } from './components/AuthGateway'
import { ToastStack } from './components/ToastStack'
import { WorkspaceFrame } from './components/WorkspaceFrame'
import { WorkspacePanelGrid } from './components/WorkspacePanelGrid'
import { useAppShellController } from './hooks/useAppShellController'
import './App.css'

function AppShell() {
  const {
    token,
    toasts,
    onDismissToast,
    publicAuthProps,
    workspaceFrameProps,
    workspacePanelGridProps,
  } = useAppShellController()

  return (
    <div className="app-shell">
      {!token ? (
        <AuthGateway {...publicAuthProps} />
      ) : (
        <WorkspaceFrame {...workspaceFrameProps}>
          <WorkspacePanelGrid {...workspacePanelGridProps} />
        </WorkspaceFrame>
      )}

      <ToastStack toasts={toasts} onDismissToast={onDismissToast} />
    </div>
  )
}

export default AppShell
