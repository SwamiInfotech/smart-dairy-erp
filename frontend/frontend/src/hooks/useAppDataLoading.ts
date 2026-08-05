import { useCallback, useEffect } from 'react'
import { api } from '../lib/api'
import {
  fromApiCollectionEntryMode,
  extractCollectionEntryModeFromRemarks,
  stripCollectionEntryModeTag,
  type CollectionEntryMode,
} from '../lib/collectionEntryMode'
import type {
  ApiCollectionEntryMode,
  CollectionMethodResponse,
  CustomerResponse,
  FarmerResponse,
  InventoryCurrentStockResponse,
  InventoryTransactionResponse,
  MilkRateChartResponse,
  MilkTypeResponse,
  PaymentCycleResponse,
  ProductResponse,
  RateCategoryResponse,
  SalesDashboardResponse,
  SalesInvoiceResponse,
  ShiftResponse,
  TenantResponse,
  TenantShopResponse,
} from '../types/api'

type CollectionListItem = {
  uuid: string
  collectionNo: string
  farmerName: string
  farmerUuid?: string
  shiftUuid?: string
  milkTypeUuid?: string
  collectionDate: string
  collectionTime?: string
  quantity: number
  fat?: number | null
  snf?: number | null
  mava?: number | null
  remarks?: string | null
  entryMode?: CollectionEntryMode
  grossAmount: number
}

type ApiCollectionListItem = Omit<CollectionListItem, 'entryMode'> & {
  entryMode?: ApiCollectionEntryMode | null
}

function normalizeCollectionListItem(item: ApiCollectionListItem): CollectionListItem {
  const resolvedMode = fromApiCollectionEntryMode((item as { entryMode?: unknown }).entryMode)
  return {
    ...item,
    entryMode: resolvedMode !== 'unknown' ? resolvedMode : extractCollectionEntryModeFromRemarks(item.remarks),
    remarks: stripCollectionEntryModeTag(item.remarks),
  }
}

type AppDataRange = {
  fromDate: string
  toDate: string
}

type UseAppDataLoadingParams = {
  token: string
  tenantUuid: string
  activeSidebarMenu: string
  dashboardRange: AppDataRange
  runAction: <T>(action: () => Promise<T>, successMessage?: string) => Promise<T | null>
  setDashboard: React.Dispatch<React.SetStateAction<SalesDashboardResponse | null>>
  setProducts: React.Dispatch<React.SetStateAction<ProductResponse[]>>
  setCustomers: React.Dispatch<React.SetStateAction<CustomerResponse[]>>
  setTenants: React.Dispatch<React.SetStateAction<TenantResponse[]>>
  setFarmers: React.Dispatch<React.SetStateAction<FarmerResponse[]>>
  setSales: React.Dispatch<React.SetStateAction<SalesInvoiceResponse[]>>
  setInventoryTransactions: React.Dispatch<React.SetStateAction<InventoryTransactionResponse[]>>
  setInventoryCurrentStock: React.Dispatch<React.SetStateAction<InventoryCurrentStockResponse[]>>
  setCollections: React.Dispatch<React.SetStateAction<CollectionListItem[]>>
  setMilkTypes: React.Dispatch<React.SetStateAction<MilkTypeResponse[]>>
  setShifts: React.Dispatch<React.SetStateAction<ShiftResponse[]>>
  setMilkRateCharts: React.Dispatch<React.SetStateAction<MilkRateChartResponse[]>>
  setCollectionMethods: React.Dispatch<React.SetStateAction<CollectionMethodResponse[]>>
  setRateCategories: React.Dispatch<React.SetStateAction<RateCategoryResponse[]>>
  setPaymentCycles: React.Dispatch<React.SetStateAction<PaymentCycleResponse[]>>
  setFarmerRateCharts: React.Dispatch<React.SetStateAction<MilkRateChartResponse[]>>
  setMyShops: React.Dispatch<React.SetStateAction<TenantShopResponse[]>>
}

