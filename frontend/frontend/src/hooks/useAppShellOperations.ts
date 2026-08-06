import type { AppShellState } from './useAppShellState'
import { useAppShellCommercialOperations } from './useAppShellCommercialOperations'
import { useAppShellCoreOperations } from './useAppShellCoreOperations'
import { useAppShellMasterFarmerOperations } from './useAppShellMasterFarmerOperations'

export type AppShellOperations =
  ReturnType<typeof useAppShellCoreOperations> &
  ReturnType<typeof useAppShellMasterFarmerOperations> &
  ReturnType<typeof useAppShellCommercialOperations>

export function useAppShellOperations(state: AppShellState): AppShellOperations {
  const coreOps = useAppShellCoreOperations(state)
  const masterFarmerOps = useAppShellMasterFarmerOperations(state)
  const commercialOps = useAppShellCommercialOperations(state)

  return {
    ...coreOps,
    ...masterFarmerOps,
    ...commercialOps,
  }
}
