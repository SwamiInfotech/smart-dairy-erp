import type {
  ApiResponse,
  AuthTokenResponse,
  PublicOnboardRequest,
  PublicOnboardResponse,
} from '../types/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
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

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

export function readString(record: Record<string, unknown> | null, ...keys: string[]) {
  if (!record) return ''

  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

export function readNumber(record: Record<string, unknown> | null, ...keys: string[]) {
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

export async function parseResponse<T>(response: Response): Promise<T> {
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

export function normalizeAuthTokenResponse(
  payload: unknown,
  fallbackUsername: string,
): AuthTokenResponse {
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

export function extractTenantUuidFromLookupPayload(payload: unknown): string {
  const direct = readString(
    asRecord(payload),
    'tenantUuid',
    'tenant_uuid',
    'tenantId',
    'tenant_id',
    'uuid',
  )
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

export function normalizePublicOnboardResponse(
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
