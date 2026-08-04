import type { FormEvent } from 'react'
import { useCallback } from 'react'
import { api } from '../lib/api'
import { isUuid, saveTenantDirectory, upsertTenantDirectory, type TenantDirectoryEntry } from '../lib/appCoreUtils'
import type { PublicOnboardRequest } from '../types/api'

type UsePublicOnboardingParams = {
  onboardForm: PublicOnboardRequest
  runAction: <T>(action: () => Promise<T>, successMessage?: string) => Promise<T | null>
  setOnboardForm: React.Dispatch<React.SetStateAction<PublicOnboardRequest>>
  setError: React.Dispatch<React.SetStateAction<string>>
  setTenantDirectory: React.Dispatch<React.SetStateAction<TenantDirectoryEntry[]>>
  setLoginTenantUuid: React.Dispatch<React.SetStateAction<string>>
  setLoginCompanyName: React.Dispatch<React.SetStateAction<string>>
  setLoginUsername: React.Dispatch<React.SetStateAction<string>>
  setOnboardSuccessMessage: React.Dispatch<React.SetStateAction<string>>
  setPublicView: React.Dispatch<React.SetStateAction<'login' | 'onboard'>>
}

export function usePublicOnboarding({
  onboardForm,
  runAction,
  setOnboardForm,
  setError,
  setTenantDirectory,
  setLoginTenantUuid,
  setLoginCompanyName,
  setLoginUsername,
  setOnboardSuccessMessage,
  setPublicView,
}: UsePublicOnboardingParams) {
  const updateOnboardForm = useCallback(
    (field: keyof PublicOnboardRequest, value: string) => {
      setOnboardForm((prev) => ({
        ...prev,
        [field]: value,
      }))
    },
    [setOnboardForm],
  )

  const onPublicOnboard = useCallback(
    async (event: FormEvent) => {
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
    },
    [
      onboardForm,
      runAction,
      setError,
      setLoginCompanyName,
      setLoginTenantUuid,
      setLoginUsername,
      setOnboardSuccessMessage,
      setPublicView,
      setTenantDirectory,
    ],
  )

  return {
    updateOnboardForm,
    onPublicOnboard,
  }
}
