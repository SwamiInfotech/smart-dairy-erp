import type { AppShellContractsArgs } from './appShellContracts'

export function useWorkspacePanelGridMastersProps({
  state,
  ops,
}: AppShellContractsArgs) {
  const { entities } = state

  return {
    collectionMethods: entities.collectionMethods,
    collectionMethodForm: ops.masterDataCrud.collectionMethodForm,
    editingCollectionMethodUuid: ops.masterDataCrud.editingCollectionMethodUuid,
    setCollectionMethodForm: ops.masterDataCrud.setCollectionMethodForm,
    onSubmitCollectionMethod: ops.masterDataCrud.onSubmitCollectionMethod,
    onCancelCollectionMethodEdit: ops.masterDataCrud.onCancelCollectionMethodEdit,
    onEditCollectionMethod: ops.masterDataCrud.onEditCollectionMethod,
    onDeleteCollectionMethod: ops.masterDataCrud.onDeleteCollectionMethod,
    loadCollectionMethodsView: ops.dataLoading.loadCollectionMethodsView,
    paymentCycles: entities.paymentCycles,
    paymentCycleForm: ops.masterDataCrud.paymentCycleForm,
    editingPaymentCycleUuid: ops.masterDataCrud.editingPaymentCycleUuid,
    setPaymentCycleForm: ops.masterDataCrud.setPaymentCycleForm,
    onSubmitPaymentCycle: ops.masterDataCrud.onSubmitPaymentCycle,
    onCancelPaymentCycleEdit: ops.masterDataCrud.onCancelPaymentCycleEdit,
    onEditPaymentCycle: ops.masterDataCrud.onEditPaymentCycle,
    onDeletePaymentCycle: ops.masterDataCrud.onDeletePaymentCycle,
    loadPaymentCyclesView: ops.dataLoading.loadPaymentCyclesView,
    shiftForm: ops.masterDataCrud.shiftForm,
    setShiftForm: ops.masterDataCrud.setShiftForm,
    onSubmitShift: ops.masterDataCrud.onSubmitShift,
    loadShiftsView: ops.dataLoading.loadShiftsView,
    rateCategories: entities.rateCategories,
    rateCategoryForm: ops.masterDataCrud.rateCategoryForm,
    setRateCategoryForm: ops.masterDataCrud.setRateCategoryForm,
    editingRateCategoryUuid: ops.masterDataCrud.editingRateCategoryUuid,
    loadMilkRateLookups: ops.dataLoading.loadMilkRateLookups,
    onSubmitRateCategory: ops.masterDataCrud.onSubmitRateCategory,
    onCancelRateCategoryEdit: ops.masterDataCrud.onCancelRateCategoryEdit,
    onEditRateCategory: ops.masterDataCrud.onEditRateCategory,
    onDeleteRateCategory: ops.masterDataCrud.onDeleteRateCategory,
  }
}
