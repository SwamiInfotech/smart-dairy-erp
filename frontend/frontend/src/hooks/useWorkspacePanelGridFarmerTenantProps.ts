import type { AppShellContractsArgs } from './appShellContracts'

export function useWorkspacePanelGridFarmerTenantProps({
  state,
  ops,
}: AppShellContractsArgs) {
  const { entities, forms } = state

  return {
    farmerForm: ops.farmerCrud.farmerForm,
    setFarmerForm: ops.farmerCrud.setFarmerForm,
    editingFarmerUuid: ops.farmerCrud.editingFarmerUuid,
    farmerRateCharts: entities.farmerRateCharts,
    selectedFarmerRateChartUuid: ops.farmerCrud.selectedFarmerRateChartUuid,
    setSelectedFarmerRateChartUuid: ops.farmerCrud.setSelectedFarmerRateChartUuid,
    farmerMappedFieldError: ops.farmerCrud.farmerMappedFieldError,
    setFarmerMappedFieldError: ops.farmerCrud.setFarmerMappedFieldError,
    loadFarmers: ops.dataLoading.loadFarmers,
    onCreateFarmer: ops.farmerCrud.onCreateFarmer,
    onCancelFarmerEdit: ops.farmerCrud.onCancelFarmerEdit,
    onEditFarmer: ops.farmerCrud.onEditFarmer,
    onDeleteFarmer: ops.farmerCrud.onDeleteFarmer,
    tenants: entities.tenants,
    tenantForm: forms.tenantForm,
    setTenantForm: forms.setTenantForm,
    editingTenantUuid: forms.editingTenantUuid,
    loadTenants: ops.dataLoading.loadTenants,
    onSubmitTenant: ops.commercialCrud.onSubmitTenant,
    onEditTenant: ops.commercialCrud.onEditTenant,
    onCancelTenantEdit: ops.commercialCrud.onCancelTenantEdit,
  }
}
