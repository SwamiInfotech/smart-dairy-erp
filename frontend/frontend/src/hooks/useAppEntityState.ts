import { useState } from 'react'
import { toInputDate } from '../lib/appCoreUtils'
import type { CollectionEntryMode } from '../lib/collectionEntryMode'
import type {
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
} from '../types/api'

export type CollectionListItem = {
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

export function useAppEntityState() {
  const [dashboardRange, setDashboardRange] = useState({
    fromDate: toInputDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)),
    toDate: toInputDate(new Date()),
  })
  const [dashboard, setDashboard] = useState<SalesDashboardResponse | null>(null)

  const [products, setProducts] = useState<ProductResponse[]>([])
  const [customers, setCustomers] = useState<CustomerResponse[]>([])
  const [tenants, setTenants] = useState<TenantResponse[]>([])
  const [farmers, setFarmers] = useState<FarmerResponse[]>([])
  const [sales, setSales] = useState<SalesInvoiceResponse[]>([])
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransactionResponse[]>([])
  const [inventoryCurrentStock, setInventoryCurrentStock] = useState<InventoryCurrentStockResponse[]>([])
  const [collections, setCollections] = useState<CollectionListItem[]>([])
  const [milkTypes, setMilkTypes] = useState<MilkTypeResponse[]>([])
  const [shifts, setShifts] = useState<ShiftResponse[]>([])
  const [rateCategories, setRateCategories] = useState<RateCategoryResponse[]>([])
  const [collectionMethods, setCollectionMethods] = useState<CollectionMethodResponse[]>([])
  const [paymentCycles, setPaymentCycles] = useState<PaymentCycleResponse[]>([])
  const [farmerRateCharts, setFarmerRateCharts] = useState<MilkRateChartResponse[]>([])
  const [editingMilkRateChartUuid, setEditingMilkRateChartUuid] = useState('')
  const [milkRateCharts, setMilkRateCharts] = useState<MilkRateChartResponse[]>([])

  return {
    dashboardRange,
    setDashboardRange,
    dashboard,
    setDashboard,
    products,
    setProducts,
    customers,
    setCustomers,
    tenants,
    setTenants,
    farmers,
    setFarmers,
    sales,
    setSales,
    inventoryTransactions,
    setInventoryTransactions,
    inventoryCurrentStock,
    setInventoryCurrentStock,
    collections,
    setCollections,
    milkTypes,
    setMilkTypes,
    shifts,
    setShifts,
    rateCategories,
    setRateCategories,
    collectionMethods,
    setCollectionMethods,
    paymentCycles,
    setPaymentCycles,
    farmerRateCharts,
    setFarmerRateCharts,
    editingMilkRateChartUuid,
    setEditingMilkRateChartUuid,
    milkRateCharts,
    setMilkRateCharts,
  }
}
