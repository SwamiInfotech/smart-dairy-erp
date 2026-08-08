import type { AppShellState } from './useAppShellState'
import { useCollectionCrud } from './useCollectionCrud'
import { useCommercialCrud } from './useCommercialCrud'
import { useMilkRateChartCrud } from './useMilkRateChartCrud'
import { usePublicAuthActions } from './usePublicAuthActions'
import { usePublicOnboarding } from './usePublicOnboarding'
import { useSalesCustomerSelection } from './useSalesCustomerSelection'

export function useAppShellCommercialOperations(state: AppShellState) {
  const { session, entities, forms, runAction, initialAuth } = state

  const salesCustomerSelection = useSalesCustomerSelection({
    customers: entities.customers,
    salesForm: forms.salesForm,
    setSalesForm: forms.setSalesForm,
    setSalesCustomerInput: session.setSalesCustomerInput,
  })

  const onboarding = usePublicOnboarding({
    onboardForm: session.onboardForm,
    runAction,
    setOnboardForm: session.setOnboardForm,
    setError: session.setError,
    setTenantDirectory: session.setTenantDirectory,
    setLoginTenantUuid: session.setLoginTenantUuid,
    setLoginCompanyName: session.setLoginCompanyName,
    setLoginUsername: session.setLoginUsername,
    setOnboardSuccessMessage: session.setOnboardSuccessMessage,
    setPublicView: session.setPublicView,
  })

  const commercialCrud = useCommercialCrud({
    token: session.token,
    branchUuid: session.branchUuid,
    productForm: forms.productForm,
    customerForm: forms.customerForm,
    tenantForm: forms.tenantForm,
    editingTenantUuid: forms.editingTenantUuid,
    salesForm: forms.salesForm,
    salesCustomerInput: session.salesCustomerInput,
    customers: entities.customers,
    runAction,
    setError: session.setError,
    setProducts: entities.setProducts,
    setProductForm: forms.setProductForm,
    setCustomers: entities.setCustomers,
    setTenants: entities.setTenants,
    setTenantForm: forms.setTenantForm,
    setEditingTenantUuid: forms.setEditingTenantUuid,
    setSales: entities.setSales,
    setInventoryTransactions: entities.setInventoryTransactions,
    setSalesForm: forms.setSalesForm,
  })

  const milkRateChartCrud = useMilkRateChartCrud({
    token: session.token,
    branchUuid: session.branchUuid,
    initialBranchUuid: initialAuth.branchUuid,
    branchName: session.branchName,
    currentShopName: session.currentShop?.name || '',
    milkRateForm: forms.milkRateForm,
    editingMilkRateChartUuid: entities.editingMilkRateChartUuid,
    rateCategories: entities.rateCategories,
    collectionMethods: entities.collectionMethods,
    runAction,
    setError: session.setError,
    setMilkRateCharts: entities.setMilkRateCharts,
    setFarmerRateCharts: entities.setFarmerRateCharts,
    setEditingMilkRateChartUuid: entities.setEditingMilkRateChartUuid,
    setMilkRateForm: forms.setMilkRateForm,
  })

  const collectionCrud = useCollectionCrud({
    token: session.token,
    collectionForm: forms.collectionForm,
    collections: entities.collections,
    farmers: entities.farmers,
    shifts: entities.shifts,
    milkTypes: entities.milkTypes,
    selectedCollectionMethod: forms.selectedCollectionMethod,
    runAction,
    setError: session.setError,
    setCollections: entities.setCollections,
    setCollectionForm: forms.setCollectionForm,
  })

  const publicAuthActions = usePublicAuthActions({
    setPublicView: session.setPublicView,
    setOnboardSuccessMessage: session.setOnboardSuccessMessage,
    setLoginCompanyName: session.setLoginCompanyName,
    setLoginTenantUuid: session.setLoginTenantUuid,
    setTenantLookupNote: session.setTenantLookupNote,
    setError: session.setError,
    setSuccess: session.setSuccess,
  })

  return {
    salesCustomerSelection,
    onboarding,
    commercialCrud,
    milkRateChartCrud,
    collectionCrud,
    publicAuthActions,
  }
}