export function useAppDataLoading({
  token,
  tenantUuid,
  activeSidebarMenu,
  dashboardRange,
  runAction,
  setDashboard,
  setProducts,
  setCustomers,
  setTenants,
  setFarmers,
  setSales,
  setInventoryTransactions,
  setInventoryCurrentStock,
  setCollections,
  setMilkTypes,
  setShifts,
  setMilkRateCharts,
  setCollectionMethods,
  setRateCategories,
  setPaymentCycles,
  setFarmerRateCharts,
  setMyShops,
}: UseAppDataLoadingParams) {
  const isProductActive = (product: ProductResponse) => product.active === true

  const loadDashboard = useCallback(async () => {
    if (!token) return
    const result = await runAction(
      () => api.getSalesDashboard(token, dashboardRange.fromDate, dashboardRange.toDate),
      'Dashboard refreshed.',
    )
    if (result) {
      setDashboard(result)
    }
  }, [dashboardRange.fromDate, dashboardRange.toDate, runAction, setDashboard, token])

  const loadProducts = useCallback(async () => {
    if (!token) return
    const result = await runAction(() => api.searchProducts(token))
    if (result) {
      setProducts(result.content.filter(isProductActive))
    }
  }, [runAction, setProducts, token])

  const loadCustomers = useCallback(async () => {
    if (!token) return
    const result = await runAction(() => api.searchCustomers(token))
    if (result) {
      setCustomers(result.content)
    }
  }, [runAction, setCustomers, token])

  const loadTenants = useCallback(async () => {
    if (!token) return
    const result = await runAction(() => api.getTenants(token))
    if (result) {
      setTenants(result)
    }
  }, [runAction, setTenants, token])

  const loadFarmers = useCallback(async () => {
    if (!token) return
    const result = await runAction(() => api.searchFarmers(token))
    if (result) {
      const farmerList = Array.isArray(result)
        ? result
        : Array.isArray(result.content)
          ? result.content
          : []
      setFarmers(farmerList)
    }
  }, [runAction, setFarmers, token])

  const loadCollections = useCallback(async () => {
    if (!token) return
    const [collectionPage, farmerPage, types, shiftList, chartList, methodList] = await Promise.all([
      runAction(() => api.searchMilkCollections(token)),
      runAction(() => api.searchFarmers(token)),
      runAction(() => api.getMilkTypes(token)),
      runAction(() => api.getShifts(token)),
      runAction(() => api.getMilkRateCharts(token)),
      runAction(() => api.getCollectionMethods(token)),
    ])

    if (collectionPage) {
      setCollections(collectionPage.content.map(normalizeCollectionListItem))
    }
    if (farmerPage) {
      setFarmers(Array.isArray(farmerPage.content) ? farmerPage.content : [])
    }
    if (types) {
      setMilkTypes(types)
    }
    if (shiftList) {
      setShifts(shiftList)
    }
    if (chartList) {
      setMilkRateCharts(chartList)
    }
    if (methodList) {
      setCollectionMethods(methodList)
    }
  }, [
    runAction,
    setCollectionMethods,
    setCollections,
    setFarmers,
    setMilkRateCharts,
    setMilkTypes,
    setShifts,
    token,
  ])

  const loadCollectionMethodsView = useCallback(async () => {
    if (!token) return

    const methodList = await runAction(() => api.getCollectionMethods(token))

    if (methodList) {
      setCollectionMethods(methodList)
    }
  }, [runAction, setCollectionMethods, token])

  const loadPaymentCyclesView = useCallback(async () => {
    if (!token) return
    const paymentCycleList = await runAction(() => api.getPaymentCycles(token))
    if (paymentCycleList) {
      setPaymentCycles(paymentCycleList)
    }
  }, [runAction, setPaymentCycles, token])

  const loadShiftsView = useCallback(async () => {
    if (!token) return
    const shiftList = await runAction(() => api.getShifts(token))
    if (shiftList) {
      setShifts(shiftList)
    }
  }, [runAction, setShifts, token])

  const loadSales = useCallback(async () => {
    if (!token) return
    const result = await runAction(() => api.searchSales(token))
    if (result) {
      setSales(result.content)
    }
  }, [runAction, setSales, token])

  const loadInventoryTransactions = useCallback(async () => {
    if (!token) return
    const result = await runAction(() => api.searchInventoryTransactions(token))
    if (result) {
      setInventoryTransactions(result)
    }
  }, [runAction, setInventoryTransactions, token])

  const loadInventoryCurrentStock = useCallback(async () => {
    if (!token) return
    const result = await runAction(() => api.searchInventoryCurrentStock(token))
    if (result) {
      setInventoryCurrentStock(result)
    }
  }, [runAction, setInventoryCurrentStock, token])

  const loadMilkRateLookups = useCallback(async () => {
    if (!token) return
    const [rateCategoryList, collectionMethodList] = await Promise.all([
      runAction(() => api.getRateCategories(token)),
      runAction(() => api.getCollectionMethods(token)),
    ])

    if (rateCategoryList) {
      setRateCategories(rateCategoryList)
    }

    if (collectionMethodList) {
      setCollectionMethods(collectionMethodList)
    }
  }, [runAction, setCollectionMethods, setRateCategories, token])

  const loadMilkRateChartsView = useCallback(async () => {
    if (!token) return
    const chartList = await runAction(() => api.getMilkRateCharts(token))
    if (chartList) {
      setMilkRateCharts(chartList)
      setFarmerRateCharts(chartList)
    }
  }, [runAction, setFarmerRateCharts, setMilkRateCharts, token])

  const loadFarmerConfigLookups = useCallback(async () => {
    if (!token) return
    const [types, paymentCycleList, chartList] = await Promise.all([
      runAction(() => api.getMilkTypes(token)),
      runAction(() => api.getPaymentCycles(token)),
      runAction(() => api.getMilkRateCharts(token)),
    ])

    if (types) {
      setMilkTypes(types)
    }

    if (paymentCycleList) {
      setPaymentCycles(paymentCycleList)
    }

    if (chartList) {
      setFarmerRateCharts(chartList)
    }
  }, [runAction, setFarmerRateCharts, setMilkTypes, setPaymentCycles, token])

  const loadMyShops = useCallback(async () => {
    if (!token) return
    const result = await runAction(() => api.getMyShops(token))
    if (result) {
      setMyShops(result)
    }
  }, [runAction, setMyShops, token])

  useEffect(() => {
    if (!token) return
    void loadDashboard()
    void loadProducts()
    void loadCustomers()
    void loadTenants()
    void loadFarmers()
    void loadCollections()
    void loadSales()
  }, [
    loadCollections,
    loadCustomers,
    loadDashboard,
    loadFarmers,
    loadProducts,
    loadSales,
    loadTenants,
    token,
  ])

  useEffect(() => {
    if (!token) {
      setMyShops([])
      return
    }

    void loadMyShops()
  }, [loadMyShops, setMyShops, tenantUuid, token])

  useEffect(() => {
    if (!token || (activeSidebarMenu !== 'milkRateCharts' && activeSidebarMenu !== 'rateProfiles')) return
    void loadMilkRateLookups()
    if (activeSidebarMenu === 'milkRateCharts') {
      void loadMilkRateChartsView()
    }
  }, [activeSidebarMenu, loadMilkRateChartsView, loadMilkRateLookups, token])

  useEffect(() => {
    if (!token || activeSidebarMenu !== 'collectionMethods') return
    void loadCollectionMethodsView()
  }, [activeSidebarMenu, loadCollectionMethodsView, token])

  useEffect(() => {
    if (!token || activeSidebarMenu !== 'paymentCycles') return
    void loadPaymentCyclesView()
  }, [activeSidebarMenu, loadPaymentCyclesView, token])

  useEffect(() => {
    if (!token || activeSidebarMenu !== 'shifts') return
    void loadShiftsView()
  }, [activeSidebarMenu, loadShiftsView, token])

  useEffect(() => {
    if (!token || activeSidebarMenu !== 'farmers') return
    void loadFarmerConfigLookups()
  }, [activeSidebarMenu, loadFarmerConfigLookups, token])

  useEffect(() => {
    if (!token || activeSidebarMenu !== 'inventory') return
    void loadInventoryTransactions()
    void loadInventoryCurrentStock()
  }, [activeSidebarMenu, loadInventoryCurrentStock, loadInventoryTransactions, token])

  return {
    loadDashboard,
    loadProducts,
    loadCustomers,
    loadTenants,
    loadFarmers,
    loadCollections,
    loadSales,
    loadInventoryTransactions,
    loadInventoryCurrentStock,
    loadCollectionMethodsView,
    loadPaymentCyclesView,
    loadShiftsView,
    loadMilkRateLookups,
    loadMilkRateChartsView,
  }
}
