import type { AppShellContractsArgs } from './appShellContracts'

export function useWorkspacePanelGridCatalogProps({
  state,
  ops,
}: AppShellContractsArgs) {
  const {
    session,
    entities,
    forms,
    averageProductSellingPrice,
    nextProductCode,
    collectionComputation,
  } = state

  return {
    activeTab: ops.shell.activeTab,
    activeSidebarMenu: ops.shell.activeSidebarMenu,
    busy: session.busy,
    dashboard: entities.dashboard,
    dashboardRange: entities.dashboardRange,
    setDashboardRange: entities.setDashboardRange,
    collections: entities.collections,
    farmers: entities.farmers,
    products: entities.products,
    customers: entities.customers,
    sales: entities.sales,
    loadDashboard: ops.dataLoading.loadDashboard,
    openPrimarySection: ops.shell.openPrimarySection,
    productForm: forms.productForm,
    setProductForm: forms.setProductForm,
    averageProductSellingPrice,
    nextProductCode,
    loadProducts: ops.dataLoading.loadProducts,
    onCreateProduct: ops.commercialCrud.onCreateProduct,
    branchName: session.branchName,
    branchUuid: session.branchUuid,
    customerForm: forms.customerForm,
    setCustomerForm: forms.setCustomerForm,
    loadCustomers: ops.dataLoading.loadCustomers,
    onCreateCustomer: ops.commercialCrud.onCreateCustomer,
    collectionForm: forms.collectionForm,
    setCollectionForm: forms.setCollectionForm,
    shifts: entities.shifts,
    milkTypes: entities.milkTypes,
    selectedCollectionFarmer: collectionComputation.selectedCollectionFarmer,
    selectedCollectionMilkRateChart:
      collectionComputation.selectedCollectionMilkRateChart,
    selectedCollectionMethod: forms.selectedCollectionMethod,
    collectionQualityVisibility: collectionComputation.collectionQualityVisibility,
    calculatedCollectionRate: collectionComputation.calculatedCollectionRate,
    calculatedCollectionAmount: collectionComputation.calculatedCollectionAmount,
    isCollectionDateWithinRateChart:
      collectionComputation.isCollectionDateWithinRateChart,
    onCollectionFarmerChange: ops.collectionFarmerSelection.onCollectionFarmerChange,
    onCreateCollection: ops.collectionCrud.onCreateCollection,
    loadCollections: ops.dataLoading.loadCollections,
  }
}
