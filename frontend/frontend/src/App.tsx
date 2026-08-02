import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import {
  api,
  clearAuth,
  getLastLoginAttemptDebug,
  getSavedAuth,
  saveAuth,
} from './lib/api'
import type {
  CreateMilkRateChartRequest,
  CreateTenantRequest,
  CreateSalesInvoiceItemRequest,
  CustomerResponse,
  FarmerResponse,
  MasterLookupResponse,
  MilkRateChartResponse,
  MilkTypeResponse,
  PaymentMode,
  ProductResponse,
  PublicOnboardRequest,
  SalesDashboardResponse,
  SalesInvoiceResponse,
  ShiftResponse,
  TenantResponse,
  TenantShopResponse,
} from './types/api'
import './App.css'

type TabKey =
  | 'dashboard'
  | 'products'
  | 'customers'
  | 'milkCollections'
  | 'sales'
  | 'farmers'
  | 'tenants'

type PublicView = 'login' | 'onboard'

const SIDEBAR_GROUPS = [
  {
    title: 'Operations',
    items: ['dashboard', 'products', 'customers', 'milkCollections', 'sales', 'farmers'],
  },
  {
    title: 'Masters',
    items: ['master', 'collectionMethods', 'paymentCycles', 'pricing', 'rateProfiles', 'milkRateCharts', 'shifts'],
  },
  {
    title: 'Transactions',
    items: [
      'tenants',
      'companies',
      'branches',
      'farmerConfigurations',
      'productionBatches',
      'inventory',
      'loans',
      'settlements',
      'payments',
    ],
  },
  {
    title: 'Reports',
    items: ['reports', 'health'],
  },
  {
    title: 'Access',
    items: ['auth'],
  },
] as const

const TAB_LABELS: Record<TabKey, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  customers: 'Customers',
  milkCollections: 'Milk Collections',
  sales: 'Sales',
  farmers: 'Farmers',
  tenants: 'Tenants',
}

const PAYMENT_MODES: PaymentMode[] = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CREDIT']
const TENANT_DIRECTORY_KEY = 'smart_dairy_tenant_directory'

type TenantDirectoryEntry = {
  companyName: string
  tenantUuid: string
}

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function toInputTime(date: Date) {
  return date.toTimeString().slice(0, 5)
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

function findLookupByLabel<T extends { code: string; name: string }>(items: T[], label: string) {
  const normalizedLabel = label.trim().toLowerCase()
  return items.find((item) => {
    const code = item.code.trim().toLowerCase()
    const name = item.name.trim().toLowerCase()
    return code === normalizedLabel || name === normalizedLabel
  })
}

function isTenDigitMobile(value: string) {
  return /^[6-9]\d{9}$/.test(value)
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidPincode(value: string) {
  return /^\d{6}$/.test(value)
}

function isValidAadhar(value: string) {
  return /^\d{12}$/.test(value)
}

function isValidPan(value: string) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value)
}

function normalizeCompanyName(value: string) {
  return value.trim().toLowerCase()
}

function loadTenantDirectory() {
  try {
    const raw = localStorage.getItem(TENANT_DIRECTORY_KEY)
    if (!raw) return [] as TenantDirectoryEntry[]

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return [] as TenantDirectoryEntry[]

    return parsed
      .filter(
        (item): item is TenantDirectoryEntry =>
          Boolean(
            item &&
              typeof item === 'object' &&
              'companyName' in item &&
              'tenantUuid' in item &&
              typeof (item as { companyName: unknown }).companyName === 'string' &&
              typeof (item as { tenantUuid: unknown }).tenantUuid === 'string',
          ),
      )
      .map((item) => ({
        companyName: item.companyName.trim(),
        tenantUuid: item.tenantUuid.trim(),
      }))
      .filter((item) => item.companyName && isUuid(item.tenantUuid))
  } catch {
    return [] as TenantDirectoryEntry[]
  }
}

function saveTenantDirectory(entries: TenantDirectoryEntry[]) {
  localStorage.setItem(TENANT_DIRECTORY_KEY, JSON.stringify(entries))
}

function upsertTenantDirectory(
  entries: TenantDirectoryEntry[],
  companyName: string,
  tenantUuid: string,
) {
  const normalized = normalizeCompanyName(companyName)
  if (!normalized || !isUuid(tenantUuid)) {
    return entries
  }

  const next = entries.filter((entry) => normalizeCompanyName(entry.companyName) !== normalized)
  next.unshift({ companyName: companyName.trim(), tenantUuid: tenantUuid.trim() })
  return next
}

function findTenantUuidByCompany(entries: TenantDirectoryEntry[], companyName: string) {
  const normalized = normalizeCompanyName(companyName)
  if (!normalized) return ''

  const matched = entries.find((entry) => normalizeCompanyName(entry.companyName) === normalized)
  return matched?.tenantUuid || ''
}

function buildNextProductCode(existingCodes: string[]) {
  let highestNumber = 0
  let selectedPrefix = 'PRD'
  let selectedWidth = 3

  for (const rawCode of existingCodes) {
    const code = rawCode.trim()
    if (!code) continue

    const match = code.match(/^(.*?)(\d+)$/)
    if (!match) continue

    const prefix = match[1] || 'PRD'
    const numberPart = match[2]
    const numberValue = Number(numberPart)

    if (Number.isNaN(numberValue)) continue

    if (numberValue > highestNumber) {
      highestNumber = numberValue
      selectedPrefix = prefix
      selectedWidth = numberPart.length
    }
  }

  const nextNumber = highestNumber + 1
  return `${selectedPrefix}${String(nextNumber).padStart(selectedWidth, '0')}`
}

function buildNextFarmerCode(existingCodes: string[]) {
  let highestNumber = 0
  let selectedPrefix = 'FRM'
  let selectedWidth = 3

  for (const rawCode of existingCodes) {
    const code = rawCode.trim()
    if (!code) continue

    const match = code.match(/^(.*?)(\d+)$/)
    if (!match) continue

    const prefix = match[1] || 'FRM'
    const numberPart = match[2]
    const numberValue = Number(numberPart)

    if (Number.isNaN(numberValue)) continue

    if (numberValue > highestNumber) {
      highestNumber = numberValue
      selectedPrefix = prefix
      selectedWidth = numberPart.length
    }
  }

  const nextNumber = highestNumber + 1
  return `${selectedPrefix}${String(nextNumber).padStart(selectedWidth, '0')}`
}

function buildCustomerLookupLabel(customer: CustomerResponse) {
  return `${customer.customerName} (${customer.customerCode || customer.mobileNo || 'Customer'})`
}

function resolveCustomerSelection(input: string, customers: CustomerResponse[]) {
  const trimmed = input.trim().toLowerCase()
  if (!trimmed) return null

  return (
    customers.find((customer) => buildCustomerLookupLabel(customer).toLowerCase() === trimmed) ||
    customers.find((customer) => customer.customerName.trim().toLowerCase() === trimmed) ||
    customers.find((customer) => customer.customerCode.trim().toLowerCase() === trimmed) ||
    customers.find((customer) => customer.uuid.trim().toLowerCase() === trimmed) ||
    null
  )
}

function resolveQualityFieldVisibility(collectionMethod: MasterLookupResponse | null) {
  if (!collectionMethod) {
    return {
      showFat: true,
      showSnf: true,
      showMava: true,
    }
  }

  const code = collectionMethod.code.trim().toLowerCase()
  const name = collectionMethod.name.trim().toLowerCase()
  const codeToken = code.replace(/[^a-z]/g, '')
  const nameToken = name.replace(/[^a-z]/g, '')
  const words = `${code} ${name}`

  // Prefer exact code/name key first because master names can contain extra words.
  if (codeToken === 'fat' || nameToken === 'fat') {
    return {
      showFat: true,
      showSnf: false,
      showMava: false,
    }
  }

  if (codeToken === 'snf' || nameToken === 'snf') {
    return {
      showFat: false,
      showSnf: true,
      showMava: false,
    }
  }

  if (codeToken === 'mava' || nameToken === 'mava') {
    return {
      showFat: false,
      showSnf: false,
      showMava: true,
    }
  }

  // Fallback token checks when exact normalization is not available.
  const hasFat = /\bfat\b/.test(words)
  const hasSnf = /\bsnf\b/.test(words)
  const hasMava = /\bmava\b/.test(words)

  if (hasFat && !hasSnf && !hasMava) {
    return {
      showFat: true,
      showSnf: false,
      showMava: false,
    }
  }

  if (hasSnf && !hasFat && !hasMava) {
    return {
      showFat: false,
      showSnf: true,
      showMava: false,
    }
  }

  if (hasMava && !hasFat && !hasSnf) {
    return {
      showFat: false,
      showSnf: false,
      showMava: true,
    }
  }

  return {
    showFat: true,
    showSnf: true,
    showMava: true,
  }
}

function explainQualityFieldVisibility(collectionMethod: MasterLookupResponse | null) {
  const visibility = resolveQualityFieldVisibility(collectionMethod)
  const summary = `${visibility.showFat ? 'FAT:show' : 'FAT:hide'}, ${visibility.showSnf ? 'SNF:show' : 'SNF:hide'}, ${visibility.showMava ? 'MAVA:show' : 'MAVA:hide'}`

  if (!collectionMethod) {
    return {
      visibility,
      reason: 'collection-method-missing -> fallback show all',
      summary,
    }
  }

  const code = collectionMethod.code.trim().toLowerCase()
  const name = collectionMethod.name.trim().toLowerCase()
  return {
    visibility,
    reason: `resolved from collection method code="${code}" name="${name}"`,
    summary,
  }
}

function pickCollectionQualityMetric(visibility: { showFat: boolean; showSnf: boolean; showMava: boolean }) {
  if (visibility.showFat && !visibility.showSnf && !visibility.showMava) {
    return 'fat' as const
  }

  if (!visibility.showFat && visibility.showSnf && !visibility.showMava) {
    return 'snf' as const
  }

  if (!visibility.showFat && !visibility.showSnf && visibility.showMava) {
    return 'mava' as const
  }

  return 'mixed' as const
}

function roundToTwo(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 100) / 100
}

