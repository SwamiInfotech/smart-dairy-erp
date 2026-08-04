import { useCallback } from 'react'

type UsePublicAuthActionsParams = {
  setPublicView: React.Dispatch<React.SetStateAction<'login' | 'onboard'>>
  setOnboardSuccessMessage: React.Dispatch<React.SetStateAction<string>>
  setLoginCompanyName: React.Dispatch<React.SetStateAction<string>>
  setLoginTenantUuid: React.Dispatch<React.SetStateAction<string>>
  setTenantLookupNote: React.Dispatch<React.SetStateAction<string>>
  setError: React.Dispatch<React.SetStateAction<string>>
  setSuccess: React.Dispatch<React.SetStateAction<string>>
}

export function usePublicAuthActions({
  setPublicView,
  setOnboardSuccessMessage,
  setLoginCompanyName,
  setLoginTenantUuid,
  setTenantLookupNote,
  setError,
  setSuccess,
}: UsePublicAuthActionsParams) {
  const onBackToLogin = useCallback(() => {
    setPublicView('login')
    setOnboardSuccessMessage('')
  }, [setOnboardSuccessMessage, setPublicView])

  const onOpenOnboard = useCallback(() => {
    setPublicView('onboard')
    setOnboardSuccessMessage('')
  }, [setOnboardSuccessMessage, setPublicView])

  const onLoginCompanyChange = useCallback(
    (value: string) => {
      setLoginCompanyName(value)
      setLoginTenantUuid('')
      setTenantLookupNote('')
    },
    [setLoginCompanyName, setLoginTenantUuid, setTenantLookupNote],
  )

  const onLoginTenantChange = useCallback(
    (value: string) => {
      setLoginTenantUuid(value)
      setTenantLookupNote('')
    },
    [setLoginTenantUuid, setTenantLookupNote],
  )

  const onForgotPassword = useCallback(() => {
    setError('')
    setSuccess(
      'Forgot password flow is coming soon. Please contact your company administrator for immediate reset.',
    )
  }, [setError, setSuccess])

  return {
    onBackToLogin,
    onOpenOnboard,
    onLoginCompanyChange,
    onLoginTenantChange,
    onForgotPassword,
  }
}
