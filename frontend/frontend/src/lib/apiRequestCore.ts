import { asRecord, parseResponse } from './apiResponseParsers'
import { BRANCH_UUID_KEY, TENANT_UUID_KEY } from './apiStorage'

export type QueryValue = string | number | boolean | undefined | null
export type BodyMode = 'json' | 'form'

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type RequestOptions = {
  query?: Record<string, QueryValue>
  bodyMode?: BodyMode
  skipAuthHeader?: boolean
  tenantUuid?: string
}

export type RequestFn = <T>(
  method: RequestMethod,
  path: string,
  token: string,
  body?: unknown,
  options?: RequestOptions,
) => Promise<T>

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

export function createRequest(baseUrl: string): RequestFn {
  return async function request<T>(
    method: RequestMethod,
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

    const response = await fetch(`${normalizeBaseUrl(baseUrl)}${path}${toQueryString(options?.query)}`, {
      method,
      headers,
      body: serializedBody,
    })

    return parseResponse<T>(response)
  }
}
