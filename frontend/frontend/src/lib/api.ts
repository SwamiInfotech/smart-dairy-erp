import type {
  ApiResponse,
  AuthTokenResponse,
  CreateTenantRequest,
  CreateCustomerRequest,
  CreateFarmerRequest,
  CreateMilkCollectionRequest,
  CreateProductRequest,
  CreateSalesInvoiceRequest,
  CustomerResponse,
  FarmerResponse,
  MilkTypeResponse,
  PageResult,
  ProductResponse,
  PublicOnboardRequest,
  PublicOnboardResponse,
  SalesDashboardResponse,
  SalesInvoiceResponse,
  TenantResponse,
  TenantShopResponse,
  UpdateTenantRequest,
} from '../types/api'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString().trim() || 'http://localhost:8081'

const TOKEN_KEY = 'smart_dairy_token'
const USERNAME_KEY = 'smart_dairy_username'
const ROLE_KEY = 'smart_dairy_role'
const TENANT_UUID_KEY = 'smart_dairy_tenant_uuid'
const DEFAULT_TENANT_UUID_KEY = 'smart_dairy_default_tenant_uuid'
const COMPANY_UUID_KEY = 'smart_dairy_company_uuid'
const COMPANY_NAME_KEY = 'smart_dairy_company_name'
const BRANCH_UUID_KEY = 'smart_dairy_branch_uuid'
const BRANCH_NAME_KEY = 'smart_dairy_branch_name'
const ACCESSIBLE_TENANTS_KEY = 'smart_dairy_accessible_tenants'

export type EndpointDefinition = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  note?: string
}

export type BackendModuleDefinition = {
  label: string
  endpoints: EndpointDefinition[]
}

