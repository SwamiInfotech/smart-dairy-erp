import type { AppShellContractsArgs } from './appShellContracts'
import { useWorkspacePanelGridCatalogProps } from './useWorkspacePanelGridCatalogProps'
import { useWorkspacePanelGridFarmerTenantProps } from './useWorkspacePanelGridFarmerTenantProps'
import { useWorkspacePanelGridMastersProps } from './useWorkspacePanelGridMastersProps'
import { useWorkspacePanelGridRatesSalesProps } from './useWorkspacePanelGridRatesSalesProps'

export type WorkspacePanelGridProps =
  ReturnType<typeof useWorkspacePanelGridCatalogProps> &
  ReturnType<typeof useWorkspacePanelGridMastersProps> &
  ReturnType<typeof useWorkspacePanelGridRatesSalesProps> &
  ReturnType<typeof useWorkspacePanelGridFarmerTenantProps>

export function useWorkspacePanelGridProps(
  args: AppShellContractsArgs,
): WorkspacePanelGridProps {
  const catalogProps = useWorkspacePanelGridCatalogProps(args)
  const mastersProps = useWorkspacePanelGridMastersProps(args)
  const ratesSalesProps = useWorkspacePanelGridRatesSalesProps(args)
  const farmerTenantProps = useWorkspacePanelGridFarmerTenantProps(args)

  return {
    ...catalogProps,
    ...mastersProps,
    ...ratesSalesProps,
    ...farmerTenantProps,
  }
}
