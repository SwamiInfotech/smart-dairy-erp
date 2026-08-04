import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  findTenantUuidByCompany,
  loadTenantDirectory,
  type TenantDirectoryEntry,
} from '../lib/appCoreUtils'
import type { PublicOnboardRequest, TenantShopResponse } from '../types/api'

type PublicView = 'login' | 'onboard'
type ToastKind = 'error' | 'success'

type ToastItem = {
  id: number
  kind: ToastKind
  text: string
}

type InitialAuthState = {
  token: string
  tenantUuid: string
  branchUuid: string
  branchName: string
  companyName: string
  accessibleTenants: string[]
}

export function useAppSessionState(initialAuth: InitialAuthState) {
  const [token, setToken] = useState(initialAuth.token)
  const [tenantUuid, setTenantUuid] = useState(initialAuth.tenantUuid)
  const [branchUuid, setBranchUuid] = useState(initialAuth.branchUuid)
  const [branchName, setBranchName] = useState(initialAuth.branchName)
  const [accessibleTenants, setAccessibleTenants] = useState<string[]>(initialAuth.accessibleTenants)
  const [myShops, setMyShops] = useState<TenantShopResponse[]>([])

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const bodyScrollRef = useRef<HTMLDivElement | null>(null)

  const [loginDebug, setLoginDebug] = useState('')
  const [tenantLookupNote, setTenantLookupNote] = useState('')
  const [resolvingTenantUuid, setResolvingTenantUuid] = useState(false)
  const [publicView, setPublicView] = useState<PublicView>('login')
  const [onboardSuccessMessage, setOnboardSuccessMessage] = useState('')
  const [toasts, setToasts] = useState<ToastItem[]>([])

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
  const [tenantDirectory, setTenantDirectory] = useState<TenantDirectoryEntry[]>(() => loadTenantDirectory())

  const resolvedTenantUuid = useMemo(() => {
    const typedTenantUuid = loginTenantUuid.trim()
    if (typedTenantUuid) {
      return typedTenantUuid
    }

    return findTenantUuidByCompany(tenantDirectory, loginCompanyName)
  }, [loginCompanyName, loginTenantUuid, tenantDirectory])

  const pushToast = useCallback((kind: ToastKind, text: string) => {
    const normalizedText = text.trim()
    if (!normalizedText) return

    const id = Date.now() + Math.floor(Math.random() * 10000)
    setToasts((prev) => [...prev, { id, kind, text: normalizedText }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
    }, 4200)
  }, [])

  useEffect(() => {
    if (!error) return
    pushToast('error', error)
    setError('')
  }, [error, pushToast])

  useEffect(() => {
    if (!success) return
    pushToast('success', success)
    setSuccess('')
  }, [success, pushToast])

  useEffect(() => {
    if (!onboardSuccessMessage) return
    pushToast('success', onboardSuccessMessage)
    setOnboardSuccessMessage('')
  }, [onboardSuccessMessage, pushToast])

  const onDismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const currentShop = useMemo(
    () => myShops.find((shop) => shop.uuid === tenantUuid) ?? null,
    [myShops, tenantUuid],
  )

  return {
    token,
    setToken,
    tenantUuid,
    setTenantUuid,
    branchUuid,
    setBranchUuid,
    branchName,
    setBranchName,
    accessibleTenants,
    setAccessibleTenants,
    myShops,
    setMyShops,
    error,
    setError,
    success,
    setSuccess,
    busy,
    setBusy,
    bodyScrollRef,
    loginDebug,
    setLoginDebug,
    tenantLookupNote,
    setTenantLookupNote,
    resolvingTenantUuid,
    setResolvingTenantUuid,
    publicView,
    setPublicView,
    onboardSuccessMessage,
    setOnboardSuccessMessage,
    toasts,
    onDismissToast,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    loginCompanyName,
    setLoginCompanyName,
    loginTenantUuid,
    setLoginTenantUuid,
    salesCustomerInput,
    setSalesCustomerInput,
    onboardForm,
    setOnboardForm,
    tenantDirectory,
    setTenantDirectory,
    resolvedTenantUuid,
    currentShop,
  }
}
