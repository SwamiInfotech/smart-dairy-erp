import type { AuthTokenResponse } from '../types/api'

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

export { TENANT_UUID_KEY, BRANCH_UUID_KEY }

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