export const BACKEND_MODULES: Record<string, BackendModuleDefinition> = {
  health: {
    label: 'Health',
    endpoints: [{ method: 'GET', path: '/api/v1/health' }],
  },
  auth: {
    label: 'Auth',
    endpoints: [
      { method: 'POST', path: '/api/v1/auth/login' },
      { method: 'GET', path: '/api/v1/auth/users', note: 'Admin scope' },
      { method: 'POST', path: '/api/v1/auth/users', note: 'Admin scope' },
    ],
  },
  tenants: {
    label: 'Tenants',
    endpoints: [
      { method: 'GET', path: '/api/v1/tenants' },
      { method: 'POST', path: '/api/v1/tenants' },
      { method: 'GET', path: '/api/v1/tenants/{tenantUuid}' },
      { method: 'PUT', path: '/api/v1/tenants/{tenantUuid}', note: 'Phase 2 backend support' },
    ],
  },
  companies: {
    label: 'Companies',
    endpoints: [
      { method: 'GET', path: '/api/v1/companies' },
      { method: 'POST', path: '/api/v1/companies' },
      { method: 'PUT', path: '/api/v1/companies/{uuid}' },
      { method: 'DELETE', path: '/api/v1/companies/{uuid}' },
    ],
  },
  branches: {
    label: 'Branches',
    endpoints: [
      { method: 'GET', path: '/api/v1/branches' },
      { method: 'POST', path: '/api/v1/branches' },
      { method: 'PUT', path: '/api/v1/branches/{uuid}' },
      { method: 'DELETE', path: '/api/v1/branches/{uuid}' },
    ],
  },
  farmers: {
    label: 'Farmers',
    endpoints: [
      { method: 'GET', path: '/api/v1/farmers' },
      { method: 'POST', path: '/api/v1/farmers' },
      { method: 'PUT', path: '/api/v1/farmers/{uuid}' },
      { method: 'DELETE', path: '/api/v1/farmers/{uuid}' },
    ],
  },
  farmerConfigurations: {
    label: 'Farmer Configurations',
    endpoints: [
      { method: 'GET', path: '/api/v1/farmer-configurations' },
      { method: 'POST', path: '/api/v1/farmer-configurations' },
      { method: 'PUT', path: '/api/v1/farmer-configurations/{uuid}' },
      { method: 'DELETE', path: '/api/v1/farmer-configurations/{uuid}' },
    ],
  },
  milkCollections: {
    label: 'Milk Collections',
    endpoints: [
      { method: 'GET', path: '/api/v1/milk-collections' },
      { method: 'POST', path: '/api/v1/milk-collections' },
      { method: 'PUT', path: '/api/v1/milk-collections/{uuid}' },
      { method: 'DELETE', path: '/api/v1/milk-collections/{uuid}' },
    ],
  },
  productionBatches: {
    label: 'Production Batches',
    endpoints: [
      { method: 'GET', path: '/api/v1/production-batches' },
      { method: 'POST', path: '/api/v1/production-batches' },
      { method: 'PUT', path: '/api/v1/production-batches/{uuid}' },
      { method: 'DELETE', path: '/api/v1/production-batches/{uuid}' },
    ],
  },
  inventory: {
    label: 'Inventory',
    endpoints: [
      { method: 'GET', path: '/api/v1/inventory' },
      { method: 'POST', path: '/api/v1/inventory' },
      { method: 'PUT', path: '/api/v1/inventory/{uuid}' },
      { method: 'DELETE', path: '/api/v1/inventory/{uuid}' },
    ],
  },
  products: {
    label: 'Products',
    endpoints: [
      { method: 'GET', path: '/api/v1/products' },
      { method: 'POST', path: '/api/v1/products' },
      { method: 'PUT', path: '/api/v1/products/{uuid}' },
      { method: 'DELETE', path: '/api/v1/products/{uuid}' },
    ],
  },
  customers: {
    label: 'Customers',
    endpoints: [
      { method: 'GET', path: '/api/v1/customers' },
      { method: 'POST', path: '/api/v1/customers' },
      { method: 'PUT', path: '/api/v1/customers/{uuid}' },
      { method: 'DELETE', path: '/api/v1/customers/{uuid}' },
      { method: 'GET', path: '/api/v1/customer-payments' },
      { method: 'POST', path: '/api/v1/customer-payments' },
    ],
  },
  sales: {
    label: 'Sales',
    endpoints: [
      { method: 'GET', path: '/api/v1/sales' },
      { method: 'POST', path: '/api/v1/sales' },
      { method: 'GET', path: '/api/v1/sales/dashboard' },
      { method: 'PUT', path: '/api/v1/sales/{uuid}' },
      { method: 'DELETE', path: '/api/v1/sales/{uuid}' },
    ],
  },
  loans: {
    label: 'Loans',
    endpoints: [
      { method: 'GET', path: '/api/v1/loans' },
      { method: 'POST', path: '/api/v1/loans' },
      { method: 'PUT', path: '/api/v1/loans/{uuid}' },
      { method: 'DELETE', path: '/api/v1/loans/{uuid}' },
    ],
  },
  settlements: {
    label: 'Settlements',
    endpoints: [
      { method: 'GET', path: '/api/v1/settlements' },
      { method: 'POST', path: '/api/v1/settlements' },
      { method: 'PUT', path: '/api/v1/settlements/{uuid}' },
      { method: 'DELETE', path: '/api/v1/settlements/{uuid}' },
    ],
  },
  payments: {
    label: 'Payments',
    endpoints: [
      { method: 'GET', path: '/api/v1/payments' },
      { method: 'POST', path: '/api/v1/payments' },
      { method: 'PUT', path: '/api/v1/payments/{uuid}' },
      { method: 'DELETE', path: '/api/v1/payments/{uuid}' },
    ],
  },
  reports: {
    label: 'Reports',
    endpoints: [
      { method: 'GET', path: '/api/v1/reports' },
      { method: 'GET', path: '/api/v1/reports/daily-sales' },
      { method: 'GET', path: '/api/v1/reports/daily-milk-collection' },
      { method: 'GET', path: '/api/v1/reports/settlement-summary' },
    ],
  },
  master: {
    label: 'Master',
    endpoints: [
      { method: 'GET', path: '/api/v1/master/milk-types' },
      { method: 'GET', path: '/api/v1/master/collection-methods' },
      { method: 'GET', path: '/api/v1/master/payment-cycles' },
      { method: 'GET', path: '/api/v1/master/shifts' },
    ],
  },
  collectionMethods: {
    label: 'Collection Methods',
    endpoints: [
      { method: 'GET', path: '/api/v1/collection-methods' },
      { method: 'POST', path: '/api/v1/collection-methods' },
    ],
  },
  paymentCycles: {
    label: 'Payment Cycles',
    endpoints: [
      { method: 'GET', path: '/api/v1/payment-cycles' },
      { method: 'POST', path: '/api/v1/payment-cycles' },
    ],
  },
  pricing: {
    label: 'Pricing',
    endpoints: [
      { method: 'GET', path: '/api/v1/pricing' },
      { method: 'POST', path: '/api/v1/pricing' },
    ],
  },
  rateProfiles: {
    label: 'Rate Profiles',
    endpoints: [
      { method: 'GET', path: '/api/v1/rate-profiles' },
      { method: 'POST', path: '/api/v1/rate-profiles' },
    ],
  },
  milkRateCharts: {
    label: 'Milk Rate Charts',
    endpoints: [
      { method: 'GET', path: '/api/v1/milk-rate-charts' },
      { method: 'POST', path: '/api/v1/milk-rate-charts' },
      { method: 'PUT', path: '/api/v1/milk-rate-charts/{uuid}' },
      { method: 'DELETE', path: '/api/v1/milk-rate-charts/{uuid}' },
    ],
  },
  shifts: {
    label: 'Shifts',
    endpoints: [
      { method: 'GET', path: '/api/v1/shifts' },
      { method: 'POST', path: '/api/v1/shifts' },
    ],
  },
}

