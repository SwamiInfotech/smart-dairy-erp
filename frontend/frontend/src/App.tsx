import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  BACKEND_MODULES,
  api,
  clearAuth,
  getLastLoginAttemptDebug,
  getSavedAuth,
  saveAuth,
} from './lib/api'
import type {
  CreateTenantRequest,
  CreateSalesInvoiceItemRequest,
  CustomerResponse,
  MilkTypeResponse,
  PaymentMode,
  ProductResponse,
  PublicOnboardRequest,
  SalesDashboardResponse,
  SalesInvoiceResponse,
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

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
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
      setTenantLookupNote('Tenant UUID auto-filled from saved directory.')
      return
    }

    setResolvingTenantUuid(true)
    setTenantLookupNote('Resolving tenant UUID from company name...')
    try {
      const fetchedTenantUuid = await api.resolveTenantUuidByCompanyName(trimmedCompanyName)
      if (fetchedTenantUuid && isUuid(fetchedTenantUuid)) {
        setLoginTenantUuid(fetchedTenantUuid)
        setTenantLookupNote('Tenant UUID resolved and auto-filled.')
        setTenantDirectory((prev) => {
          const next = upsertTenantDirectory(prev, trimmedCompanyName, fetchedTenantUuid)
          saveTenantDirectory(next)
          return next
        })
      } else {
        setLoginTenantUuid('')
        setTenantLookupNote('Tenant UUID could not be resolved. Enter company tenant UUID manually.')
      }
    } catch {
      setLoginTenantUuid('')
      setTenantLookupNote('Tenant lookup failed. Enter company tenant UUID manually.')
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
  const [farmers, setFarmers] = useState<
    {
      uuid: string
      branchUuid: string
      farmerCode: string
      farmerName: string
      mobileNo: string
    }[]
  >([])
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
  })

  const [collectionForm, setCollectionForm] = useState({
    farmerUuid: '',
    shiftUuid: '',
    milkTypeUuid: '',
    collectionDate: toInputDate(new Date()),
    collectionTime: '07:00',
    quantity: 0,
    fat: 0,
    snf: 0,
    mava: 0,
    remarks: '',
  })

  const [salesForm, setSalesForm] = useState({
    branchUuid: initialAuth.branchUuid,
    invoiceDate: toInputDate(new Date()),
    customerUuid: '',
    paymentMode: 'CASH' as PaymentMode,
    discountAmount: 0,
    remarks: '',
    items: [{ productUuid: '', quantity: 1, unitPrice: 0 }] as CreateSalesInvoiceItemRequest[],
  })

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
    const [collectionPage, types] = await Promise.all([
      runAction(() => api.searchMilkCollections(token)),
      runAction(() => api.getMilkTypes(token)),
    ])

    if (collectionPage) {
      setCollections(collectionPage.content)
    }
    if (types) {
      setMilkTypes(types)
    }
  }

  async function loadSales() {
    if (!token) return
    const result = await runAction(() => api.searchSales(token))
    if (result) {
      setSales(result.content)
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
  }, [branchUuid])

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
      setError('Shop UUID format is invalid. Please provide a valid UUID or leave it empty.')
      return
    }

    if (trimmedCompanyName && !targetTenantUuid) {
      const fetchedTenantUuid = await api.resolveTenantUuidByCompanyName(trimmedCompanyName)
      if (fetchedTenantUuid && isUuid(fetchedTenantUuid)) {
        targetTenantUuid = fetchedTenantUuid
        setLoginTenantUuid(fetchedTenantUuid)
        setTenantLookupNote('Tenant UUID resolved and auto-filled.')
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
      setError('Company tenant UUID is not resolved. Enter the company tenant UUID manually.')
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
    const created = await runAction(
      () =>
        api.createFarmer(token, {
          ...farmerForm,
          branchUuid: branchUuid || farmerForm.branchUuid,
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
    })
  }

  async function onCreateCollection(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    const created = await runAction(
      () =>
        api.createMilkCollection(token, {
          ...collectionForm,
          fat: collectionForm.fat || null,
          snf: collectionForm.snf || null,
          mava: collectionForm.mava || null,
        }),
      'Milk collection saved successfully.',
    )
    if (!created) return
    setCollections((prev) => [created, ...prev])
  }

  async function onCreateSales(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    const created = await runAction(
      () =>
        api.createSalesInvoice(token, {
          ...salesForm,
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
                    Company Tenant UUID
                    <input
                      value={loginTenantUuid}
                      onChange={(event) => {
                        setLoginTenantUuid(event.target.value)
                        setTenantLookupNote('')
                      }}
                      placeholder="Auto resolved from company name"
                    />
                    <small className="subtle">Auto-filled when available. You can enter it manually if needed.</small>
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
                          {shopTenantUuid}
                          {shopTenantUuid === defaultTenantUuid ? ' - Default' : ''}
                        </option>
                      ))}
                </select>
                <div className="tenant-meta">
                  <p className="current-shop-badge">
                    Shop: {currentShop ? currentShop.name : tenantUuid || '-'}
                  </p>
                  <p className="current-shop-badge">
                    Branch: {branchName || branchUuid || '-'}
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
                    const backendModule = key in BACKEND_MODULES ? BACKEND_MODULES[key] : null
                    const isUiTab = key in TAB_LABELS
                    const label = isUiTab
                      ? TAB_LABELS[key as TabKey]
                      : backendModule?.label || key

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
              <section className="panel endpoint-panel">
                <div className="panel-head">
                  <h2>
                    Endpoint Map ·{' '}
                    {activeSidebarMenu in TAB_LABELS
                      ? TAB_LABELS[activeSidebarMenu as TabKey]
                      : BACKEND_MODULES[activeSidebarMenu]?.label || activeSidebarMenu}
                  </h2>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Method</th>
                        <th>Path</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeSidebarMenu in BACKEND_MODULES
                        ? BACKEND_MODULES[activeSidebarMenu].endpoints
                        : activeSidebarMenu in TAB_LABELS
                          ? (() => {
                              const tabToModule: Record<TabKey, keyof typeof BACKEND_MODULES> = {
                                dashboard: 'sales',
                                products: 'products',
                                customers: 'customers',
                                milkCollections: 'milkCollections',
                                sales: 'sales',
                                farmers: 'farmers',
                                tenants: 'tenants',
                              }
                              return BACKEND_MODULES[tabToModule[activeSidebarMenu as TabKey]].endpoints
                            })()
                          : [])
                        .map((endpoint, index) => (
                          <tr key={`${endpoint.method}-${endpoint.path}-${index}`}>
                            <td>{endpoint.method}</td>
                            <td>{endpoint.path}</td>
                            <td>{endpoint.note ?? '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {activeTab === 'dashboard' && (
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

              {activeTab === 'products' && (
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

              {activeTab === 'customers' && (
              <section className="panel">
                <div className="panel-head">
                  <h2>Customers</h2>
                  <button type="button" onClick={loadCustomers} disabled={busy}>
                    Reload
                  </button>
                </div>

                <form className="form two-col" onSubmit={onCreateCustomer}>
                  <label>
                    Branch UUID
                    <input
                      required
                      value={branchUuid || customerForm.branchUuid}
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

              {activeTab === 'milkCollections' && (
              <section className="panel">
                <div className="panel-head">
                  <h2>Milk Collections</h2>
                  <button type="button" onClick={loadCollections} disabled={busy}>
                    Reload
                  </button>
                </div>
                <form className="form two-col" onSubmit={onCreateCollection}>
                  <label>
                    Farmer UUID
                    <input
                      required
                      value={collectionForm.farmerUuid}
                      onChange={(event) =>
                        setCollectionForm((prev) => ({ ...prev, farmerUuid: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Shift UUID
                    <input
                      required
                      value={collectionForm.shiftUuid}
                      onChange={(event) =>
                        setCollectionForm((prev) => ({ ...prev, shiftUuid: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Milk type
                    <select
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
                  <label>
                    Collection date
                    <input
                      type="date"
                      value={collectionForm.collectionDate}
                      onChange={(event) =>
                        setCollectionForm((prev) => ({ ...prev, collectionDate: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Collection time
                    <input
                      type="time"
                      value={collectionForm.collectionTime}
                      onChange={(event) =>
                        setCollectionForm((prev) => ({ ...prev, collectionTime: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Quantity
                    <input
                      type="number"
                      step="0.01"
                      value={collectionForm.quantity}
                      onChange={(event) =>
                        setCollectionForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))
                      }
                    />
                  </label>
                  <button type="submit" disabled={busy}>
                    Save collection
                  </button>
                </form>

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

              {activeTab === 'sales' && (
              <section className="panel">
                <div className="panel-head">
                  <h2>Sales Invoices</h2>
                  <button type="button" onClick={loadSales} disabled={busy}>
                    Reload
                  </button>
                </div>

                <form className="form two-col" onSubmit={onCreateSales}>
                  <label>
                    Branch UUID
                    <input
                      required
                      value={branchUuid || salesForm.branchUuid}
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
                    <select
                      value={salesForm.customerUuid}
                      onChange={(event) =>
                        setSalesForm((prev) => ({ ...prev, customerUuid: event.target.value }))
                      }
                    >
                      <option value="">Select customer</option>
                      {customers.map((item) => (
                        <option key={item.uuid} value={item.uuid}>
                          {item.customerName}
                        </option>
                      ))}
                    </select>
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

              {activeTab === 'farmers' && (
              <section className="panel panel-farmer">
                <div className="panel-head">
                  <h2>Farmers</h2>
                  <button type="button" onClick={loadFarmers} disabled={busy}>
                    Reload
                  </button>
                </div>
                <div className="farmer-layout">
                  <form className="form two-col farmer-form" onSubmit={onCreateFarmer}>
                    <div className="farmer-form-head">
                      <p className="eyebrow">Farmer Master</p>
                      <h3>Create Farmer</h3>
                      <p className="subtle">Farmer code is auto-generated and increments by 1.</p>
                    </div>

                    <label>
                      Farmer code
                      <input required value={farmerForm.farmerCode} readOnly />
                    </label>
                    <label>
                      Farmer name
                      <input
                        required
                        value={farmerForm.farmerName}
                        onChange={(event) =>
                          setFarmerForm((prev) => ({ ...prev, farmerName: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      Mobile
                      <input
                        value={farmerForm.mobileNo}
                        onChange={(event) =>
                          setFarmerForm((prev) => ({ ...prev, mobileNo: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      Alternate mobile
                      <input
                        value={farmerForm.alternateMobileNo}
                        onChange={(event) =>
                          setFarmerForm((prev) => ({ ...prev, alternateMobileNo: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      Email
                      <input
                        value={farmerForm.email}
                        onChange={(event) =>
                          setFarmerForm((prev) => ({ ...prev, email: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      Village
                      <input
                        required
                        value={farmerForm.village}
                        onChange={(event) =>
                          setFarmerForm((prev) => ({ ...prev, village: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      Taluka
                      <input
                        value={farmerForm.taluka}
                        onChange={(event) =>
                          setFarmerForm((prev) => ({ ...prev, taluka: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      District
                      <input
                        value={farmerForm.district}
                        onChange={(event) =>
                          setFarmerForm((prev) => ({ ...prev, district: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      State
                      <input
                        value={farmerForm.state}
                        onChange={(event) =>
                          setFarmerForm((prev) => ({ ...prev, state: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      Pincode
                      <input
                        value={farmerForm.pincode}
                        onChange={(event) =>
                          setFarmerForm((prev) => ({ ...prev, pincode: event.target.value }))
                        }
                      />
                    </label>
                    <label className="farmer-field-wide">
                      Address
                      <input
                        value={farmerForm.address}
                        onChange={(event) =>
                          setFarmerForm((prev) => ({ ...prev, address: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      Aadhar No
                      <input
                        value={farmerForm.aadharNo}
                        onChange={(event) =>
                          setFarmerForm((prev) => ({ ...prev, aadharNo: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      PAN No
                      <input
                        value={farmerForm.panNo}
                        onChange={(event) =>
                          setFarmerForm((prev) => ({ ...prev, panNo: event.target.value }))
                        }
                      />
                    </label>
                    <label className="farmer-field-wide">
                      Photo URL
                      <input
                        value={farmerForm.photoUrl}
                        onChange={(event) =>
                          setFarmerForm((prev) => ({ ...prev, photoUrl: event.target.value }))
                        }
                      />
                    </label>
                    <label className="farmer-field-wide">
                      Remarks
                      <input
                        value={farmerForm.remarks}
                        onChange={(event) =>
                          setFarmerForm((prev) => ({ ...prev, remarks: event.target.value }))
                        }
                      />
                    </label>
                    <button type="submit" disabled={busy} className="farmer-submit">
                      {busy ? 'Creating...' : 'Create farmer'}
                    </button>
                  </form>

                  <aside className="farmer-summary" aria-label="Farmer quick summary">
                    <h3>Farmer Snapshot</h3>
                    <div className="farmer-summary-grid">
                      <article>
                        <p>Total farmers</p>
                        <strong>{farmers.length}</strong>
                      </article>
                      <article>
                        <p>Next code</p>
                        <strong>{nextFarmerCode}</strong>
                      </article>
                      <article>
                        <p>Branch assignment</p>
                        <strong>Handled by backend</strong>
                      </article>
                    </div>
                  </aside>
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
                          <td>{item.branchUuid || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

              {activeTab === 'tenants' && (
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
