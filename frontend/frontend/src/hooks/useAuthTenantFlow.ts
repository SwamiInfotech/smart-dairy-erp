import type { FormEvent } from 'react'
import { useCallback } from 'react'
import { api, clearAuth, getLastLoginAttemptDebug, saveAuth } from '../lib/api'
import {
  findTenantUuidByCompany,
  isUuid,
  saveTenantDirectory,
  upsertTenantDirectory,
  type TenantDirectoryEntry,
} from '../lib/appCoreUtils'
import type {
  AuthTokenResponse,
  CustomerResponse,
  ProductResponse,
  SalesDashboardResponse,
  SalesInvoiceResponse,
  TenantShopResponse,
} from '../types/api'

type CollectionListItem = {
  uuid: string
  collectionNo: string
  farmerName: string
  collectionDate: string
  quantity: number
  grossAmount: number
}

type UseAuthTenantFlowParams = {
  loginUsername: string
  loginPassword: string
  loginCompanyName: string
  loginTenantUuid: string
  tenantDirectory: TenantDirectoryEntry[]
  accessibleTenants: string[]
  runAction: <T>(action: () => Promise<T>, successMessage?: string) => Promise<T | null>
  setError: React.Dispatch<React.SetStateAction<string>>
  setLoginDebug: React.Dispatch<React.SetStateAction<string>>
  setTenantLookupNote: React.Dispatch<React.SetStateAction<string>>
  setResolvingTenantUuid: React.Dispatch<React.SetStateAction<boolean>>
  setLoginTenantUuid: React.Dispatch<React.SetStateAction<string>>
  setLoginCompanyName: React.Dispatch<React.SetStateAction<string>>
  setTenantDirectory: React.Dispatch<React.SetStateAction<TenantDirectoryEntry[]>>
  setToken: React.Dispatch<React.SetStateAction<string>>
  setTenantUuid: React.Dispatch<React.SetStateAction<string>>
  setBranchUuid: React.Dispatch<React.SetStateAction<string>>
  setBranchName: React.Dispatch<React.SetStateAction<string>>
  setAccessibleTenants: React.Dispatch<React.SetStateAction<string[]>>
  setMyShops: React.Dispatch<React.SetStateAction<TenantShopResponse[]>>
  setDashboard: React.Dispatch<React.SetStateAction<SalesDashboardResponse | null>>
  setProducts: React.Dispatch<React.SetStateAction<ProductResponse[]>>
  setCustomers: React.Dispatch<React.SetStateAction<CustomerResponse[]>>
  setCollections: React.Dispatch<React.SetStateAction<CollectionListItem[]>>
  setSales: React.Dispatch<React.SetStateAction<SalesInvoiceResponse[]>>
  setSuccess: React.Dispatch<React.SetStateAction<string>>
}

export function useAuthTenantFlow({
  loginUsername,
  loginPassword,
  loginCompanyName,
  loginTenantUuid,
  tenantDirectory,
  accessibleTenants,
  runAction,
  setError,
  setLoginDebug,
  setTenantLookupNote,
  setResolvingTenantUuid,
  setLoginTenantUuid,
  setLoginCompanyName,
  setTenantDirectory,
  setToken,
  setTenantUuid,
  setBranchUuid,
  setBranchName,
  setAccessibleTenants,
  setMyShops,
  setDashboard,
  setProducts,
  setCustomers,
  setCollections,
  setSales,
  setSuccess,
}: UseAuthTenantFlowParams) {
  const resolveCompanyTenantUuid = useCallback(
    async (companyName: string) => {
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
    },
    [
      setLoginTenantUuid,
      setResolvingTenantUuid,
      setTenantDirectory,
      setTenantLookupNote,
      tenantDirectory,
    ],
  )

  const onLogin = useCallback(
    async (event: FormEvent) => {
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

      if (targetTenantUuid && accessibleTenants.length > 0 && !accessibleTenants.includes(targetTenantUuid)) {
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

      const authResponse = response as AuthTokenResponse
      saveAuth(authResponse)
      setToken(authResponse.accessToken)
      setTenantUuid(authResponse.tenantUuid)
      setBranchUuid(authResponse.branchUuid)
      setBranchName(authResponse.branchName)
      setAccessibleTenants(authResponse.accessibleTenants)

      const mappedCompanyName = trimmedCompanyName || authResponse.companyName || ''
      if (mappedCompanyName && authResponse.tenantUuid && isUuid(authResponse.tenantUuid)) {
        setTenantDirectory((prev) => {
          const next = upsertTenantDirectory(prev, mappedCompanyName, authResponse.tenantUuid)
          saveTenantDirectory(next)
          return next
        })
        if (!trimmedCompanyName && authResponse.companyName) {
          setLoginCompanyName(authResponse.companyName)
        }
      }
    },
    [
      accessibleTenants,
      loginCompanyName,
      loginPassword,
      loginTenantUuid,
      loginUsername,
      runAction,
      setAccessibleTenants,
      setBranchName,
      setBranchUuid,
      setError,
      setLoginCompanyName,
      setLoginDebug,
      setLoginTenantUuid,
      setTenantDirectory,
      setTenantLookupNote,
      setTenantUuid,
      setToken,
      tenantDirectory,
    ],
  )

  const onLogout = useCallback(() => {
    clearAuth()
    setToken('')
    setTenantUuid('')
    setBranchUuid('')
    setBranchName('')
    setAccessibleTenants([])
    setMyShops([])
    setDashboard(null)
    setProducts([])
    setCustomers([])
    setCollections([])
    setSales([])
    setError('')
    setSuccess('')
  }, [
    setAccessibleTenants,
    setBranchName,
    setBranchUuid,
    setCollections,
    setCustomers,
    setDashboard,
    setError,
    setMyShops,
    setProducts,
    setSales,
    setSuccess,
    setTenantUuid,
    setToken,
  ])

  return {
    resolveCompanyTenantUuid,
    onLogin,
    onLogout,
  }
}