type QueryValue = string | number | boolean | undefined | null
type BodyMode = 'json' | 'form'

export type LoginAttemptDebug = {
  endpoint: string
  bodyMode: BodyMode
  succeeded: boolean
  status: number
  message: string
}

type RequestOptions = {
  query?: Record<string, QueryValue>
  bodyMode?: BodyMode
  skipAuthHeader?: boolean
  tenantUuid?: string
}

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let lastLoginAttemptDebug: LoginAttemptDebug | null = null

export function getLastLoginAttemptDebug() {
  return lastLoginAttemptDebug
}

function isWrappedApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<ApiResponse<T>>
  return (
    typeof candidate.success === 'boolean' &&
    typeof candidate.message === 'string' &&
    'data' in candidate
  )
}

function toQueryString(query?: Record<string, QueryValue>) {
  const params = new URLSearchParams()

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value))
      }
    })
  }

  const asString = params.toString()
  return asString ? `?${asString}` : ''
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '')
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function readString(record: Record<string, unknown> | null, ...keys: string[]) {
  if (!record) return ''

  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function readNumber(record: Record<string, unknown> | null, ...keys: string[]) {
  if (!record) return 0

  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return 0
}

function readStringArray(record: Record<string, unknown> | null, ...keys: string[]) {
  if (!record) return []

  for (const key of keys) {
    const value = record[key]
    if (!Array.isArray(value)) continue

    const items = value
      .map((item) => {
        if (typeof item === 'string' && item.trim()) {
          return item.trim()
        }

        const asObject = asRecord(item)
        return readString(asObject, 'uuid', 'tenantUuid')
      })
      .filter((item): item is string => Boolean(item))

    if (items.length > 0) {
      return items
    }
  }

  return []
}

function extractRole(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (!Array.isArray(value)) {
    return ''
  }

  for (const item of value) {
    if (typeof item === 'string' && item.trim()) {
      return item.trim()
    }

    const record = asRecord(item)
    const authority = readString(record, 'authority', 'role', 'name')
    if (authority) {
      return authority
    }
  }

  return ''
}

function extractErrorMessage(payload: unknown, status: number) {
  const record = asRecord(payload)
  if (!record) {
    return `Request failed with status ${status}`
  }

  const directMessage = readString(record, 'message', 'error', 'detail', 'title')
  if (directMessage) {
    return directMessage
  }

  const errors = record.errors
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0]
    if (typeof first === 'string' && first.trim()) {
      return first.trim()
    }

    const firstRecord = asRecord(first)
    const nestedMessage = readString(firstRecord, 'message', 'defaultMessage', 'error')
    if (nestedMessage) {
      return nestedMessage
    }
  }

  return `Request failed with status ${status}`
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  const contentType = (response.headers.get('content-type') || '').toLowerCase()

  let payload: unknown = null
  if (text.trim()) {
    const canParseJson = contentType.includes('application/json') || contentType.includes('+json')
    if (canParseJson) {
      try {
        payload = JSON.parse(text) as unknown
      } catch {
        if (!response.ok) {
          throw new ApiError(`Request failed with status ${response.status}`, response.status)
        }
        throw new ApiError('Received an invalid JSON response from server.', response.status)
      }
    } else {
      payload = text
    }
  }

  if (isWrappedApiResponse<T>(payload)) {
    if (!response.ok || !payload.success) {
      throw new ApiError(
        payload.message || `Request failed with status ${response.status}`,
        response.status,
      )
    }

    return payload.data
  }

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(payload, response.status), response.status)
  }

  return payload as T
}

