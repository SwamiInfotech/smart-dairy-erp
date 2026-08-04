import type {
  CreateTenantRequest,
  PublicOnboardRequest,
  TenantResponse,
  TenantShopResponse,
  UpdateTenantRequest,
} from '../types/api'
import {
  ApiError,
  extractTenantUuidFromLookupPayload,
  normalizeAuthTokenResponse,
  normalizePublicOnboardResponse,
} from './apiResponseParsers'
import type { BodyMode, QueryValue, RequestFn } from './apiRequestCore'

export type LoginAttemptDebug = {
  endpoint: string
  bodyMode: BodyMode
  succeeded: boolean
  status: number
  message: string
}

type ApiAuthTenantModuleDependencies = {
  request: RequestFn
}

let lastLoginAttemptDebug: LoginAttemptDebug | null = null

export function getLastLoginAttemptDebug() {
  return lastLoginAttemptDebug
}

function shouldStopLoginFallback(error: unknown) {
  if (error instanceof ApiError) {
    return error.status === 401 || error.status === 403
  }

  return false
}

const TENANT_LOOKUP_PATHS = [
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

function buildTenantLookupVariants(companyName: string): Array<Record<string, QueryValue>> {
  return [
    { companyName },
    { tenantName: companyName },
    { name: companyName },
    { company: companyName },
  ]
}

export function createApiAuthTenantModule({ request }: ApiAuthTenantModuleDependencies) {
  return {
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

      const lookupVariants = buildTenantLookupVariants(trimmedCompanyName)

      const getCandidates: Array<{ path: string; query: Record<string, QueryValue> }> = []
      for (const path of TENANT_LOOKUP_PATHS) {
        for (const query of lookupVariants) {
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

      for (const path of TENANT_LOOKUP_PATHS) {
        try {
          for (const body of lookupVariants) {
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
  }
}
