import { PAYMENT_MODES } from '../lib/appShellConfig'
import type { AppShellContractsArgs } from './appShellContracts'

export function useWorkspacePanelGridRatesSalesProps({
  state,
  ops,
}: AppShellContractsArgs) {
  const { session, entities, forms, milkRateQualityVisibility, milkRateDetails } =
    state

  return {
    currentShopName: session.currentShop?.name || '',
    milkRateForm: forms.milkRateForm,
    setMilkRateForm: forms.setMilkRateForm,
    editingMilkRateChartUuid: entities.editingMilkRateChartUuid,
    milkRateCharts: entities.milkRateCharts,
    milkRateQualityVisibility,
    milkRateRowConflictState: milkRateDetails.milkRateRowConflictState,
    loadMilkRateChartsView: ops.dataLoading.loadMilkRateChartsView,
    onCreateMilkRateChart: ops.milkRateChartCrud.onCreateMilkRateChart,
    updateMilkRateDetail: milkRateDetails.updateMilkRateDetail,
    removeMilkRateDetailRow: milkRateDetails.removeMilkRateDetailRow,
    addMilkRateDetailRow: milkRateDetails.addMilkRateDetailRow,
    setMavaFromRef: ops.milkRateChartCrud.setMavaFromRef,
    onCancelMilkRateChartEdit: ops.milkRateChartCrud.onCancelMilkRateChartEdit,
    onEditMilkRateChart: ops.milkRateChartCrud.onEditMilkRateChart,
    onDeleteMilkRateChart: ops.milkRateChartCrud.onDeleteMilkRateChart,
    salesForm: forms.salesForm,
    setSalesForm: forms.setSalesForm,
    salesCustomerInput: session.salesCustomerInput,
    onSalesCustomerInputChange: ops.salesCustomerSelection.onSalesCustomerInputChange,
    loadSales: ops.dataLoading.loadSales,
    onCreateSales: ops.commercialCrud.onCreateSales,
    addSalesItemRow: ops.commercialCrud.addSalesItemRow,
    updateSalesItem: ops.commercialCrud.updateSalesItem,
    paymentModes: PAYMENT_MODES,
  }
}