function normalizeAuthTokenResponse(payload: unknown, fallbackUsername: string): AuthTokenResponse {
  const record = asRecord(payload)
  if (!record) {
    throw new Error('Login response format is invalid.')
  }

  const token = readString(record, 'accessToken', 'access_token', 'token', 'jwt', 'idToken')
  if (!token) {
    throw new Error('Login response did not include a token.')
  }

  const username =
    readString(record, 'username', 'userName', 'email', 'login') ||
    readString(asRecord(record.user), 'username', 'userName', 'email') ||
    fallbackUsername

  const role =
    readString(record, 'role') ||
    extractRole(record.roles) ||
    extractRole(record.authorities) ||
    readString(asRecord(record.user), 'role') ||
    'USER'

  const tenantUuid = readString(record, 'tenantUuid', 'tenant_uuid', 'tenantId', 'tenant_id')
  const defaultTenantUuid =
    readString(record, 'defaultTenantUuid', 'default_tenant_uuid', 'defaultTenantId') || tenantUuid
  const companyUuid = readString(record, 'companyUuid', 'company_uuid')
  const companyName = readString(record, 'companyName', 'company_name')
  const branchUuid = readString(record, 'branchUuid', 'branch_uuid', 'branchId', 'branch_id')
  const branchName = readString(record, 'branchName', 'branch_name')
  const accessibleTenants = readStringArray(record, 'accessibleTenants', 'tenants')

  return {
    accessToken: token,
    tokenType: readString(record, 'tokenType', 'token_type', 'type') || 'Bearer',
    expiresIn: readNumber(record, 'expiresIn', 'expires_in', 'expiryInSeconds', 'ttl'),
    username,
    role,
    tenantUuid,
    defaultTenantUuid,
    companyUuid,
    companyName,
    branchUuid,
    branchName,
    accessibleTenants,
  }
}

function extractTenantUuidFromLookupPayload(payload: unknown): string {
  const direct = readString(asRecord(payload), 'tenantUuid', 'tenant_uuid', 'tenantId', 'tenant_id', 'uuid')
  if (direct) {
    return direct
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const resolved = readString(
        asRecord(item),
        'tenantUuid',
        'tenant_uuid',
        'tenantId',
        'tenant_id',
        'uuid',
      )
      if (resolved) {
        return resolved
      }
    }
  }

  const record = asRecord(payload)
  if (!record) {
    return ''
  }

  const nestedKeys = ['tenant', 'data', 'result', 'company']
  for (const key of nestedKeys) {
    const resolved = readString(
      asRecord(record[key]),
      'tenantUuid',
      'tenant_uuid',
      'tenantId',
      'tenant_id',
      'uuid',
    )
    if (resolved) {
      return resolved
    }
  }

  return ''
}

function normalizePublicOnboardResponse(
  payload: unknown,
  fallbackPayload: PublicOnboardRequest,
): PublicOnboardResponse {
  const root = asRecord(payload)
  const data = asRecord(root?.data)

  const tenantUuid =
    readString(root, 'tenantUuid', 'tenant_uuid', 'tenantId', 'tenant_id', 'uuid') ||
    readString(data, 'tenantUuid', 'tenant_uuid', 'tenantId', 'tenant_id', 'uuid')

  return {
    tenantUuid,
    companyName:
      readString(root, 'companyName', 'company_name', 'tenantName', 'tenant_name', 'name') ||
      readString(data, 'companyName', 'company_name', 'tenantName', 'tenant_name', 'name') ||
      fallbackPayload.companyName,
    companyCode:
      readString(root, 'companyCode', 'company_code', 'tenantCode', 'tenant_code', 'code') ||
      readString(data, 'companyCode', 'company_code', 'tenantCode', 'tenant_code', 'code') ||
      fallbackPayload.companyCode,
    adminUsername:
      readString(root, 'adminUsername', 'username', 'userName') ||
      readString(data, 'adminUsername', 'username', 'userName') ||
      fallbackPayload.adminUsername,
    message:
      readString(root, 'message', 'detail') ||
      readString(data, 'message', 'detail') ||
      'Company registration completed successfully.',
  }
}

