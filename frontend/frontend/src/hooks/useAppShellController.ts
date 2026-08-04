import { useAppShellOperations } from './useAppShellOperations'
import { useAppShellState } from './useAppShellState'
import type { AppShellController } from './appShellContracts'
import { useAppShellViewProps } from './useAppShellViewProps'

export function useAppShellController(): AppShellController {
  const state = useAppShellState()
  const operations = useAppShellOperations(state)
  const viewProps = useAppShellViewProps(state, operations)

  return {
    token: state.session.token,
    toasts: state.session.toasts,
    onDismissToast: state.session.onDismissToast,
    ...viewProps,
  }
}
