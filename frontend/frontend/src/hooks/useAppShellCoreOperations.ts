import type { TabKey } from '../lib/appShellConfig'
import { useAppDataLoading } from './useAppDataLoading'
import { useAuthTenantFlow } from './useAuthTenantFlow'
import { useScrollToTopOnMenu } from './useScrollToTopOnMenu'
import type { AppShellState } from './useAppShellState'
import { useWorkspaceShell } from './useWorkspaceShell'

export function useAppShellCoreOperations(state: AppShellState) {
  const { session, entities, runAction } = state

  const shell = useWorkspaceShell<TabKey>({
    initialTab: 'dashboard',
    milkCollectionsTab: 'milkCollections',
  })

  const authFlow = useAuthTenantFlow({
    loginUsername: session.loginUsername,
    loginPassword: session.loginPassword,
    loginCompanyName: session.loginCompanyName,
    loginTenantUuid: session.loginTenantUuid,
    tenantDirectory: session.tenantDirectory,
    accessibleTenants: session.accessibleTenants,
    runAction,
    setError: session.setError,
    setLoginDebug: session.setLoginDebug,
    setTenantLookupNote: session.setTenantLookupNote,
    setResolvingTenantUuid: session.setResolvingTenantUuid,
    setLoginTenantUuid: session.setLoginTenantUuid,
    setLoginCompanyName: session.setLoginCompanyName,
    setTenantDirectory: session.setTenantDirectory,
    setToken: session.setToken,
    setTenantUuid: session.setTenantUuid,
    setBranchUuid: session.setBranchUuid,
    setBranchName: session.setBranchName,
    setAccessibleTenants: session.setAccessibleTenants,
    setMyShops: session.setMyShops,
    setDashboard: entities.setDashboard,
    setProducts: entities.setProducts,
    setCustomers: entities.setCustomers,
    setCollections: entities.setCollections,
    setSales: entities.setSales,
    setSuccess: session.setSuccess,
  })

  const dataLoading = useAppDataLoading({
    token: session.token,
    tenantUuid: session.tenantUuid,
    activeSidebarMenu: shell.activeSidebarMenu,
    dashboardRange: entities.dashboardRange,
    runAction,
    setDashboard: entities.setDashboard,
    setProducts: entities.setProducts,
    setBackendNextProductCode: entities.setBackendNextProductCode,
    setCustomers: entities.setCustomers,
    setTenants: entities.setTenants,
    setFarmers: entities.setFarmers,
    setSales: entities.setSales,
    setInventoryTransactions: entities.setInventoryTransactions,
    setInventoryCurrentStock: entities.setInventoryCurrentStock,
    setCollections: entities.setCollections,
    setMilkTypes: entities.setMilkTypes,
    setShifts: entities.setShifts,
    setMilkRateCharts: entities.setMilkRateCharts,
    setCollectionMethods: entities.setCollectionMethods,
    setRateCategories: entities.setRateCategories,
    setPaymentCycles: entities.setPaymentCycles,
    setFarmerRateCharts: entities.setFarmerRateCharts,
    setMyShops: session.setMyShops,
  })

  useScrollToTopOnMenu(shell.activeSidebarMenu, 'rateProfiles', session.bodyScrollRef)

  return {
    shell,
    authFlow,
    dataLoading,
  }
}