export function getSavedAuth() {
  const rawAccessibleTenants = localStorage.getItem(ACCESSIBLE_TENANTS_KEY)
  let accessibleTenants: string[] = []

  if (rawAccessibleTenants) {
    try {
      const parsed = JSON.parse(rawAccessibleTenants)
      if (Array.isArray(parsed)) {
        accessibleTenants = parsed.filter((item): item is string => typeof item === 'string')
      }
    } catch {
      accessibleTenants = []
    }
  }

  return {
    token: localStorage.getItem(TOKEN_KEY) ?? '',
    username: localStorage.getItem(USERNAME_KEY) ?? '',
    role: localStorage.getItem(ROLE_KEY) ?? '',
    tenantUuid: localStorage.getItem(TENANT_UUID_KEY) ?? '',
    defaultTenantUuid: localStorage.getItem(DEFAULT_TENANT_UUID_KEY) ?? '',
    companyUuid: localStorage.getItem(COMPANY_UUID_KEY) ?? '',
    companyName: localStorage.getItem(COMPANY_NAME_KEY) ?? '',
    branchUuid: localStorage.getItem(BRANCH_UUID_KEY) ?? '',
    branchName: localStorage.getItem(BRANCH_NAME_KEY) ?? '',
    accessibleTenants,
  }
}

export function saveAuth(response: AuthTokenResponse) {
  localStorage.setItem(TOKEN_KEY, response.accessToken)
  localStorage.setItem(USERNAME_KEY, response.username)
  localStorage.setItem(ROLE_KEY, response.role)
  localStorage.setItem(TENANT_UUID_KEY, response.tenantUuid || '')
  localStorage.setItem(DEFAULT_TENANT_UUID_KEY, response.defaultTenantUuid || response.tenantUuid || '')
  localStorage.setItem(COMPANY_UUID_KEY, response.companyUuid || '')
  localStorage.setItem(COMPANY_NAME_KEY, response.companyName || '')
  localStorage.setItem(BRANCH_UUID_KEY, response.branchUuid || '')
  localStorage.setItem(BRANCH_NAME_KEY, response.branchName || '')
  localStorage.setItem(ACCESSIBLE_TENANTS_KEY, JSON.stringify(response.accessibleTenants ?? []))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(TENANT_UUID_KEY)
  localStorage.removeItem(DEFAULT_TENANT_UUID_KEY)
  localStorage.removeItem(COMPANY_UUID_KEY)
  localStorage.removeItem(COMPANY_NAME_KEY)
  localStorage.removeItem(BRANCH_UUID_KEY)
  localStorage.removeItem(BRANCH_NAME_KEY)
  localStorage.removeItem(ACCESSIBLE_TENANTS_KEY)
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  token: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  const bodyMode = options?.bodyMode ?? 'json'

  if (body !== undefined) {
    headers['Content-Type'] =
      bodyMode === 'form' ? 'application/x-www-form-urlencoded;charset=UTF-8' : 'application/json'
  }

  if (token && !options?.skipAuthHeader) {
    headers.Authorization = `Bearer ${token}`
  }

  const tenantUuid = options?.tenantUuid?.trim() || localStorage.getItem(TENANT_UUID_KEY)
  if (tenantUuid) {
    headers['X-Tenant-Id'] = tenantUuid
  }

  const branchUuid = localStorage.getItem(BRANCH_UUID_KEY)
  if (branchUuid && !options?.skipAuthHeader) {
    headers['X-Branch-Id'] = branchUuid
  }

  let serializedBody: string | undefined
  if (body !== undefined) {
    if (bodyMode === 'form') {
      const form = new URLSearchParams()
      const record = asRecord(body)
      if (record) {
        Object.entries(record).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            form.set(key, String(value))
          }
        })
      }
      serializedBody = form.toString()
    } else {
      serializedBody = JSON.stringify(body)
    }
  }

  const response = await fetch(`${normalizeBaseUrl(API_BASE_URL)}${path}${toQueryString(options?.query)}`, {
    method,
    headers,
    body: serializedBody,
  })

  return parseResponse<T>(response)
}

function shouldStopLoginFallback(error: unknown) {
  if (error instanceof ApiError) {
    return error.status === 401 || error.status === 403
  }

  return false
}

