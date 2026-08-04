import type { AppShellContractsArgs } from './appShellContracts'

export function usePublicAuthProps({ state, ops }: AppShellContractsArgs) {
  const { session } = state

  return {
    busy: session.busy,
    publicView: session.publicView,
    onboardingForm: session.onboardForm,
    updateOnboardForm: ops.onboarding.updateOnboardForm,
    onPublicOnboard: ops.onboarding.onPublicOnboard,
    onBackToLogin: ops.publicAuthActions.onBackToLogin,
    onOpenOnboard: ops.publicAuthActions.onOpenOnboard,
    loginUsername: session.loginUsername,
    loginPassword: session.loginPassword,
    loginCompanyName: session.loginCompanyName,
    loginTenantUuid: session.loginTenantUuid,
    setLoginUsername: session.setLoginUsername,
    setLoginPassword: session.setLoginPassword,
    onLoginCompanyChange: ops.publicAuthActions.onLoginCompanyChange,
    onLoginTenantChange: ops.publicAuthActions.onLoginTenantChange,
    onResolveCompanyTenantUuid: ops.authFlow.resolveCompanyTenantUuid,
    resolvedTenantUuid: session.resolvedTenantUuid,
    resolvingTenantUuid: session.resolvingTenantUuid,
    tenantLookupNote: session.tenantLookupNote,
    tenantDirectory: session.tenantDirectory,
    loginDebug: session.loginDebug,
    onForgotPassword: ops.publicAuthActions.onForgotPassword,
    onLogin: ops.authFlow.onLogin,
  }
}

export type PublicAuthProps = ReturnType<typeof usePublicAuthProps>