function App() {
  const initialAuth = useMemo(getSavedAuth, [])

  const [token, setToken] = useState(initialAuth.token)
  const [tenantUuid, setTenantUuid] = useState(initialAuth.tenantUuid)
  const [defaultTenantUuid, setDefaultTenantUuid] = useState(initialAuth.defaultTenantUuid)
  const [branchUuid, setBranchUuid] = useState(initialAuth.branchUuid)
  const [branchName, setBranchName] = useState(initialAuth.branchName)
  const [accessibleTenants, setAccessibleTenants] = useState<string[]>(initialAuth.accessibleTenants)
  const [myShops, setMyShops] = useState<TenantShopResponse[]>([])
  const [selectedTenantUuid, setSelectedTenantUuid] = useState(initialAuth.tenantUuid)
  const [switchingTenant, setSwitchingTenant] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [activeSidebarMenu, setActiveSidebarMenu] = useState('dashboard')
  const [loginDebug, setLoginDebug] = useState('')
  const [tenantLookupNote, setTenantLookupNote] = useState('')
  const [resolvingTenantUuid, setResolvingTenantUuid] = useState(false)
  const [publicView, setPublicView] = useState<PublicView>('login')
  const [onboardSuccessMessage, setOnboardSuccessMessage] = useState('')

  const [loginUsername, setLoginUsername] = useState('admin')
  const [loginPassword, setLoginPassword] = useState('admin123')
  const [loginCompanyName, setLoginCompanyName] = useState(initialAuth.companyName || '')
  const [loginTenantUuid, setLoginTenantUuid] = useState('')
  const [salesCustomerInput, setSalesCustomerInput] = useState('')
  const [onboardForm, setOnboardForm] = useState<PublicOnboardRequest>({
    companyName: '',
    companyCode: '',
    ownerName: '',
    ownerMobile: '',
    ownerEmail: '',
    adminUsername: '',
    adminPassword: '',
    city: '',
    state: '',
  })
  const [tenantDirectory, setTenantDirectory] = useState<TenantDirectoryEntry[]>(() =>
    loadTenantDirectory(),
  )

  const resolvedTenantUuid = useMemo(() => {
    const typedTenantUuid = loginTenantUuid.trim()
    if (typedTenantUuid) {
      return typedTenantUuid
    }

    return findTenantUuidByCompany(tenantDirectory, loginCompanyName)
  }, [loginCompanyName, loginTenantUuid, tenantDirectory])

  async function resolveCompanyTenantUuid(companyName: string) {
    const trimmedCompanyName = companyName.trim()
    if (!trimmedCompanyName) {
      setLoginTenantUuid('')
      setTenantLookupNote('')
      return
    }

    const localMatch = findTenantUuidByCompany(tenantDirectory, trimmedCompanyName)
    if (localMatch) {
      setLoginTenantUuid(localMatch)
      setTenantLookupNote('Tenant ID auto-filled from saved directory.')
      return
    }

    setResolvingTenantUuid(true)
    setTenantLookupNote('Resolving tenant ID from company name...')
    try {
      const fetchedTenantUuid = await api.resolveTenantUuidByCompanyName(trimmedCompanyName)
      if (fetchedTenantUuid && isUuid(fetchedTenantUuid)) {
        setLoginTenantUuid(fetchedTenantUuid)
        setTenantLookupNote('Tenant ID resolved and auto-filled.')
        setTenantDirectory((prev) => {
          const next = upsertTenantDirectory(prev, trimmedCompanyName, fetchedTenantUuid)
          saveTenantDirectory(next)
          return next
        })
      } else {
        setLoginTenantUuid('')
        setTenantLookupNote('Tenant ID could not be resolved. Enter company tenant ID manually.')
      }
    } catch {
      setLoginTenantUuid('')
      setTenantLookupNote('Tenant lookup failed. Enter company tenant ID manually.')
    } finally {
      setResolvingTenantUuid(false)
    }
  }

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
  const [collections, setCollections] = useState<
    {
      uuid: string
      collectionNo: string
      farmerName: string
      collectionDate: string
      quantity: number
      grossAmount: number
    }[]
  >([])
  const [milkTypes, setMilkTypes] = useState<MilkTypeResponse[]>([])
  const [shifts, setShifts] = useState<ShiftResponse[]>([])
  const [rateCategories, setRateCategories] = useState<MasterLookupResponse[]>([])
  const [collectionMethods, setCollectionMethods] = useState<MasterLookupResponse[]>([])
  const [paymentCycles, setPaymentCycles] = useState<MasterLookupResponse[]>([])
  const [farmerRateCharts, setFarmerRateCharts] = useState<MilkRateChartResponse[]>([])
  const [selectedFarmerRateChartUuid, setSelectedFarmerRateChartUuid] = useState('')
  const [farmerMappedFieldError, setFarmerMappedFieldError] = useState('')
  const [milkRateCharts, setMilkRateCharts] = useState<MilkRateChartResponse[]>([])

  const nextProductCode = useMemo(
    () => buildNextProductCode(products.map((item) => item.productCode)),
    [products],
  )

  const nextFarmerCode = useMemo(
    () => buildNextFarmerCode((Array.isArray(farmers) ? farmers : []).map((item) => item.farmerCode)),
    [farmers],
  )

  const averageProductSellingPrice = useMemo(() => {
    if (!products.length) return 0
    return products.reduce((sum, item) => sum + item.sellingPrice, 0) / products.length
  }, [products])

  const currentShop = useMemo(
    () => myShops.find((shop) => shop.uuid === tenantUuid) ?? null,
    [myShops, tenantUuid],
  )

  const [productForm, setProductForm] = useState<{
    productCode: string
    productName: string
    productType: 'RAW_MILK' | 'FINISHED_PRODUCT'
    unitType: 'LITER' | 'KILOGRAM' | 'GRAM' | 'PIECE'
    description: string
    purchasePrice: number
    sellingPrice: number
    minimumStock: number
  }>({
    productCode: '',
    productName: '',
    productType: 'FINISHED_PRODUCT',
    unitType: 'LITER',
    description: '',
    purchasePrice: 0,
    sellingPrice: 0,
    minimumStock: 0,
  })

  const [customerForm, setCustomerForm] = useState({
    branchUuid: initialAuth.branchUuid,
    customerName: '',
    mobileNo: '',
    alternateMobileNo: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNo: '',
    creditLimit: 0,
    openingBalance: 0,
  })

  const [tenantForm, setTenantForm] = useState<CreateTenantRequest>({
    code: '',
    name: '',
  })
  const [editingTenantUuid, setEditingTenantUuid] = useState('')

  const [farmerForm, setFarmerForm] = useState({
    branchUuid: initialAuth.branchUuid,
    farmerCode: nextFarmerCode,
    farmerName: '',
    mobileNo: '',
    alternateMobileNo: '',
    email: '',
    address: '',
    village: '',
    taluka: '',
    district: '',
    state: '',
    pincode: '',
    aadharNo: '',
    panNo: '',
    photoUrl: '',
    remarks: '',
    milkTypeUuid: '',
    milkRateChartUuid: '',
    collectionMethodUuid: '',
    paymentCycleUuid: '',
    rateCategoryUuid: '',
    configEffectiveFrom: toInputDate(new Date()),
  })

  const [collectionForm, setCollectionForm] = useState({
    farmerUuid: '',
    shiftUuid: '',
    milkTypeUuid: '',
    collectionDate: toInputDate(new Date()),
    collectionTime: toInputTime(new Date()),
    quantity: 0,
    rate: 0,
    fat: 0,
    snf: 0,
    mava: 0,
    remarks: '',
  })
  const [selectedCollectionMethod, setSelectedCollectionMethod] = useState<MasterLookupResponse | null>(null)

  const selectedCollectionFarmer = useMemo(
    () => farmers.find((item) => item.uuid === collectionForm.farmerUuid) || null,
    [collectionForm.farmerUuid, farmers],
  )

  const selectedCollectionMilkRateChart = useMemo(() => {
    const chartUuid = selectedCollectionFarmer?.milkRateChartUuid || ''
    if (!chartUuid) return null
    return milkRateCharts.find((item) => item.uuid === chartUuid) || null
  }, [milkRateCharts, selectedCollectionFarmer])

  const collectionQualityVisibility = useMemo(
    () => resolveQualityFieldVisibility(selectedCollectionMethod),
    [selectedCollectionMethod],
  )

  useEffect(() => {
    const decision = explainQualityFieldVisibility(selectedCollectionMethod)
    console.log('[MilkCollections:visibility] hide/show decision', {
      methodUuid: selectedCollectionMethod?.uuid || null,
      methodCode: selectedCollectionMethod?.code || null,
      methodName: selectedCollectionMethod?.name || null,
      reason: decision.reason,
      summary: decision.summary,
      visibility: decision.visibility,
    })
  }, [collectionQualityVisibility, selectedCollectionMethod])

  const activeCollectionQuality = useMemo(() => {
    const metricType = pickCollectionQualityMetric(collectionQualityVisibility)

    if (metricType === 'fat') {
      return { metric: 'fat' as const, value: Number(collectionForm.fat) || 0 }
    }

    if (metricType === 'snf') {
      return { metric: 'snf' as const, value: Number(collectionForm.snf) || 0 }
    }

    if (metricType === 'mava') {
      return { metric: 'mava' as const, value: Number(collectionForm.mava) || 0 }
    }

    const fatValue = Number(collectionForm.fat) || 0
    if (fatValue > 0) {
      return { metric: 'fat' as const, value: fatValue }
    }

    const snfValue = Number(collectionForm.snf) || 0
    if (snfValue > 0) {
      return { metric: 'snf' as const, value: snfValue }
    }

    const mavaValue = Number(collectionForm.mava) || 0
    if (mavaValue > 0) {
      return { metric: 'mava' as const, value: mavaValue }
    }

    return { metric: 'fat' as const, value: 0 }
  }, [collectionForm.fat, collectionForm.mava, collectionForm.snf, collectionQualityVisibility])

  const calculatedCollectionRate = useMemo(() => {
    return roundToTwo(Number(collectionForm.rate) || 0)
  }, [collectionForm.rate])

  const calculatedCollectionAmount = useMemo(() => {
    const quantity = Number(collectionForm.quantity) || 0
    const qualityValue = activeCollectionQuality.value

    if (quantity <= 0 || qualityValue <= 0 || calculatedCollectionRate <= 0) {
      return 0
    }

    return roundToTwo(quantity * qualityValue * calculatedCollectionRate)
  }, [activeCollectionQuality.value, calculatedCollectionRate, collectionForm.quantity])

  const [salesForm, setSalesForm] = useState({
    branchUuid: initialAuth.branchUuid,
    invoiceDate: toInputDate(new Date()),
    customerUuid: '',
    paymentMode: 'CASH' as PaymentMode,
    discountAmount: 0,
    remarks: '',
    items: [{ productUuid: '', quantity: 1, unitPrice: 0 }] as CreateSalesInvoiceItemRequest[],
  })

  const [milkRateForm, setMilkRateForm] = useState<CreateMilkRateChartRequest>({
    branchUuid: initialAuth.branchUuid,
    rateCategoryUuid: '',
    collectionMethodUuid: '',
    chartName: '',
    effectiveFrom: toInputDate(new Date()),
    effectiveTo: '',
    remarks: '',
    details: [
      {
        fatFrom: null,
        fatTo: null,
        snfFrom: null,
        snfTo: null,
        mavaFrom: null,
        mavaTo: null,
        rate: 0,
      },
    ],
  })

  const selectedMilkRateMethod = useMemo(() => {
    const methodUuid = milkRateForm.collectionMethodUuid || ''
    if (!methodUuid) return null
    return collectionMethods.find((item) => item.uuid === methodUuid) || null
  }, [collectionMethods, milkRateForm.collectionMethodUuid])

  const milkRateQualityVisibility = useMemo(
    () => resolveQualityFieldVisibility(selectedMilkRateMethod),
    [selectedMilkRateMethod],
  )

  async function runAction<T>(action: () => Promise<T>, successMessage?: string) {
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const result = await action()
      if (successMessage) {
        setSuccess(successMessage)
      }
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error occurred.')
      return null
    } finally {
      setBusy(false)
    }
  }

  async function loadDashboard() {
    if (!token) return
    const result = await runAction(
      () => api.getSalesDashboard(token, dashboardRange.fromDate, dashboardRange.toDate),
      'Dashboard refreshed.',
    )
    if (result) {
      setDashboard(result)
    }
  }

  async function loadProducts() {
    if (!token) return
    const result = await runAction(() => api.searchProducts(token))
    if (result) {
      setProducts(result.content)
    }
  }

  async function loadCustomers() {
    if (!token) return
    const result = await runAction(() => api.searchCustomers(token))
    if (result) {
      setCustomers(result.content)
    }
  }

  async function loadTenants() {
    if (!token) return
    const result = await runAction(() => api.getTenants(token))
    if (result) {
      setTenants(result)
    }
  }

  async function loadFarmers() {
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
  }

  async function loadCollections() {
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
      setCollections(collectionPage.content)
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
  }

  async function onCollectionFarmerChange(event: ChangeEvent<HTMLSelectElement>) {
    const farmerUuid = event.target.value
    const selectedFarmerOptionLabel = event.target.options[event.target.selectedIndex]?.text || ''
    const startedAt = new Date().toISOString()

    console.groupCollapsed('[MilkCollections:onChange] Farmer change started')
    console.log('timestamp', startedAt)
    console.log('incoming farmerUuid', farmerUuid)
    console.log('selected option label', selectedFarmerOptionLabel)
    console.log('token available', Boolean(token))
    console.log('cached counts before refresh', {
      farmers: farmers.length,
      milkRateCharts: milkRateCharts.length,
      collectionMethods: collectionMethods.length,
    })

    setCollectionForm((prev) => ({ ...prev, farmerUuid, rate: 0 }))
    setSelectedCollectionMethod(null)

    const selectedFarmer = farmers.find((item) => item.uuid === farmerUuid) || null
    console.log('selected farmer from list', selectedFarmer)

    let chartSource = milkRateCharts
    let methodSource = collectionMethods

    if (token && selectedFarmer?.milkRateChartUuid) {
      try {
        console.log('refreshing chart + method masters for farmer chart uuid', selectedFarmer.milkRateChartUuid)
        const [latestChartList, latestMethodList] = await Promise.all([
          api.getMilkRateCharts(token),
          api.getCollectionMethods(token),
        ])
        setMilkRateCharts(latestChartList)
        setCollectionMethods(latestMethodList)
        chartSource = latestChartList
        methodSource = latestMethodList
        console.log('refresh success', {
          milkRateCharts: latestChartList.length,
          collectionMethods: latestMethodList.length,
        })
      } catch (err) {
        console.warn('[MilkCollections:onChange] Unable to refresh milk rate charts.', err)
      }
    } else {
      console.log('refresh skipped', {
        reason: !token ? 'token-not-available' : 'farmer-has-no-milk-rate-chart',
      })
    }

    const selectedMilkRateChart = selectedFarmer?.milkRateChartUuid
      ? chartSource.find((item) => item.uuid === selectedFarmer.milkRateChartUuid) || null
      : null
    const selectedMethodFromChart = selectedMilkRateChart?.collectionMethodUuid
      ? methodSource.find((item) => item.uuid === selectedMilkRateChart.collectionMethodUuid) || null
      : null
    const selectedRateFromDetails = roundToTwo(selectedMilkRateChart?.details[0]?.rate ?? 0)
    const visibilityDecision = explainQualityFieldVisibility(selectedMethodFromChart)
    const resolvedVisibility = visibilityDecision.visibility

    console.log('resolved chain', {
      farmerMilkRateChartUuid: selectedFarmer?.milkRateChartUuid || null,
      selectedMilkRateChartUuid: selectedMilkRateChart?.uuid || null,
      selectedMilkRateChartName: selectedMilkRateChart?.chartName || null,
      selectedCollectionMethodUuid: selectedMilkRateChart?.collectionMethodUuid || null,
      selectedCollectionMethodCode: selectedMethodFromChart?.code || null,
      selectedCollectionMethodName: selectedMethodFromChart?.name || null,
      selectedRateFromDetails,
      visibilityReason: visibilityDecision.reason,
      visibilitySummary: visibilityDecision.summary,
      resolvedVisibility,
    })

    setSelectedCollectionMethod(selectedMethodFromChart)

    setCollectionForm((prev) => ({
      ...prev,
      farmerUuid,
      rate: selectedRateFromDetails,
    }))

    console.log('form update queued', {
      farmerUuid,
      rate: selectedRateFromDetails,
      methodUuid: selectedMethodFromChart?.uuid || null,
      visibility: resolvedVisibility,
    })

    console.log('[MilkCollections:onChange] farmer selection', {
      farmerUuid,
      farmer: selectedFarmer,
      milkRateChart: selectedMilkRateChart,
      method: selectedMethodFromChart,
      selectedRateFromDetails,
    })
    console.groupEnd()
  }

  useEffect(() => {
    setCollectionForm((prev) => {
      let changed = false
      let nextFat = prev.fat
      let nextSnf = prev.snf
      let nextMava = prev.mava

      if (!collectionQualityVisibility.showFat && prev.fat !== 0) {
        nextFat = 0
        changed = true
      }

      if (!collectionQualityVisibility.showSnf && prev.snf !== 0) {
        nextSnf = 0
        changed = true
      }

      if (!collectionQualityVisibility.showMava && prev.mava !== 0) {
        nextMava = 0
        changed = true
      }

      if (!changed) return prev

      return {
        ...prev,
        fat: nextFat,
        snf: nextSnf,
        mava: nextMava,
      }
    })
  }, [collectionQualityVisibility])

  useEffect(() => {
    setMilkRateForm((prev) => {
      const firstDetail = prev.details[0]
      if (!firstDetail) return prev

      let changed = false
      let nextFatFrom = firstDetail.fatFrom
      let nextFatTo = firstDetail.fatTo
      let nextSnfFrom = firstDetail.snfFrom
      let nextSnfTo = firstDetail.snfTo
      let nextMavaFrom = firstDetail.mavaFrom
      let nextMavaTo = firstDetail.mavaTo

      if (!milkRateQualityVisibility.showFat && (firstDetail.fatFrom !== null || firstDetail.fatTo !== null)) {
        nextFatFrom = null
        nextFatTo = null
        changed = true
      }

      if (!milkRateQualityVisibility.showSnf && (firstDetail.snfFrom !== null || firstDetail.snfTo !== null)) {
        nextSnfFrom = null
        nextSnfTo = null
        changed = true
      }

      if (!milkRateQualityVisibility.showMava && (firstDetail.mavaFrom !== null || firstDetail.mavaTo !== null)) {
        nextMavaFrom = null
        nextMavaTo = null
        changed = true
      }

      if (!changed) return prev

      return {
        ...prev,
        details: [
          {
            ...firstDetail,
            fatFrom: nextFatFrom,
            fatTo: nextFatTo,
            snfFrom: nextSnfFrom,
            snfTo: nextSnfTo,
            mavaFrom: nextMavaFrom,
            mavaTo: nextMavaTo,
          },
        ],
      }
    })
  }, [milkRateQualityVisibility])

  async function loadSales() {
    if (!token) return
    const result = await runAction(() => api.searchSales(token))
    if (result) {
      setSales(result.content)
    }
  }

  async function loadMilkRateLookups() {
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
  }

  async function loadFarmerConfigLookups() {
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
  }

  async function loadMyShops() {
    if (!token) return
    const result = await runAction(() => api.getMyShops(token))
    if (result) {
      setMyShops(result)
      const hasCurrent = result.some((shop) => shop.uuid === tenantUuid)
      if (hasCurrent) {
        setSelectedTenantUuid(tenantUuid)
      } else if (result.length > 0) {
        setSelectedTenantUuid(result[0].uuid)
      }
    }
  }

  useEffect(() => {
    if (!token) return
    void loadDashboard()
    void loadProducts()
    void loadCustomers()
    void loadTenants()
    void loadFarmers()
    void loadCollections()
    void loadSales()
  }, [token])

  useEffect(() => {
    if (!token) {
      setMyShops([])
      setSelectedTenantUuid('')
      return
    }

    void loadMyShops()
  }, [token, tenantUuid])

  useEffect(() => {
    if (!token || activeSidebarMenu !== 'milkRateCharts') return
    void loadMilkRateLookups()
  }, [activeSidebarMenu, token])

  useEffect(() => {
    if (!token || activeSidebarMenu !== 'farmers') return
    void loadFarmerConfigLookups()
  }, [activeSidebarMenu, token])

  useEffect(() => {
    if (!selectedFarmerRateChartUuid) {
      setFarmerForm((prev) => ({
        ...prev,
        milkRateChartUuid: '',
        rateCategoryUuid: '',
        collectionMethodUuid: '',
      }))
      return
    }

    const selected = farmerRateCharts.find((item) => item.uuid === selectedFarmerRateChartUuid)
    if (!selected) {
      setFarmerForm((prev) => ({
        ...prev,
        milkRateChartUuid: '',
        rateCategoryUuid: '',
        collectionMethodUuid: '',
      }))
      return
    }

    setFarmerForm((prev) => ({
      ...prev,
      milkRateChartUuid: selected.uuid,
      rateCategoryUuid: selected.rateCategoryUuid,
      collectionMethodUuid: selected.collectionMethodUuid,
    }))
    setFarmerMappedFieldError('')
  }, [farmerRateCharts, selectedFarmerRateChartUuid])

  useEffect(() => {
    if (!Array.isArray(paymentCycles) || paymentCycles.length === 0) return

    const weeklyPaymentCycle = findLookupByLabel(paymentCycles, 'weekly')

    const targetPaymentCycleUuid = weeklyPaymentCycle?.uuid || paymentCycles[0]?.uuid || ''

    if (!targetPaymentCycleUuid) return

    setFarmerForm((prev) => {
      if (prev.paymentCycleUuid) return prev
      return {
        ...prev,
        paymentCycleUuid: targetPaymentCycleUuid,
      }
    })
  }, [paymentCycles])

  useEffect(() => {
    if (farmerForm.milkTypeUuid) return
    if (!Array.isArray(milkTypes) || milkTypes.length === 0) return

    const buffaloMilk = findLookupByLabel(milkTypes, 'buffalo milk')

    if (!buffaloMilk) return

    setFarmerForm((prev) => {
      if (prev.milkTypeUuid) return prev
      return {
        ...prev,
        milkTypeUuid: buffaloMilk.uuid,
      }
    })
  }, [farmerForm.milkTypeUuid, milkTypes])

  useEffect(() => {
    if (collectionForm.milkTypeUuid) return
    if (!Array.isArray(milkTypes) || milkTypes.length === 0) return

    const buffaloMilk = findLookupByLabel(milkTypes, 'buffalo milk')
    const targetMilkTypeUuid = buffaloMilk?.uuid || milkTypes[0]?.uuid || ''

    if (!targetMilkTypeUuid) return

    setCollectionForm((prev) => {
      if (prev.milkTypeUuid) return prev
      return {
        ...prev,
        milkTypeUuid: targetMilkTypeUuid,
      }
    })
  }, [collectionForm.milkTypeUuid, milkTypes])

  useEffect(() => {
    if (collectionForm.shiftUuid) return
    if (!Array.isArray(shifts) || shifts.length === 0) return

    const morningShift = findLookupByLabel(shifts, 'morning')
    const targetShiftUuid = morningShift?.uuid || shifts[0]?.uuid || ''

    if (!targetShiftUuid) return

    setCollectionForm((prev) => {
      if (prev.shiftUuid) return prev
      return {
        ...prev,
        shiftUuid: targetShiftUuid,
      }
    })
  }, [collectionForm.shiftUuid, shifts])

  useEffect(() => {
    setProductForm((prev) => {
      if (prev.productCode === nextProductCode) return prev
      return {
        ...prev,
        productCode: nextProductCode,
      }
    })
  }, [nextProductCode])

  useEffect(() => {
    setFarmerForm((prev) => {
      if (prev.farmerCode === nextFarmerCode) return prev
      return {
        ...prev,
        farmerCode: nextFarmerCode,
      }
    })
  }, [nextFarmerCode])

  useEffect(() => {
    setCustomerForm((prev) => {
      if (prev.branchUuid === branchUuid) return prev
      return {
        ...prev,
        branchUuid,
      }
    })

    setFarmerForm((prev) => {
      if (prev.branchUuid === branchUuid) return prev
      return {
        ...prev,
        branchUuid,
      }
    })

    setSalesForm((prev) => {
      if (prev.branchUuid === branchUuid) return prev
      return {
        ...prev,
        branchUuid,
      }
    })

    setMilkRateForm((prev) => {
      if (prev.branchUuid === branchUuid) return prev
      return {
        ...prev,
        branchUuid,
      }
    })
  }, [branchUuid])

  useEffect(() => {
    const selectedCustomer = customers.find((item) => item.uuid === salesForm.customerUuid)
    if (selectedCustomer) {
      const label = buildCustomerLookupLabel(selectedCustomer)
      setSalesCustomerInput((prev) => (prev === label ? prev : label))
      return
    }

    if (!salesForm.customerUuid) {
      setSalesCustomerInput((prev) => (prev ? '' : prev))
    }
  }, [customers, salesForm.customerUuid])

  function onSalesCustomerInputChange(value: string) {
    setSalesCustomerInput(value)
    const selectedCustomer = resolveCustomerSelection(value, customers)
    setSalesForm((prev) => ({
      ...prev,
      customerUuid: selectedCustomer?.uuid || '',
    }))
  }

  async function onLogin(event: FormEvent) {
    event.preventDefault()
    setLoginDebug('')
    const trimmedUsername = loginUsername.trim()
    const trimmedCompanyName = loginCompanyName.trim()
    const trimmedTenantUuid = loginTenantUuid.trim()
    const mappedTenantUuid = findTenantUuidByCompany(tenantDirectory, trimmedCompanyName)
    let targetTenantUuid = trimmedTenantUuid || mappedTenantUuid
    const isPlatformAdminLogin = /^super\s*-?admin$/i.test(trimmedUsername)

    if (trimmedTenantUuid && !isUuid(trimmedTenantUuid)) {
      setError('Shop tenant ID format is invalid. Please provide a valid tenant ID or leave it empty.')
      return
    }

    if (trimmedCompanyName && !targetTenantUuid) {
      const fetchedTenantUuid = await api.resolveTenantUuidByCompanyName(trimmedCompanyName)
      if (fetchedTenantUuid && isUuid(fetchedTenantUuid)) {
        targetTenantUuid = fetchedTenantUuid
        setLoginTenantUuid(fetchedTenantUuid)
        setTenantLookupNote('Tenant ID resolved and auto-filled.')
        setTenantDirectory((prev) => {
          const next = upsertTenantDirectory(prev, trimmedCompanyName, fetchedTenantUuid)
          saveTenantDirectory(next)
          return next
        })
      }
    }

    if (!trimmedCompanyName && !isPlatformAdminLogin) {
      setError('Company name is required to resolve tenant context.')
      return
    }

    if (trimmedCompanyName && !targetTenantUuid && !isPlatformAdminLogin) {
      setError('Company tenant ID is not resolved. Enter the company tenant ID manually.')
      return
    }

    if (
      targetTenantUuid &&
      accessibleTenants.length > 0 &&
      !accessibleTenants.includes(targetTenantUuid)
    ) {
      setError('You do not have access to this shop. Use one of your accessible shops or leave it empty.')
      return
    }

    const response = await runAction(
      () => api.login(trimmedUsername, loginPassword, targetTenantUuid || undefined),
      'Login successful.',
    )

    const debug = getLastLoginAttemptDebug()
    if (debug) {
      const statusPart = debug.status ? ` [${debug.status}]` : ''
      const messagePart = debug.message ? ` - ${debug.message}` : ''
      setLoginDebug(
        `Auth attempt: ${debug.endpoint} (${debug.bodyMode.toUpperCase()}) ${
          debug.succeeded ? 'succeeded' : 'failed'
        }${statusPart}${messagePart}`,
      )
    }

    if (!response) return

    saveAuth(response)
    setToken(response.accessToken)
    setTenantUuid(response.tenantUuid)
    setDefaultTenantUuid(response.defaultTenantUuid)
    setBranchUuid(response.branchUuid)
    setBranchName(response.branchName)
    setAccessibleTenants(response.accessibleTenants)
    setSelectedTenantUuid(response.tenantUuid)

    const mappedCompanyName = trimmedCompanyName || response.companyName || ''
    if (mappedCompanyName && response.tenantUuid && isUuid(response.tenantUuid)) {
      setTenantDirectory((prev) => {
        const next = upsertTenantDirectory(prev, mappedCompanyName, response.tenantUuid)
        saveTenantDirectory(next)
        return next
      })
      if (!trimmedCompanyName && response.companyName) {
        setLoginCompanyName(response.companyName)
      }
    }
  }

  function updateOnboardForm(field: keyof PublicOnboardRequest, value: string) {
    setOnboardForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function onPublicOnboard(event: FormEvent) {
    event.preventDefault()
    const tenantName = onboardForm.companyName.trim()
    const payload: PublicOnboardRequest = {
      ...onboardForm,
      companyName: tenantName,
      companyCode: onboardForm.companyCode.trim().toUpperCase(),
      ownerName: onboardForm.ownerName.trim(),
      ownerMobile: onboardForm.ownerMobile.trim(),
      ownerEmail: onboardForm.ownerEmail.trim(),
      adminUsername: onboardForm.adminUsername.trim(),
      adminPassword: onboardForm.adminPassword,
      city: onboardForm.city.trim(),
      state: onboardForm.state.trim(),
    }

    if (!payload.companyName || !payload.ownerName || !payload.adminUsername || !payload.adminPassword) {
      setError('Please complete company, owner, and admin credential details.')
      return
    }

    if (payload.adminPassword.length < 8) {
      setError('Admin password must be at least 8 characters long.')
      return
    }

    const result = await runAction(
      () => api.publicOnboard(payload),
      'Company registered successfully. Continue with login.',
    )

    if (!result) return

    if (result.tenantUuid && isUuid(result.tenantUuid)) {
      setTenantDirectory((prev) => {
        const next = upsertTenantDirectory(prev, result.companyName, result.tenantUuid)
        saveTenantDirectory(next)
        return next
      })
      setLoginTenantUuid(result.tenantUuid)
    }

    setLoginCompanyName(result.companyName)
    setLoginUsername(result.adminUsername)
    setOnboardSuccessMessage(result.message)
    setPublicView('login')
  }

  function onLogout() {
    clearAuth()
    setToken('')
    setTenantUuid('')
    setDefaultTenantUuid('')
    setBranchUuid('')
    setBranchName('')
    setAccessibleTenants([])
    setMyShops([])
    setSelectedTenantUuid('')
    setDashboard(null)
    setProducts([])
    setCustomers([])
    setCollections([])
    setSales([])
    setError('')
    setSuccess('')
  }

  async function onSwitchTenant(nextTenantUuid: string) {
    if (!token || !nextTenantUuid || nextTenantUuid === tenantUuid) return

    setSwitchingTenant(true)
    setError('')
    setSuccess('')
    try {
      const response = await api.switchShop(token, nextTenantUuid)
      saveAuth(response)
      setToken(response.accessToken)
      setTenantUuid(response.tenantUuid)
      setDefaultTenantUuid(response.defaultTenantUuid)
      setBranchUuid(response.branchUuid)
      setBranchName(response.branchName)
      setAccessibleTenants(response.accessibleTenants)
      setSelectedTenantUuid(response.tenantUuid)
      setSuccess('Shop switched successfully.')
    } catch (err) {
      setSelectedTenantUuid(tenantUuid)
      setError(err instanceof Error ? err.message : 'Failed to switch shop.')
    } finally {
      setSwitchingTenant(false)
    }
  }

  async function onCreateProduct(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    const created = await runAction(
      () => api.createProduct(token, productForm),
      'Product created successfully.',
    )
    if (!created) return
    setProducts((prev) => [created, ...prev])
    setProductForm({
      productCode: '',
      productName: '',
      productType: 'FINISHED_PRODUCT',
      unitType: 'LITER',
      description: '',
      purchasePrice: 0,
      sellingPrice: 0,
      minimumStock: 0,
    })
  }

  async function onCreateCustomer(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    const created = await runAction(
      () =>
        api.createCustomer(token, {
          ...customerForm,
          branchUuid: branchUuid || customerForm.branchUuid,
        }),
      'Customer created successfully.',
    )
    if (!created) return
    setCustomers((prev) => [created, ...prev])
  }

  async function onSubmitTenant(event: FormEvent) {
    event.preventDefault()
    if (!token) return

    const payload: CreateTenantRequest = {
      code: tenantForm.code.trim(),
      name: tenantForm.name.trim(),
    }

    if (!payload.code || !payload.name) {
      setError('Tenant code and name are required.')
      return
    }

    if (editingTenantUuid) {
      const updated = await runAction(
        () => api.updateTenant(token, editingTenantUuid, payload),
        'Tenant updated successfully.',
      )

      if (!updated) {
        setError('Tenant update endpoint is not available yet on backend (Phase 2).')
        return
      }

      setTenants((prev) => prev.map((item) => (item.uuid === updated.uuid ? updated : item)))
      setEditingTenantUuid('')
      setTenantForm({ code: '', name: '' })
      return
    }

    const created = await runAction(() => api.createTenant(token, payload), 'Tenant created successfully.')
    if (!created) return
    setTenants((prev) => [created, ...prev])
    setTenantForm({ code: '', name: '' })
  }

  function onEditTenant(tenant: TenantResponse) {
    setEditingTenantUuid(tenant.uuid)
    setTenantForm({
      code: tenant.code,
      name: tenant.name,
    })
  }

  function onCancelTenantEdit() {
    setEditingTenantUuid('')
    setTenantForm({ code: '', name: '' })
    setError('')
  }

  async function onCreateFarmer(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setFarmerMappedFieldError('')

    const targetBranchUuid = (branchUuid || farmerForm.branchUuid || '').trim()
    const farmerName = farmerForm.farmerName.trim()
    const village = farmerForm.village.trim()
    const mobileNo = farmerForm.mobileNo.trim()
    const alternateMobileNo = farmerForm.alternateMobileNo.trim()
    const email = farmerForm.email.trim().toLowerCase()
    const pincode = farmerForm.pincode.trim()
    const aadharNo = farmerForm.aadharNo.trim()
    const panNo = farmerForm.panNo.trim().toUpperCase()
    const photoUrl = farmerForm.photoUrl.trim()

    if (!targetBranchUuid || !isUuid(targetBranchUuid)) {
      setError('Valid branch UUID is required for farmer creation.')
      return
    }

    if (!farmerName) {
      setError('Farmer name is required.')
      return
    }

    if (!farmerForm.milkTypeUuid || !isUuid(farmerForm.milkTypeUuid)) {
      setError('Select a valid Milk Type for farmer configuration.')
      return
    }

    if (!farmerForm.paymentCycleUuid.trim()) {
      setError('Select a Payment Cycle for farmer configuration.')
      return
    }

    if (
      !selectedFarmerRateChartUuid ||
      !isUuid(selectedFarmerRateChartUuid) ||
      !farmerForm.milkRateChartUuid ||
      !isUuid(farmerForm.milkRateChartUuid) ||
      !farmerForm.collectionMethodUuid ||
      !isUuid(farmerForm.collectionMethodUuid) ||
      !farmerForm.rateCategoryUuid ||
      !isUuid(farmerForm.rateCategoryUuid)
    ) {
      setFarmerMappedFieldError(
        'Select a valid Rate Category Source so Collection Method and Rate Category can be mapped.',
      )
      return
    }

    if (!farmerForm.configEffectiveFrom.trim()) {
      setError('Configuration effective from date is required.')
      return
    }

    if (!village) {
      setError('Village is required.')
      return
    }

    if (!isTenDigitMobile(mobileNo)) {
      setError('Mobile number must be a valid 10-digit Indian mobile number.')
      return
    }

    if (alternateMobileNo && !isTenDigitMobile(alternateMobileNo)) {
      setError('Alternate mobile number must be a valid 10-digit Indian mobile number.')
      return
    }

    if (alternateMobileNo && alternateMobileNo === mobileNo) {
      setError('Alternate mobile number cannot be same as mobile number.')
      return
    }

    if (email && !isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }

    if (pincode && !isValidPincode(pincode)) {
      setError('Pincode must be exactly 6 digits.')
      return
    }

    if (aadharNo && !isValidAadhar(aadharNo)) {
      setError('Aadhar number must be exactly 12 digits.')
      return
    }

    if (panNo && !isValidPan(panNo)) {
      setError('PAN number must be in format AAAAA9999A.')
      return
    }

    if (photoUrl) {
      try {
        const parsed = new URL(photoUrl)
        if (!/^https?:$/.test(parsed.protocol)) {
          setError('Photo URL must start with http:// or https://.')
          return
        }
      } catch {
        setError('Photo URL is not valid.')
        return
      }
    }

    const created = await runAction(
      () =>
        api.createFarmer(token, {
          ...farmerForm,
          branchUuid: targetBranchUuid,
          farmerName,
          village,
          mobileNo,
          alternateMobileNo,
          email,
          pincode,
          aadharNo,
          panNo,
          photoUrl,
          address: farmerForm.address.trim(),
          taluka: farmerForm.taluka.trim(),
          district: farmerForm.district.trim(),
          state: farmerForm.state.trim(),
          remarks: farmerForm.remarks.trim(),
          milkTypeUuid: farmerForm.milkTypeUuid,
          milkRateChartUuid: farmerForm.milkRateChartUuid,
          collectionMethodUuid: farmerForm.collectionMethodUuid,
          paymentCycleUuid: farmerForm.paymentCycleUuid,
          rateCategoryUuid: farmerForm.rateCategoryUuid,
          configEffectiveFrom: farmerForm.configEffectiveFrom,
        }),
      'Farmer created successfully.',
    )
    if (!created) return
    setFarmers((prev) => [created, ...(Array.isArray(prev) ? prev : [])])
    setFarmerForm({
      branchUuid,
      farmerCode: nextFarmerCode,
      farmerName: '',
      mobileNo: '',
      alternateMobileNo: '',
      email: '',
      address: '',
      village: '',
      taluka: '',
      district: '',
      state: '',
      pincode: '',
      aadharNo: '',
      panNo: '',
      photoUrl: '',
      remarks: '',
      milkTypeUuid: '',
      milkRateChartUuid: '',
      collectionMethodUuid: '',
      paymentCycleUuid: '',
      rateCategoryUuid: '',
      configEffectiveFrom: toInputDate(new Date()),
    })
    setSelectedFarmerRateChartUuid('')

    // Refresh from backend so Milk Collection farmer dropdown stays in sync,
    // then navigate back and preselect the newly created farmer.
    try {
      const [refreshedFarmers, refreshedCharts, refreshedMethods] = await Promise.all([
        api.searchFarmers(token),
        api.getMilkRateCharts(token),
        api.getCollectionMethods(token),
      ])

      const farmerList = Array.isArray(refreshedFarmers)
        ? refreshedFarmers
        : Array.isArray(refreshedFarmers.content)
          ? refreshedFarmers.content
          : []

      setFarmers(farmerList)
      setMilkRateCharts(refreshedCharts)
      setCollectionMethods(refreshedMethods)

      const createdFarmer = farmerList.find((item) => item.uuid === created.uuid) || created
      const selectedChart = createdFarmer.milkRateChartUuid
        ? refreshedCharts.find((chart) => chart.uuid === createdFarmer.milkRateChartUuid) || null
        : null
      const selectedMethod = selectedChart?.collectionMethodUuid
        ? refreshedMethods.find((method) => method.uuid === selectedChart.collectionMethodUuid) || null
        : null
      const selectedRateFromDetails = roundToTwo(selectedChart?.details[0]?.rate ?? 0)

      setSelectedCollectionMethod(selectedMethod)
      setCollectionForm((prev) => ({
        ...prev,
        farmerUuid: createdFarmer.uuid,
        quantity: 0,
        fat: 0,
        snf: 0,
        mava: 0,
        rate: selectedRateFromDetails,
      }))

      setActiveSidebarMenu('milkCollections')
      setActiveTab('milkCollections')
    } catch (err) {
      console.warn('[Farmers:create] Farmer created but refresh failed.', err)

      setActiveSidebarMenu('milkCollections')
      setActiveTab('milkCollections')
      setCollectionForm((prev) => ({
        ...prev,
        farmerUuid: created.uuid,
      }))
    }
  }

  function onOpenFarmerFromCollection() {
    setActiveSidebarMenu('farmers')
    setActiveTab('farmers')
  }

  async function onCreateCollection(event: FormEvent) {
    event.preventDefault()
    if (!token) return

    const created = await runAction(async () => {
      if (!Array.isArray(farmers) || farmers.length === 0) {
        throw new Error('No farmers available. Load master data before saving collection.')
      }

      if (!Array.isArray(shifts) || shifts.length === 0) {
        throw new Error('No shifts are configured. Please configure shifts in master data first.')
      }

      if (!Array.isArray(milkTypes) || milkTypes.length === 0) {
        throw new Error('No milk types are configured. Please configure milk types in master data first.')
      }

      const selectedFarmer = farmers.find((item) => item.uuid === collectionForm.farmerUuid)
      if (!selectedFarmer) {
        throw new Error('Select a valid farmer from the list before saving the collection.')
      }

      const selectedShift = shifts.find((item) => item.uuid === collectionForm.shiftUuid)
      if (!selectedShift) {
        throw new Error('Select a valid shift from the list before saving the collection.')
      }

      const selectedMilkType = milkTypes.find((item) => item.uuid === collectionForm.milkTypeUuid)
      if (!selectedMilkType) {
        throw new Error('Select a valid milk type before saving the collection.')
      }

      const quantity = Number(collectionForm.quantity)
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error('Quantity must be greater than 0 liters.')
      }

      if (!collectionForm.collectionDate.trim()) {
        throw new Error('Collection date is required.')
      }

      if (collectionForm.fat < 0 || collectionForm.snf < 0 || collectionForm.mava < 0) {
        throw new Error('FAT, SNF, and Mava cannot be negative values.')
      }

      const qualityVisibility = resolveQualityFieldVisibility(selectedCollectionMethod)

      const systemCollectionTime = toInputTime(new Date())

      return api.createMilkCollection(token, {
        ...collectionForm,
        farmerUuid: selectedFarmer.uuid,
        shiftUuid: selectedShift.uuid,
        milkTypeUuid: selectedMilkType.uuid,
        collectionTime: systemCollectionTime,
        quantity,
        fat: qualityVisibility.showFat ? collectionForm.fat || null : null,
        snf: qualityVisibility.showSnf ? collectionForm.snf || null : null,
        mava: qualityVisibility.showMava ? collectionForm.mava || null : null,
        remarks: collectionForm.remarks.trim(),
      })
    }, 'Milk collection saved successfully.')

    if (!created) return
    setCollections((prev) => [created, ...prev])
  }

  async function onCreateMilkRateChart(event: FormEvent) {
    event.preventDefault()
    if (!token) return

    const created = await runAction(async () => {
      if (!milkRateForm.branchUuid.trim()) {
        throw new Error('Branch UUID is required for milk rate chart.')
      }

      if (!isUuid(milkRateForm.branchUuid)) {
        throw new Error('Branch UUID format is invalid.')
      }

      if (!milkRateForm.rateCategoryUuid.trim()) {
        throw new Error('Rate category is required.')
      }

      const selectedRateCategory = rateCategories.find(
        (item) => item.uuid === milkRateForm.rateCategoryUuid,
      )
      if (!selectedRateCategory) {
        throw new Error('Select a valid rate category from the list.')
      }

      if (!isUuid(milkRateForm.rateCategoryUuid)) {
        throw new Error('Rate category selection is invalid.')
      }

      if (!milkRateForm.collectionMethodUuid.trim()) {
        throw new Error('Collection method is required.')
      }

      const selectedCollectionMethod = collectionMethods.find(
        (item) => item.uuid === milkRateForm.collectionMethodUuid,
      )
      if (!selectedCollectionMethod) {
        throw new Error('Select a valid collection method from the list.')
      }

      const qualityVisibility = resolveQualityFieldVisibility(selectedCollectionMethod)

      if (!isUuid(milkRateForm.collectionMethodUuid)) {
        throw new Error('Collection method selection is invalid.')
      }

      if (!milkRateForm.chartName.trim()) {
        throw new Error('Chart name is required.')
      }

      if (!milkRateForm.effectiveFrom.trim()) {
        throw new Error('Effective from date is required.')
      }

      if (milkRateForm.effectiveTo.trim() && milkRateForm.effectiveTo < milkRateForm.effectiveFrom) {
        throw new Error('Effective to date cannot be before effective from date.')
      }

      const firstDetail = milkRateForm.details[0]
      if (!firstDetail) {
        throw new Error('At least one rate detail is required.')
      }

      const rate = Number(firstDetail.rate)
      if (!Number.isFinite(rate) || rate <= 0) {
        throw new Error('Rate must be greater than 0.')
      }

      const detailFields = [
        ['FAT From', qualityVisibility.showFat ? firstDetail.fatFrom : null],
        ['FAT To', qualityVisibility.showFat ? firstDetail.fatTo : null],
        ['SNF From', qualityVisibility.showSnf ? firstDetail.snfFrom : null],
        ['SNF To', qualityVisibility.showSnf ? firstDetail.snfTo : null],
        ['Mava From', qualityVisibility.showMava ? firstDetail.mavaFrom : null],
        ['Mava To', qualityVisibility.showMava ? firstDetail.mavaTo : null],
      ] as const

      for (const [label, value] of detailFields) {
        if (value !== null && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
          throw new Error(`${label} must be a non-negative number when provided.`)
        }
      }

      return api.createMilkRateChart(token, {
        ...milkRateForm,
        chartName: milkRateForm.chartName.trim(),
        remarks: milkRateForm.remarks.trim(),
        details: [
          {
            fatFrom: qualityVisibility.showFat ? firstDetail.fatFrom : null,
            fatTo: qualityVisibility.showFat ? firstDetail.fatTo : null,
            snfFrom: qualityVisibility.showSnf ? firstDetail.snfFrom : null,
            snfTo: qualityVisibility.showSnf ? firstDetail.snfTo : null,
            mavaFrom: qualityVisibility.showMava ? firstDetail.mavaFrom : null,
            mavaTo: qualityVisibility.showMava ? firstDetail.mavaTo : null,
            rate,
          },
        ],
      })
    }, 'Milk rate chart saved successfully.')

    if (!created) return

    setMilkRateCharts((prev) => [created, ...prev])
    setMilkRateForm((prev) => ({
      ...prev,
      chartName: '',
      effectiveTo: '',
      remarks: '',
      details: [
        {
          fatFrom: null,
          fatTo: null,
          snfFrom: null,
          snfTo: null,
          mavaFrom: null,
          mavaTo: null,
          rate: 0,
        },
      ],
    }))
  }

  async function onCreateSales(event: FormEvent) {
    event.preventDefault()
    if (!token) return

    const selectedCustomer = resolveCustomerSelection(salesCustomerInput, customers)
    if (!selectedCustomer) {
      setError('Select a valid customer from the list before creating the invoice.')
      return
    }

    const created = await runAction(
      () =>
        api.createSalesInvoice(token, {
          ...salesForm,
          customerUuid: selectedCustomer.uuid,
          branchUuid: branchUuid || salesForm.branchUuid,
          items: salesForm.items.filter((item) => item.productUuid.trim().length > 0),
        }),
      'Sales invoice created successfully.',
    )
    if (!created) return
    setSales((prev) => [created, ...prev])
  }

  function updateSalesItem(index: number, field: keyof CreateSalesInvoiceItemRequest, value: string) {
    setSalesForm((prev) => {
      const items = [...prev.items]
      items[index] = {
        ...items[index],
        [field]: field === 'productUuid' ? value : Number(value),
      }
      return {
        ...prev,
        items,
      }
    })
  }

  function addSalesItemRow() {
    setSalesForm((prev) => ({
      ...prev,
      items: [...prev.items, { productUuid: '', quantity: 1, unitPrice: 0 }],
    }))
  }

  return (
    <div className="app-shell">
      {!token ? (
        <div className="login-page">
          {publicView === 'onboard' ? (
            <div className="login-card onboard-card">
              <section className="login-brand-panel onboard-brand-panel">
                <div className="login-glow" aria-hidden="true" />
                <p className="eyebrow">Smart Dairy ERP</p>
                <h1 className="login-title">Launch Your Company Workspace</h1>
                <p className="subtle">
                  Register once and get your dedicated tenant identity in our shared multi-tenant platform.
                </p>
                <div className="login-points">
                  <p>Automatic tenant provisioning through /api/v1/public/onboard</p>
                  <p>Admin credentials generated for immediate first login</p>
                  <p>Ready-to-use workspace for procurement, sales, and collections</p>
                </div>
              </section>

              <section className="login-form-panel">
                <h2>Register Company</h2>
                <p className="subtle">Create your tenant profile and admin account in one step.</p>

                <form className="form two-col" onSubmit={onPublicOnboard}>
                  <label>
                    Company Name
                    <input
                      value={onboardForm.companyName}
                      onChange={(event) => updateOnboardForm('companyName', event.target.value)}
                      placeholder="Example: Sunrise Dairy Foods"
                      required
                    />
                  </label>

                  <label>
                    Company Code
                    <input
                      value={onboardForm.companyCode}
                      onChange={(event) => updateOnboardForm('companyCode', event.target.value)}
                      placeholder="Example: SRD001"
                      required
                    />
                  </label>

                  <label>
                    Tenant Name
                    <input
                      value={onboardForm.companyName}
                      placeholder="Auto synced with company name"
                      readOnly
                    />
                    <small className="subtle">Tenant name always matches company name.</small>
                  </label>

                  <label>
                    Owner Name
                    <input
                      value={onboardForm.ownerName}
                      onChange={(event) => updateOnboardForm('ownerName', event.target.value)}
                      placeholder="Owner full name"
                      required
                    />
                  </label>

                  <label>
                    Owner Mobile
                    <input
                      value={onboardForm.ownerMobile}
                      onChange={(event) => updateOnboardForm('ownerMobile', event.target.value)}
                      placeholder="10-digit mobile"
                      required
                    />
                  </label>

                  <label>
                    Owner Email
                    <input
                      type="email"
                      value={onboardForm.ownerEmail}
                      onChange={(event) => updateOnboardForm('ownerEmail', event.target.value)}
                      placeholder="owner@company.com"
                      required
                    />
                  </label>

                  <label>
                    Admin Username
                    <input
                      value={onboardForm.adminUsername}
                      onChange={(event) => updateOnboardForm('adminUsername', event.target.value)}
                      placeholder="Admin login username"
                      required
                    />
                  </label>

                  <label>
                    Admin Password
                    <input
                      type="password"
                      value={onboardForm.adminPassword}
                      onChange={(event) => updateOnboardForm('adminPassword', event.target.value)}
                      placeholder="Set initial password"
                      minLength={8}
                      title="Password must be at least 8 characters"
                      required
                    />
                    <small className="subtle">Minimum 8 characters required.</small>
                  </label>

                  <label>
                    City
                    <input
                      value={onboardForm.city}
                      onChange={(event) => updateOnboardForm('city', event.target.value)}
                      placeholder="City"
                      required
                    />
                  </label>

                  <label>
                    State
                    <input
                      value={onboardForm.state}
                      onChange={(event) => updateOnboardForm('state', event.target.value)}
                      placeholder="State"
                      required
                    />
                  </label>

                  <div className="login-actions-row">
                    <button type="submit" disabled={busy} className="login-submit">
                      {busy ? 'Registering...' : 'Create Company Workspace'}
                    </button>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => {
                        setPublicView('login')
                        setOnboardSuccessMessage('')
                      }}
                    >
                      Back to Login
                    </button>
                  </div>
                </form>

                {error && <p className="message error">{error}</p>}
              </section>
            </div>
          ) : (
            <div className="login-card">
              <section className="login-brand-panel">
                <div className="login-glow" aria-hidden="true" />
                <p className="eyebrow">Smart Dairy ERP</p>
                <h1 className="login-title">Operations Workspace</h1>
                <p className="subtle">
                  Unified multi-tenant operations for procurement, production, sales, settlements, and analytics.
                </p>
                <div className="login-points">
                  <p>Tenant-first login for shared database architecture</p>
                  <p>Company-name based tenant resolution workflow</p>
                  <p>JWT session with branch-aware operational controls</p>
                </div>
                <div className="login-pill-row">
                  <span className="login-pill">API: /api/v1/auth/login</span>
                  <span className="login-pill">Header: X-Tenant-Id</span>
                </div>
              </section>

              <section className="login-form-panel">
                <h2>Sign In</h2>
                <p className="subtle">Use your authorized credentials to continue.</p>
                <p className="subtle">Header: X-Tenant-Id</p>
                {onboardSuccessMessage && <p className="message success">{onboardSuccessMessage}</p>}

                <form className="form" onSubmit={onLogin}>
                  <label>
                    Username
                    <input
                      value={loginUsername}
                      onChange={(event) => setLoginUsername(event.target.value)}
                      placeholder="Enter username"
                      required
                    />
                  </label>

                  <label>
                    Password
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      placeholder="Enter password"
                      required
                    />
                  </label>

                  <label>
                    Company name
                    <input
                      value={loginCompanyName}
                      onChange={(event) => {
                        setLoginCompanyName(event.target.value)
                        setLoginTenantUuid('')
                        setTenantLookupNote('')
                      }}
                      onBlur={() => {
                        void resolveCompanyTenantUuid(loginCompanyName)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          void resolveCompanyTenantUuid(loginCompanyName)
                        }
                      }}
                      placeholder="Enter registered company name"
                      list="known-company-names"
                    />
                    {resolvingTenantUuid && <small className="subtle">Resolving tenant context...</small>}
                    {resolvedTenantUuid && <small className="subtle">Tenant context resolved successfully.</small>}
                    {tenantLookupNote && <small className="subtle">{tenantLookupNote}</small>}
                    {tenantDirectory.length > 0 && (
                      <datalist id="known-company-names">
                        {tenantDirectory.map((entry) => (
                          <option key={normalizeCompanyName(entry.companyName)} value={entry.companyName} />
                        ))}
                      </datalist>
                    )}
                  </label>

                  <label>
                    Company Tenant
                    <input
                      value={loginTenantUuid}
                      onChange={(event) => {
                        setLoginTenantUuid(event.target.value)
                        setTenantLookupNote('')
                      }}
                      placeholder="Auto resolved from company name"
                    />
                    <small className="subtle">Auto-filled when available. You can enter tenant ID manually if needed.</small>
                  </label>

                  <button type="submit" disabled={busy} className="login-submit">
                    {busy ? 'Signing in...' : 'Sign in to Workspace'}
                  </button>
                </form>

                <div className="public-auth-links">
                  <button
                    type="button"
                    className="link-btn register-link"
                    onClick={() => {
                      setPublicView('onboard')
                      setOnboardSuccessMessage('')
                    }}
                  >
                    Register your company
                  </button>
                  <button
                    type="button"
                    className="link-btn forgot-link"
                    onClick={() => {
                      setError('')
                      setSuccess(
                        'Forgot password flow is coming soon. Please contact your company administrator for immediate reset.',
                      )
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>

                {error && <p className="message error">{error}</p>}
                {loginDebug && <p className="subtle login-debug">{loginDebug}</p>}
              </section>
            </div>
          )}
        </div>
      ) : (
        <>
          <header className="topbar">
            <div>
              <p className="eyebrow">Smart Dairy ERP</p>
              <h1>Web Console</h1>
            </div>
            <div className="user-box">
              <div className="tenant-box">
                <p className="tenant-label">Shop</p>
                <select
                  value={selectedTenantUuid}
                  onChange={(event) => {
                    const nextTenantUuid = event.target.value
                    setSelectedTenantUuid(nextTenantUuid)
                    void onSwitchTenant(nextTenantUuid)
                  }}
                  disabled={busy || switchingTenant || (myShops.length <= 1 && accessibleTenants.length <= 1)}
                >
                  {myShops.length > 0
                    ? myShops.map((shop) => (
                        <option key={shop.uuid} value={shop.uuid}>
                          {shop.name} ({shop.role})
                          {shop.isPrimary ? ' - Default' : ''}
                        </option>
                      ))
                    : accessibleTenants.map((shopTenantUuid) => (
                        <option key={shopTenantUuid} value={shopTenantUuid}>
                          Mapped Shop
                          {shopTenantUuid === defaultTenantUuid ? ' - Default' : ''}
                        </option>
                      ))}
                </select>
                <div className="tenant-meta">
                  <p className="current-shop-badge">
                    Shop: {currentShop ? currentShop.name : 'Mapped Shop'}
                  </p>
                  <p className="current-shop-badge">
                    Branch: {branchName || 'Current Branch'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={onLogout}>
                Logout
              </button>
            </div>
          </header>

          {error && <p className="message error">{error}</p>}
          {success && <p className="message success">{success}</p>}

          <div className="workspace-shell">
            <aside className="left-sidebar">
              <p className="sidebar-title">Modules</p>
              {SIDEBAR_GROUPS.map((group) => (
                <section className="sidebar-group" key={group.title}>
                  <p className="sidebar-group-title">{group.title}</p>
                  {group.items.map((key) => {
                    const isUiTab = key in TAB_LABELS
                    const label = isUiTab ? TAB_LABELS[key as TabKey] : key

                    return (
                      <button
                        type="button"
                        key={key}
                        className={activeSidebarMenu === key ? 'menu-btn active' : 'menu-btn'}
                        onClick={() => {
                          setActiveSidebarMenu(key)
                          if (isUiTab) {
                            setActiveTab(key as TabKey)
                          }
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </section>
              ))}
            </aside>

            <main className="panel-grid">
              {activeTab === 'dashboard' && activeSidebarMenu === 'dashboard' && (
              <section className="panel">
                <div className="panel-head">
                  <h2>Sales Dashboard</h2>
                  <button type="button" onClick={loadDashboard} disabled={busy}>
                    Refresh
                  </button>
                </div>

                <form
                  className="form inline"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void loadDashboard()
                  }}
                >
                  <label>
                    From
                    <input
                      type="date"
                      value={dashboardRange.fromDate}
                      onChange={(event) =>
                        setDashboardRange((prev) => ({ ...prev, fromDate: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    To
                    <input
                      type="date"
                      value={dashboardRange.toDate}
                      onChange={(event) =>
                        setDashboardRange((prev) => ({ ...prev, toDate: event.target.value }))
                      }
                    />
                  </label>
                  <button type="submit" disabled={busy}>
                    Apply
                  </button>
                </form>

                <div className="kpi-grid">
                  <article>
                    <p>Total invoices</p>
                    <strong>{dashboard?.totalInvoices ?? 0}</strong>
                  </article>
                  <article>
                    <p>Total sales</p>
                    <strong>{dashboard?.totalSales ?? 0}</strong>
                  </article>
                  <article>
                    <p>Net sales</p>
                    <strong>{dashboard?.netSales ?? 0}</strong>
                  </article>
                  <article>
                    <p>Avg invoice</p>
                    <strong>{dashboard?.averageInvoiceValue ?? 0}</strong>
                  </article>
                </div>
              </section>
            )}

              {activeTab === 'products' && activeSidebarMenu === 'products' && (
              <section className="panel panel-product">
                <div className="panel-head">
                  <h2>Products</h2>
                  <button type="button" onClick={loadProducts} disabled={busy}>
                    Reload
                  </button>
                </div>

                <div className="product-layout">
                  <form className="form two-col product-form" onSubmit={onCreateProduct}>
                    <div className="product-form-head">
                      <p className="eyebrow">Product Master</p>
                      <h3>Create Product</h3>
                      <p className="subtle">Product code is generated automatically and increments by 1.</p>
                    </div>

                    <label>
                      Product code
                      <input required value={productForm.productCode} readOnly />
                    </label>
                    <label>
                      Product name
                      <input
                        required
                        value={productForm.productName}
                        onChange={(event) =>
                          setProductForm((prev) => ({ ...prev, productName: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      Product type
                      <select
                        value={productForm.productType}
                        onChange={(event) =>
                          setProductForm((prev) => ({
                            ...prev,
                            productType: event.target.value as 'RAW_MILK' | 'FINISHED_PRODUCT',
                          }))
                        }
                      >
                        <option value="RAW_MILK">RAW_MILK</option>
                        <option value="FINISHED_PRODUCT">FINISHED_PRODUCT</option>
                      </select>
                    </label>
                    <label>
                      Unit type
                      <select
                        value={productForm.unitType}
                        onChange={(event) =>
                          setProductForm((prev) => ({
                            ...prev,
                            unitType: event.target.value as 'LITER' | 'KILOGRAM' | 'GRAM' | 'PIECE',
                          }))
                        }
                      >
                        <option value="LITER">LITER</option>
                        <option value="KILOGRAM">KILOGRAM</option>
                        <option value="GRAM">GRAM</option>
                        <option value="PIECE">PIECE</option>
                      </select>
                    </label>
                    <label>
                      Purchase price
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.purchasePrice}
                        onChange={(event) =>
                          setProductForm((prev) => ({ ...prev, purchasePrice: Number(event.target.value) }))
                        }
                      />
                    </label>
                    <label>
                      Selling price
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.sellingPrice}
                        onChange={(event) =>
                          setProductForm((prev) => ({ ...prev, sellingPrice: Number(event.target.value) }))
                        }
                      />
                    </label>
                    <label>
                      Minimum stock
                      <input
                        type="number"
                        step="0.001"
                        value={productForm.minimumStock}
                        onChange={(event) =>
                          setProductForm((prev) => ({ ...prev, minimumStock: Number(event.target.value) }))
                        }
                      />
                    </label>
                    <label className="product-field-wide">
                      Description
                      <input
                        value={productForm.description}
                        onChange={(event) =>
                          setProductForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                      />
                    </label>
                    <button type="submit" disabled={busy} className="product-submit">
                      {busy ? 'Creating...' : 'Create product'}
                    </button>
                  </form>

                  <aside className="product-summary" aria-label="Product quick summary">
                    <h3>Inventory Snapshot</h3>
                    <div className="product-summary-grid">
                      <article>
                        <p>Total products</p>
                        <strong>{products.length}</strong>
                      </article>
                      <article>
                        <p>Average selling</p>
                        <strong>{averageProductSellingPrice.toFixed(2)}</strong>
                      </article>
                      <article>
                        <p>Next code</p>
                        <strong>{nextProductCode}</strong>
                      </article>
                    </div>
                  </aside>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Selling</th>
                        <th>Stock min</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((item) => (
                        <tr key={item.uuid}>
                          <td>{item.productCode}</td>
                          <td>{item.productName}</td>
                          <td>{item.productType}</td>
                          <td>{item.sellingPrice}</td>
                          <td>{item.minimumStock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

              {activeTab === 'customers' && activeSidebarMenu === 'customers' && (
              <section className="panel">
                <div className="panel-head">
                  <h2>Customers</h2>
                  <button type="button" onClick={loadCustomers} disabled={busy}>
                    Reload
                  </button>
                </div>

                <form className="form two-col" onSubmit={onCreateCustomer}>
                  <label>
                    Branch
                    <input
                      required
                      value={branchName || branchUuid || customerForm.branchUuid}
                      readOnly
                    />
                  </label>
                  <label>
                    Customer name
                    <input
                      required
                      value={customerForm.customerName}
                      onChange={(event) =>
                        setCustomerForm((prev) => ({ ...prev, customerName: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Mobile
                    <input
                      required
                      value={customerForm.mobileNo}
                      onChange={(event) =>
                        setCustomerForm((prev) => ({ ...prev, mobileNo: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    City
                    <input
                      value={customerForm.city}
                      onChange={(event) =>
                        setCustomerForm((prev) => ({ ...prev, city: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Credit limit
                    <input
                      type="number"
                      step="0.01"
                      value={customerForm.creditLimit}
                      onChange={(event) =>
                        setCustomerForm((prev) => ({ ...prev, creditLimit: Number(event.target.value) }))
                      }
                    />
                  </label>
                  <label>
                    Opening balance
                    <input
                      type="number"
                      step="0.01"
                      value={customerForm.openingBalance}
                      onChange={(event) =>
                        setCustomerForm((prev) => ({ ...prev, openingBalance: Number(event.target.value) }))
                      }
                    />
                  </label>
                  <button type="submit" disabled={busy}>
                    Create customer
                  </button>
                </form>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Mobile</th>
                        <th>City</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((item) => (
                        <tr key={item.uuid}>
                          <td>{item.customerCode}</td>
                          <td>{item.customerName}</td>
                          <td>{item.mobileNo}</td>
                          <td>{item.city ?? '-'}</td>
                          <td>{item.currentBalance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

              {activeTab === 'milkCollections' && activeSidebarMenu === 'milkCollections' && (
              <section className="panel panel-collection">
                <div className="panel-head">
                  <h2>Milk Collections</h2>
                  <button type="button" onClick={loadCollections} disabled={busy}>
                    Reload
                  </button>
                </div>
                <div className="collection-layout">
                  <form className="collection-form" onSubmit={onCreateCollection}>
                    <div className="collection-form-head">
                      <p className="eyebrow">Collection Entry</p>
                      <h3>Capture Daily Milk Procurement</h3>
                      <p className="subtle">
                        Record farmer, shift, milk quality, and collection timing in one structured entry.
                      </p>
                    </div>

                    <div className="collection-grid">
                      <div className="collection-farmer-row collection-field-wide">
                        <label className="collection-field">
                          <span>Farmer</span>
                          <select
                            required
                            value={collectionForm.farmerUuid}
                            onChange={onCollectionFarmerChange}
                          >
                            <option value="">Select farmer</option>
                            {farmers.map((farmer) => (
                              <option key={farmer.uuid} value={farmer.uuid}>
                                {farmer.farmerName} ({farmer.farmerCode || farmer.mobileNo || 'Farmer'})
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          className="collection-new-farmer-btn"
                          onClick={onOpenFarmerFromCollection}
                        >
                          + New Farmer
                        </button>
                      </div>

                      <div className="collection-meta-row collection-field-wide">
                        <label className="collection-field">
                          <span>Collection Date</span>
                          <input
                            required
                            type="date"
                            value={collectionForm.collectionDate}
                            onChange={(event) =>
                              setCollectionForm((prev) => ({ ...prev, collectionDate: event.target.value }))
                            }
                          />
                        </label>

                        <label className="collection-field">
                          <span>Shift</span>
                          <select
                            required
                            value={collectionForm.shiftUuid}
                            onChange={(event) =>
                              setCollectionForm((prev) => ({ ...prev, shiftUuid: event.target.value }))
                            }
                          >
                            <option value="">Select shift</option>
                            {shifts.map((shift) => (
                              <option key={shift.uuid} value={shift.uuid}>
                                {shift.name} ({shift.code || 'Shift'})
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="collection-field">
                          <span>Milk Type</span>
                          <select
                            required
                            value={collectionForm.milkTypeUuid}
                            onChange={(event) =>
                              setCollectionForm((prev) => ({ ...prev, milkTypeUuid: event.target.value }))
                            }
                          >
                            <option value="">Select milk type</option>
                            {milkTypes.map((item) => (
                              <option key={item.uuid} value={item.uuid}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="collection-metric-row collection-field-wide">
                        <label className="collection-field collection-field-compact">
                          <span>Quantity (Liters)</span>
                          <input
                            required
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={collectionForm.quantity}
                            onChange={(event) =>
                              setCollectionForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))
                            }
                          />
                        </label>

                        {collectionQualityVisibility.showFat && (
                          <label className="collection-field collection-field-compact">
                            <span>FAT</span>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={collectionForm.fat}
                              onChange={(event) =>
                                setCollectionForm((prev) => ({ ...prev, fat: Number(event.target.value) }))
                              }
                              placeholder="Optional"
                            />
                          </label>
                        )}

                        {collectionQualityVisibility.showSnf && (
                          <label className="collection-field collection-field-compact">
                            <span>SNF</span>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={collectionForm.snf}
                              onChange={(event) =>
                                setCollectionForm((prev) => ({ ...prev, snf: Number(event.target.value) }))
                              }
                              placeholder="Optional"
                            />
                          </label>
                        )}

                        {collectionQualityVisibility.showMava && (
                          <label className="collection-field collection-field-compact">
                            <span>Mava</span>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={collectionForm.mava}
                              onChange={(event) =>
                                setCollectionForm((prev) => ({ ...prev, mava: Number(event.target.value) }))
                              }
                              placeholder="Optional"
                            />
                          </label>
                        )}

                        <label className="collection-field collection-field-compact">
                          <span>Rate</span>
                          <input type="number" step="0.01" value={calculatedCollectionRate} disabled />
                        </label>

                        <label className="collection-field collection-field-compact">
                          <span>Amount</span>
                          <input type="number" step="0.01" value={calculatedCollectionAmount} disabled />
                        </label>
                      </div>

                      

                      <label className="collection-field collection-field-wide">
                        <span>Remarks</span>
                        <input
                          value={collectionForm.remarks}
                          onChange={(event) =>
                            setCollectionForm((prev) => ({ ...prev, remarks: event.target.value }))
                          }
                          placeholder="Quality notes, can condition, route remarks, etc."
                        />
                      </label>
                    </div>
                    <button type="submit" disabled={busy} className="collection-submit">
                      {busy ? 'Saving...' : 'Save Collection'}
                    </button>
                  </form>

                  <aside className="collection-summary">
                    <h3>Collection Snapshot</h3>
                    <div className="collection-summary-grid">
                      <article>
                        <p>Farmer</p>
                        <strong>{selectedCollectionFarmer?.farmerName || '-'}</strong>
                      </article>
                      <article>
                        <p>Milk Type</p>
                        <strong>
                          {milkTypes.find((item) => item.uuid === collectionForm.milkTypeUuid)?.name || '-'}
                        </strong>
                      </article>
                      <article>
                        <p>Shift</p>
                        <strong>{shifts.find((item) => item.uuid === collectionForm.shiftUuid)?.name || '-'}</strong>
                      </article>
                      <article>
                        <p>Rate Chart</p>
                        <strong>
                          {selectedCollectionMilkRateChart
                            ? `${selectedCollectionMilkRateChart.chartName}`
                            : selectedCollectionFarmer?.milkRateChartUuid || '-'}
                        </strong>
                      </article>
                      <article>
                        <p>Collection Method</p>
                        <strong>{selectedCollectionMethod?.name || '-'}</strong>
                      </article>
                      <article>
                        <p>Schedule</p>
                        <strong>{collectionForm.collectionDate || '-'}</strong>
                      </article>
                      <article>
                        <p>Quantity</p>
                        <strong>{collectionForm.quantity ? `${collectionForm.quantity} L` : '-'}</strong>
                      </article>
                      <article>
                        <p>Rate</p>
                        <strong>{calculatedCollectionRate > 0 ? calculatedCollectionRate : '-'}</strong>
                      </article>
                      <article>
                        <p>Amount</p>
                        <strong>{calculatedCollectionAmount > 0 ? calculatedCollectionAmount : '-'}</strong>
                      </article>
                      <article>
                        <p>Quality</p>
                        <strong>
                          FAT {collectionForm.fat || 0} | SNF {collectionForm.snf || 0}
                        </strong>
                      </article>
                    </div>
                    <div className="collection-note-box">
                      <p className="eyebrow">Checklist</p>
                      <p>Confirm farmer, shift, milk type, and quantity before saving.</p>
                    </div>
                  </aside>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Collection No</th>
                        <th>Farmer</th>
                        <th>Date</th>
                        <th>Qty</th>
                        <th>Gross</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collections.map((item) => (
                        <tr key={item.uuid}>
                          <td>{item.collectionNo}</td>
                          <td>{item.farmerName}</td>
                          <td>{item.collectionDate}</td>
                          <td>{item.quantity}</td>
                          <td>{item.grossAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

              {activeSidebarMenu === 'milkRateCharts' && (
              <section className="panel panel-milk-rate">
                <div className="panel-head">
                  <h2>Milk Rate Charts</h2>
                </div>

                <div className="milk-rate-layout">
                  <form className="milk-rate-form" onSubmit={onCreateMilkRateChart}>
                    <div className="milk-rate-form-head">
                      <p className="eyebrow">Rate Configuration</p>
                      <h3>Create Milk Rate Chart</h3>
                      <p className="subtle">Select names from masters, define quality slab, and save effective chart.</p>
                    </div>

                    <div className="milk-rate-grid">
                      <label className="milk-rate-field milk-rate-field-wide">
                        <span>Branch</span>
                        <input value={branchName || currentShop?.name || milkRateForm.branchUuid} readOnly />
                        <small className="subtle">Mapped from active shop context.</small>
                      </label>

                      <label className="milk-rate-field">
                        <span>Rate Category</span>
                        <select
                          required
                          value={milkRateForm.rateCategoryUuid}
                          onChange={(event) =>
                            setMilkRateForm((prev) => ({ ...prev, rateCategoryUuid: event.target.value }))
                          }
                        >
                          <option value="">Select rate category</option>
                          {rateCategories.map((item) => (
                            <option key={item.uuid} value={item.uuid}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="milk-rate-field">
                        <span>Collection Method</span>
                        <select
                          required
                          value={milkRateForm.collectionMethodUuid}
                          onChange={(event) =>
                            setMilkRateForm((prev) => ({ ...prev, collectionMethodUuid: event.target.value }))
                          }
                        >
                          <option value="">Select collection method</option>
                          {collectionMethods.map((item) => (
                            <option key={item.uuid} value={item.uuid}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="milk-rate-field">
                        <span>Chart Name</span>
                        <input
                          required
                          value={milkRateForm.chartName}
                          onChange={(event) =>
                            setMilkRateForm((prev) => ({ ...prev, chartName: event.target.value }))
                          }
                          placeholder="Example: Morning Fat-SNF Standard"
                        />
                      </label>

                      <label className="milk-rate-field">
                        <span>Effective From</span>
                        <input
                          required
                          type="date"
                          value={milkRateForm.effectiveFrom}
                          onChange={(event) =>
                            setMilkRateForm((prev) => ({ ...prev, effectiveFrom: event.target.value }))
                          }
                        />
                      </label>

                      <label className="milk-rate-field">
                        <span>Effective To</span>
                        <input
                          type="date"
                          value={milkRateForm.effectiveTo}
                          onChange={(event) =>
                            setMilkRateForm((prev) => ({ ...prev, effectiveTo: event.target.value }))
                          }
                        />
                      </label>

                      <label className="milk-rate-field">
                        <span>Rate</span>
                        <input
                          required
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={milkRateForm.details[0]?.rate ?? 0}
                          onChange={(event) =>
                            setMilkRateForm((prev) => ({
                              ...prev,
                              details: [
                                {
                                  ...(prev.details[0] || {
                                    fatFrom: null,
                                    fatTo: null,
                                    snfFrom: null,
                                    snfTo: null,
                                    mavaFrom: null,
                                    mavaTo: null,
                                    rate: 0,
                                  }),
                                  rate: Number(event.target.value),
                                },
                              ],
                            }))
                          }
                        />
                      </label>
                    </div>

                    <div className="milk-rate-slab">
                      <div className="milk-rate-slab-head">
                        <h4>Quality Slab</h4>
                        <p>Enter a from/to range for each quality parameter.</p>
                      </div>

                      {milkRateQualityVisibility.showFat && (
                        <div className="milk-rate-detail-row">
                          <label>FAT</label>
                          <div className="milk-rate-range">
                            <input
                              id="milk-rate-fat-from"
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="From"
                              value={milkRateForm.details[0]?.fatFrom ?? ''}
                              onChange={(event) =>
                                setMilkRateForm((prev) => ({
                                  ...prev,
                                  details: [
                                    {
                                      ...(prev.details[0] || {
                                        fatFrom: null,
                                        fatTo: null,
                                        snfFrom: null,
                                        snfTo: null,
                                        mavaFrom: null,
                                        mavaTo: null,
                                        rate: 0,
                                      }),
                                      fatFrom: event.target.value === '' ? null : Number(event.target.value),
                                    },
                                  ],
                                }))
                              }
                            />
                            <input
                              id="milk-rate-fat-to"
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="To"
                              value={milkRateForm.details[0]?.fatTo ?? ''}
                              onChange={(event) =>
                                setMilkRateForm((prev) => ({
                                  ...prev,
                                  details: [
                                    {
                                      ...(prev.details[0] || {
                                        fatFrom: null,
                                        fatTo: null,
                                        snfFrom: null,
                                        snfTo: null,
                                        mavaFrom: null,
                                        mavaTo: null,
                                        rate: 0,
                                      }),
                                      fatTo: event.target.value === '' ? null : Number(event.target.value),
                                    },
                                  ],
                                }))
                              }
                            />
                          </div>
                        </div>
                      )}

                      {milkRateQualityVisibility.showSnf && (
                        <div className="milk-rate-detail-row">
                          <label>SNF</label>
                          <div className="milk-rate-range">
                            <input
                              id="milk-rate-snf-from"
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="From"
                              value={milkRateForm.details[0]?.snfFrom ?? ''}
                              onChange={(event) =>
                                setMilkRateForm((prev) => ({
                                  ...prev,
                                  details: [
                                    {
                                      ...(prev.details[0] || {
                                        fatFrom: null,
                                        fatTo: null,
                                        snfFrom: null,
                                        snfTo: null,
                                        mavaFrom: null,
                                        mavaTo: null,
                                        rate: 0,
                                      }),
                                      snfFrom: event.target.value === '' ? null : Number(event.target.value),
                                    },
                                  ],
                                }))
                              }
                            />
                            <input
                              id="milk-rate-snf-to"
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="To"
                              value={milkRateForm.details[0]?.snfTo ?? ''}
                              onChange={(event) =>
                                setMilkRateForm((prev) => ({
                                  ...prev,
                                  details: [
                                    {
                                      ...(prev.details[0] || {
                                        fatFrom: null,
                                        fatTo: null,
                                        snfFrom: null,
                                        snfTo: null,
                                        mavaFrom: null,
                                        mavaTo: null,
                                        rate: 0,
                                      }),
                                      snfTo: event.target.value === '' ? null : Number(event.target.value),
                                    },
                                  ],
                                }))
                              }
                            />
                          </div>
                        </div>
                      )}

                      {milkRateQualityVisibility.showMava && (
                        <div className="milk-rate-detail-row">
                          <label>Mava</label>
                          <div className="milk-rate-range">
                            <input
                              id="milk-rate-mava-from"
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="From"
                              value={milkRateForm.details[0]?.mavaFrom ?? ''}
                              onChange={(event) =>
                                setMilkRateForm((prev) => ({
                                  ...prev,
                                  details: [
                                    {
                                      ...(prev.details[0] || {
                                        fatFrom: null,
                                        fatTo: null,
                                        snfFrom: null,
                                        snfTo: null,
                                        mavaFrom: null,
                                        mavaTo: null,
                                        rate: 0,
                                      }),
                                      mavaFrom: event.target.value === '' ? null : Number(event.target.value),
                                    },
                                  ],
                                }))
                              }
                            />
                            <input
                              id="milk-rate-mava-to"
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="To"
                              value={milkRateForm.details[0]?.mavaTo ?? ''}
                              onChange={(event) =>
                                setMilkRateForm((prev) => ({
                                  ...prev,
                                  details: [
                                    {
                                      ...(prev.details[0] || {
                                        fatFrom: null,
                                        fatTo: null,
                                        snfFrom: null,
                                        snfTo: null,
                                        mavaFrom: null,
                                        mavaTo: null,
                                        rate: 0,
                                      }),
                                      mavaTo: event.target.value === '' ? null : Number(event.target.value),
                                    },
                                  ],
                                }))
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <label className="milk-rate-field milk-rate-field-wide">
                      <span>Remarks</span>
                      <input
                        value={milkRateForm.remarks}
                        onChange={(event) =>
                          setMilkRateForm((prev) => ({ ...prev, remarks: event.target.value }))
                        }
                        placeholder="Optional operational notes"
                      />
                    </label>

                    <button type="submit" disabled={busy} className="milk-rate-submit">
                      {busy ? 'Saving...' : 'Save Milk Rate Chart'}
                    </button>
                  </form>

                  <aside className="milk-rate-summary" aria-label="Milk rate quick summary">
                    <h3>Selection Snapshot</h3>
                    <div className="milk-rate-summary-grid">
                      <article>
                        <p>Branch</p>
                        <strong>{branchName || currentShop?.name || '-'}</strong>
                      </article>
                      <article>
                        <p>Rate Category</p>
                        <strong>
                          {rateCategories.find((item) => item.uuid === milkRateForm.rateCategoryUuid)?.name || '-'}
                        </strong>
                      </article>
                      <article>
                        <p>Collection Method</p>
                        <strong>
                          {collectionMethods.find((item) => item.uuid === milkRateForm.collectionMethodUuid)?.name ||
                            '-'}
                        </strong>
                      </article>
                      <article>
                        <p>Effective Date</p>
                        <strong>{milkRateForm.effectiveFrom || '-'}</strong>
                      </article>
                    </div>
                  </aside>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Chart Name</th>
                        <th>Effective From</th>
                        <th>Effective To</th>
                        <th>Rate Category</th>
                        <th>Collection Method</th>
                        <th>Details</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {milkRateCharts.map((item) => (
                        <tr key={item.uuid}>
                          <td>{item.chartName}</td>
                          <td>{item.effectiveFrom}</td>
                          <td>{item.effectiveTo || '-'}</td>
                          <td>{rateCategories.find((rateCategory) => rateCategory.uuid === item.rateCategoryUuid)?.name || '-'}</td>
                          <td>{collectionMethods.find((collectionMethod) => collectionMethod.uuid === item.collectionMethodUuid)?.name || '-'}</td>
                          <td>{item.details.length}</td>
                          <td>{item.active ? 'ACTIVE' : 'INACTIVE'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

              {activeTab === 'sales' && activeSidebarMenu === 'sales' && (
              <section className="panel">
                <div className="panel-head">
                  <h2>Sales Invoices</h2>
                  <button type="button" onClick={loadSales} disabled={busy}>
                    Reload
                  </button>
                </div>

                <form className="form two-col" onSubmit={onCreateSales}>
                  <label>
                    Branch
                    <input
                      required
                      value={branchName || branchUuid || salesForm.branchUuid}
                      readOnly
                    />
                  </label>
                  <label>
                    Invoice date
                    <input
                      type="date"
                      value={salesForm.invoiceDate}
                      onChange={(event) =>
                        setSalesForm((prev) => ({ ...prev, invoiceDate: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Customer
                    <input
                      value={salesCustomerInput}
                      onChange={(event) => onSalesCustomerInputChange(event.target.value)}
                      onBlur={(event) => onSalesCustomerInputChange(event.target.value)}
                      placeholder="Search by customer name or code"
                      list="sales-customers"
                    />
                    <datalist id="sales-customers">
                      {customers.map((customer) => (
                        <option key={customer.uuid} value={buildCustomerLookupLabel(customer)} />
                      ))}
                    </datalist>
                  </label>

                  <label>
                    Payment mode
                    <select
                      value={salesForm.paymentMode}
                      onChange={(event) =>
                        setSalesForm((prev) => ({ ...prev, paymentMode: event.target.value as PaymentMode }))
                      }
                    >
                      {PAYMENT_MODES.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Discount
                    <input
                      type="number"
                      step="0.01"
                      value={salesForm.discountAmount}
                      onChange={(event) =>
                        setSalesForm((prev) => ({ ...prev, discountAmount: Number(event.target.value) }))
                      }
                    />
                  </label>
                  <label>
                    Remarks
                    <input
                      value={salesForm.remarks}
                      onChange={(event) =>
                        setSalesForm((prev) => ({ ...prev, remarks: event.target.value }))
                      }
                    />
                  </label>

                  <div className="items-box">
                    <div className="items-head">
                      <h3>Invoice Items</h3>
                      <button type="button" onClick={addSalesItemRow}>
                        Add row
                      </button>
                    </div>
                    {salesForm.items.map((item, index) => (
                      <div key={`${item.productUuid}-${index}`} className="item-row">
                        <select
                          value={item.productUuid}
                          onChange={(event) => updateSalesItem(index, 'productUuid', event.target.value)}
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product.uuid} value={product.uuid}>
                              {product.productName}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          step="0.001"
                          value={item.quantity}
                          onChange={(event) => updateSalesItem(index, 'quantity', event.target.value)}
                          placeholder="Qty"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(event) => updateSalesItem(index, 'unitPrice', event.target.value)}
                          placeholder="Unit price"
                        />
                      </div>
                    ))}
                  </div>

                  <button type="submit" disabled={busy}>
                    Create invoice
                  </button>
                </form>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Net Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((item) => (
                        <tr key={item.uuid}>
                          <td>{item.invoiceNo}</td>
                          <td>{item.invoiceDate}</td>
                          <td>{item.customerName}</td>
                          <td>{item.status}</td>
                          <td>{item.netAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

              {activeTab === 'farmers' && activeSidebarMenu === 'farmers' && (
              <section className="panel panel-farmer">
                <div className="panel-head">
                  <h2>Farmers</h2>
                  <button type="button" onClick={loadFarmers} disabled={busy}>
                    Reload
                  </button>
                </div>
                <div className="farmer-layout">
                  <form className="farmer-form" onSubmit={onCreateFarmer}>
                    <div className="farmer-form-head">
                      <p className="eyebrow">Farmer Master</p>
                      <h3>Create Farmer</h3>                    
                    </div>

                    <div className="farmer-grid">
                      <div className="farmer-grid-group farmer-field-wide">
                        <div className="farmer-grid-title">Identity & Contact</div>
                        <div className="farmer-grid-cols farmer-grid-cols-identity">
                          <label className="farmer-field">
                            <span>Farmer Code</span>
                            <input required value={farmerForm.farmerCode} readOnly />
                          </label>
                          <label className="farmer-field">
                            <span>Farmer Name</span>
                            <input
                              required
                              value={farmerForm.farmerName}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, farmerName: event.target.value }))
                              }
                            />
                          </label>
                        </div>

                        <div className="farmer-grid-cols farmer-grid-cols-contact">
                          <label className="farmer-field farmer-field-numeric farmer-field-phone">
                            <span>Mobile</span>
                            <input
                              required
                              inputMode="numeric"
                              maxLength={10}
                              value={farmerForm.mobileNo}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, mobileNo: event.target.value }))
                              }
                            />
                          </label>
                          <label className="farmer-field farmer-field-numeric farmer-field-phone">
                            <span>Alternate Mobile</span>
                            <input
                              inputMode="numeric"
                              maxLength={10}
                              value={farmerForm.alternateMobileNo}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, alternateMobileNo: event.target.value }))
                              }
                            />
                          </label>

                          <label className="farmer-field">
                            <span>Email</span>
                            <input
                              value={farmerForm.email}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, email: event.target.value }))
                              }
                            />
                          </label>
                        </div>
                      </div>

                      <div className="farmer-grid-group farmer-field-wide">
                        <div className="farmer-grid-title">Location</div>
                        <div className="farmer-grid-cols farmer-grid-cols-three">
                          <label className="farmer-field">
                            <span>Village</span>
                            <input
                              required
                              value={farmerForm.village}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, village: event.target.value }))
                              }
                            />
                          </label>
                          <label className="farmer-field">
                            <span>Taluka</span>
                            <input
                              value={farmerForm.taluka}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, taluka: event.target.value }))
                              }
                            />
                          </label>
                          <label className="farmer-field">
                            <span>District</span>
                            <input
                              value={farmerForm.district}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, district: event.target.value }))
                              }
                            />
                          </label>
                        </div>
                        <div className="farmer-grid-cols farmer-grid-cols-two">
                          <label className="farmer-field">
                            <span>State</span>
                            <input
                              value={farmerForm.state}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, state: event.target.value }))
                              }
                            />
                          </label>
                          <label className="farmer-field farmer-field-numeric">
                            <span>Pincode</span>
                            <input
                              inputMode="numeric"
                              maxLength={6}
                              value={farmerForm.pincode}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, pincode: event.target.value }))
                              }
                            />
                          </label>
                          <label className="farmer-field farmer-field-wide-col">
                            <span>Address</span>
                            <input
                              value={farmerForm.address}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, address: event.target.value }))
                              }
                            />
                          </label>
                        </div>
                        <div className="farmer-grid-cols farmer-grid-cols-two">
                          <label className="farmer-field farmer-field-numeric">
                            <span>Aadhar No</span>
                            <input
                              inputMode="numeric"
                              maxLength={12}
                              value={farmerForm.aadharNo}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, aadharNo: event.target.value }))
                              }
                            />
                          </label>
                          <label className="farmer-field">
                            <span>PAN No</span>
                            <input
                              maxLength={10}
                              value={farmerForm.panNo}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, panNo: event.target.value }))
                              }
                            />
                          </label>
                        </div>
                        <div className="farmer-grid-cols farmer-grid-cols-two">
                          <label className="farmer-field">
                            <span>Photo URL</span>
                            <input
                              value={farmerForm.photoUrl}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, photoUrl: event.target.value }))
                              }
                            />
                          </label>

                          <label className="farmer-field">
                            <span>Remarks</span>
                            <input
                              value={farmerForm.remarks}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, remarks: event.target.value }))
                              }
                            />
                          </label>
                        </div>
                      </div>

                      <div className="farmer-grid-group farmer-field-wide">
                        <div className="farmer-grid-title">Configuration (Required)</div>
                        <div className="farmer-grid-cols farmer-grid-cols-three">
                          <label className="farmer-field farmer-field-wide-col">
                            <span>Milk Rate Chart</span>
                            <select
                              required
                              value={selectedFarmerRateChartUuid}
                              onChange={(event) => {
                                setFarmerMappedFieldError('')
                                setSelectedFarmerRateChartUuid(event.target.value)
                              }}
                            >
                              <option value="">Select chart from the list</option>
                              {farmerRateCharts.map((item) => (
                                <option key={item.uuid} value={item.uuid}>
                                  Chart: {item.chartName} | Chart UUID: {item.uuid}
                                </option>
                              ))}
                            </select>
                            {farmerMappedFieldError && (
                              <p className="field-error farmer-mapped-field-error">{farmerMappedFieldError}</p>
                            )}
                          </label>

                          <label className="farmer-field">
                            <span>Milk Type</span>
                            <select
                              required
                              value={farmerForm.milkTypeUuid}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, milkTypeUuid: event.target.value }))
                              }
                            >
                              <option value="">Select milk type</option>
                              {milkTypes.map((item) => (
                                <option key={item.uuid} value={item.uuid}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="farmer-field">
                            <span>Payment Cycle</span>
                            <select
                              required
                              value={farmerForm.paymentCycleUuid}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, paymentCycleUuid: event.target.value }))
                              }
                            >
                              <option value="">Select payment cycle</option>
                              {paymentCycles.map((item) => (
                                <option key={item.uuid} value={item.uuid}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="farmer-field">
                            <span>Config Effective From</span>
                            <input
                              required
                              type="date"
                              value={farmerForm.configEffectiveFrom}
                              onChange={(event) =>
                                setFarmerForm((prev) => ({ ...prev, configEffectiveFrom: event.target.value }))
                              }
                            />
                          </label>
                        </div>
                      </div>

                    </div>
                    <button type="submit" disabled={busy} className="farmer-submit">
                      {busy ? 'Creating...' : 'Create farmer'}
                    </button>
                  </form>
                </div>

                <div className="table-wrap farmer-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Mobile</th>
                        <th>Branch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmers.map((item) => (
                        <tr key={item.uuid}>
                          <td>{item.farmerCode}</td>
                          <td>{item.farmerName}</td>
                          <td>{item.mobileNo || '-'}</td>
                          <td>{item.branchUuid === branchUuid ? branchName || 'Current Branch' : 'Mapped Branch'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

              {activeTab === 'tenants' && activeSidebarMenu === 'tenants' && (
              <section className="panel">
                <div className="panel-head">
                  <h2>Tenants</h2>
                  <button type="button" onClick={loadTenants} disabled={busy}>
                    Reload
                  </button>
                </div>

                <form className="form two-col" onSubmit={onSubmitTenant}>
                  <label>
                    Tenant code
                    <input
                      required
                      value={tenantForm.code}
                      onChange={(event) =>
                        setTenantForm((prev) => ({ ...prev, code: event.target.value }))
                      }
                      placeholder="e.g. ABC-001"
                    />
                  </label>

                  <label>
                    Tenant name
                    <input
                      required
                      value={tenantForm.name}
                      onChange={(event) =>
                        setTenantForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                      placeholder="e.g. ABC Dairy Pvt Ltd"
                    />
                  </label>

                  <button type="submit" disabled={busy}>
                    {editingTenantUuid ? 'Save tenant' : 'Create tenant'}
                  </button>

                  {editingTenantUuid && (
                    <button type="button" onClick={onCancelTenantEdit} disabled={busy}>
                      Cancel edit
                    </button>
                  )}
                </form>

                {editingTenantUuid && (
                  <p className="subtle">
                    Backend edit endpoint is Phase 2. UI is ready and will activate once PUT endpoint is enabled.
                  </p>
                )}

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((item) => (
                        <tr key={item.uuid}>
                          <td>{item.code}</td>
                          <td>{item.name}</td>
                          <td>{item.active ? 'ACTIVE' : 'INACTIVE'}</td>
                          <td>{item.createdAt?.slice(0, 10) || '-'}</td>
                          <td>
                            <button type="button" onClick={() => onEditTenant(item)} disabled={busy}>
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
            </main>
          </div>

          <footer className="footer-note">
            API base URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}
          </footer>
        </>
      )}
    </div>
  )
}

export default App