export const api = {
  async publicOnboard(payload: PublicOnboardRequest) {
    const requestBody = {
      ...payload,
      tenantName: payload.companyName,
      tenantCode: payload.companyCode,
      adminFullName: payload.ownerName,
    }

    const response = await request<unknown>('POST', '/api/v1/public/onboard', '', requestBody, {
      skipAuthHeader: true,
    })
    return normalizePublicOnboardResponse(response, payload)
  },

  async resolveTenantUuidByCompanyName(companyName: string) {
    const trimmedCompanyName = companyName.trim()
    if (!trimmedCompanyName) {
      return ''
    }

    const queryVariants: Array<Record<string, QueryValue>> = [
      { companyName: trimmedCompanyName },
      { tenantName: trimmedCompanyName },
      { name: trimmedCompanyName },
      { company: trimmedCompanyName },
    ]

    const getPaths = [
      '/api/v1/public/tenants/resolve',
      '/api/v1/public/tenants/lookup',
      '/api/v1/public/tenants/by-company-name',
      '/api/v1/tenants/resolve',
      '/api/v1/tenants/lookup',
      '/api/v1/tenants/by-company-name',
      '/api/v1/companies/resolve-tenant',
      '/api/v1/public/companies/resolve-tenant',
      '/api/v1/public/companies/lookup-tenant',
    ]

    const getCandidates: Array<{ path: string; query: Record<string, QueryValue> }> = []
    for (const path of getPaths) {
      for (const query of queryVariants) {
        getCandidates.push({ path, query })
      }
    }

    for (const candidate of getCandidates) {
      try {
        const response = await request<unknown>('GET', candidate.path, '', undefined, {
          skipAuthHeader: true,
          query: candidate.query,
        })
        const resolvedTenantUuid = extractTenantUuidFromLookupPayload(response)
        if (resolvedTenantUuid) {
          return resolvedTenantUuid
        }
      } catch {
        // Continue trying compatible endpoint contracts.
      }
    }

    const postCandidates = [
      '/api/v1/public/tenants/resolve',
      '/api/v1/public/tenants/lookup',
      '/api/v1/public/tenants/by-company-name',
      '/api/v1/tenants/resolve',
      '/api/v1/tenants/lookup',
      '/api/v1/tenants/by-company-name',
      '/api/v1/companies/resolve-tenant',
      '/api/v1/public/companies/resolve-tenant',
      '/api/v1/public/companies/lookup-tenant',
    ]

    for (const path of postCandidates) {
      try {
        const bodyVariants = [
          { companyName: trimmedCompanyName },
          { tenantName: trimmedCompanyName },
          { name: trimmedCompanyName },
          { company: trimmedCompanyName },
        ]

        for (const body of bodyVariants) {
          const response = await request<unknown>('POST', path, '', body, {
            skipAuthHeader: true,
          })
          const resolvedTenantUuid = extractTenantUuidFromLookupPayload(response)
          if (resolvedTenantUuid) {
            return resolvedTenantUuid
          }
        }
      } catch {
        // Continue trying compatible endpoint contracts.
      }
    }

    return ''
  },

  async login(username: string, password: string, tenantUuid?: string) {
    lastLoginAttemptDebug = null
    const trimmedUsername = username.trim()
    const paths = ['/api/v1/auth/login', '/api/auth/login', '/auth/login', '/api/v1/auth/signin']
    const payloads: Array<{ body: Record<string, string | undefined>; bodyMode: BodyMode }> = [
      { body: { username: trimmedUsername, password, tenantUuid }, bodyMode: 'json' },
      { body: { email: trimmedUsername, password, tenantUuid }, bodyMode: 'json' },
      { body: { username: trimmedUsername, password, tenantUuid }, bodyMode: 'form' },
    ]

    let lastError: unknown = null

    for (const payload of payloads) {
      for (const path of paths) {
        lastLoginAttemptDebug = {
          endpoint: path,
          bodyMode: payload.bodyMode,
          succeeded: false,
          status: 0,
          message: '',
        }

        try {
          const response = await request<unknown>('POST', path, '', payload.body, {
            bodyMode: payload.bodyMode,
            skipAuthHeader: true,
            tenantUuid,
          })
          const normalized = normalizeAuthTokenResponse(response, trimmedUsername)
          lastLoginAttemptDebug = {
            endpoint: path,
            bodyMode: payload.bodyMode,
            succeeded: true,
            status: 200,
            message: 'Login request succeeded.',
          }
          return normalized
        } catch (error) {
          lastError = error
          if (error instanceof ApiError) {
            lastLoginAttemptDebug = {
              endpoint: path,
              bodyMode: payload.bodyMode,
              succeeded: false,
              status: error.status,
              message: error.message,
            }
          } else if (error instanceof Error) {
            lastLoginAttemptDebug = {
              endpoint: path,
              bodyMode: payload.bodyMode,
              succeeded: false,
              status: 0,
              message: error.message,
            }
          }

          if (shouldStopLoginFallback(error)) {
            throw error
          }
        }
      }
    }

    if (lastError instanceof Error) {
      throw lastError
    }

    throw new Error('Unable to complete login request.')
  },

  getMyShops(token: string) {
    return request<TenantShopResponse[]>('GET', '/api/auth/my-shops', token)
  },

  async switchShop(token: string, tenantUuid: string) {
    const response = await request<unknown>('POST', `/api/auth/switch-shop/${tenantUuid}`, token, {})
    return normalizeAuthTokenResponse(response, '')
  },

  setPrimaryShop(token: string, tenantUuid: string) {
    return request<{ message: string }>('POST', `/api/auth/set-primary-shop/${tenantUuid}`, token, {})
  },

  getTenants(token: string) {
    return request<TenantResponse[]>('GET', '/api/v1/tenants', token)
  },

  getTenantByUuid(token: string, tenantUuid: string) {
    return request<TenantResponse>('GET', `/api/v1/tenants/${tenantUuid}`, token)
  },

  createTenant(token: string, payload: CreateTenantRequest) {
    return request<TenantResponse>('POST', '/api/v1/tenants', token, payload)
  },

  updateTenant(token: string, tenantUuid: string, payload: UpdateTenantRequest) {
    return request<TenantResponse>('PUT', `/api/v1/tenants/${tenantUuid}`, token, payload)
  },

  getSalesDashboard(token: string, fromDate: string, toDate: string) {
    return request<SalesDashboardResponse>('GET', '/api/v1/sales/dashboard', token, undefined, {
      query: {
        fromDate,
        toDate,
      },
    })
  },

  searchProducts(token: string, page = 0, size = 10) {
    return request<PageResult<ProductResponse>>('GET', '/api/v1/products', token, undefined, {
      query: {
        page,
        size,
      },
    })
  },

  createProduct(token: string, payload: CreateProductRequest) {
    return request<ProductResponse>('POST', '/api/v1/products', token, payload)
  },

  searchCustomers(token: string, page = 0, size = 10) {
    return request<PageResult<CustomerResponse>>('GET', '/api/v1/customers', token, undefined, {
      query: {
        page,
        size,
      },
    })
  },

  createCustomer(token: string, payload: CreateCustomerRequest) {
    return request<CustomerResponse>('POST', '/api/v1/customers', token, payload)
  },

  searchFarmers(token: string, page = 0, size = 10) {
    return request<PageResult<FarmerResponse>>('GET', '/api/v1/farmers', token, undefined, {
      query: {
        page,
        size,
      },
    })
  },

  searchMilkCollections(token: string, page = 0, size = 10) {
    return request<
      PageResult<{
        uuid: string
        collectionNo: string
        farmerName: string
        collectionDate: string
        quantity: number
        grossAmount: number
      }>
    >('GET', '/api/v1/milk-collections', token, undefined, {
      query: {
        page,
        size,
      },
    })
  },

  createMilkCollection(token: string, payload: CreateMilkCollectionRequest) {
    return request<{
      uuid: string
      collectionNo: string
      farmerName: string
      collectionDate: string
      quantity: number
      grossAmount: number
    }>('POST', '/api/v1/milk-collections', token, payload)
  },

  getMilkTypes(token: string) {
    return request<MilkTypeResponse[]>('GET', '/api/v1/master/milk-types', token)
  },

  searchSales(token: string, page = 0, size = 10) {
    return request<PageResult<SalesInvoiceResponse>>('GET', '/api/v1/sales', token, undefined, {
      query: {
        page,
        size,
      },
    })
  },

  createSalesInvoice(token: string, payload: CreateSalesInvoiceRequest) {
    return request<SalesInvoiceResponse>('POST', '/api/v1/sales', token, payload)
  },

  createFarmer(token: string, payload: CreateFarmerRequest) {
    return request<FarmerResponse>('POST', '/api/v1/farmers', token, payload)
  },
}