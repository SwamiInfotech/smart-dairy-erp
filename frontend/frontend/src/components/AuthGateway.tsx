import type { FormEvent } from 'react'
import { normalizeCompanyName, type TenantDirectoryEntry } from '../lib/appCoreUtils'
import type { PublicOnboardRequest } from '../types/api'

type AuthGatewayProps = {
  busy: boolean
  publicView: 'login' | 'onboard'
  onboardingForm: PublicOnboardRequest
  updateOnboardForm: (field: keyof PublicOnboardRequest, value: string) => void
  onPublicOnboard: (event: FormEvent) => void | Promise<void>
  onBackToLogin: () => void
  onOpenOnboard: () => void
  loginUsername: string
  loginPassword: string
  loginCompanyName: string
  loginTenantUuid: string
  setLoginUsername: React.Dispatch<React.SetStateAction<string>>
  setLoginPassword: React.Dispatch<React.SetStateAction<string>>
  onLoginCompanyChange: (value: string) => void
  onLoginTenantChange: (value: string) => void
  onResolveCompanyTenantUuid: (companyName: string) => void | Promise<void>
  resolvedTenantUuid: string
  resolvingTenantUuid: boolean
  tenantLookupNote: string
  tenantDirectory: TenantDirectoryEntry[]
  loginDebug: string
  onForgotPassword: () => void
  onLogin: (event: FormEvent) => void | Promise<void>
}

export function AuthGateway({
  busy,
  publicView,
  onboardingForm,
  updateOnboardForm,
  onPublicOnboard,
  onBackToLogin,
  onOpenOnboard,
  loginUsername,
  loginPassword,
  loginCompanyName,
  loginTenantUuid,
  setLoginUsername,
  setLoginPassword,
  onLoginCompanyChange,
  onLoginTenantChange,
  onResolveCompanyTenantUuid,
  resolvedTenantUuid,
  resolvingTenantUuid,
  tenantLookupNote,
  tenantDirectory,
  loginDebug,
  onForgotPassword,
  onLogin,
}: AuthGatewayProps) {
  return (
    <div className="login-page">
      {publicView === 'onboard' ? (
        <div className="login-card onboard-card">
          <section className="login-brand-panel onboard-brand-panel">
            <div className="login-glow" aria-hidden="true" />
            <p className="eyebrow">Smart Dairy ERP</p>
            <h1 className="login-title">Launch Your Company Workspace</h1>
            <p className="subtle">
              Register once and get your dedicated tenant identity in our shared multi-tenant platform.
            </p>
            <div className="login-points">
              <p>Automatic tenant provisioning through /api/v1/public/onboard</p>
              <p>Admin credentials generated for immediate first login</p>
              <p>Ready-to-use workspace for procurement, sales, and collections</p>
            </div>
          </section>

          <section className="login-form-panel">
            <h2>Register Company</h2>
            <p className="subtle">Create your tenant profile and admin account in one step.</p>

            <form className="form two-col" onSubmit={onPublicOnboard}>
              <label>
                Company Name
                <input
                  value={onboardingForm.companyName}
                  onChange={(event) => updateOnboardForm('companyName', event.target.value)}
                  placeholder="Example: Sunrise Dairy Foods"
                  required
                />
              </label>

              <label>
                Company Code
                <input
                  value={onboardingForm.companyCode}
                  onChange={(event) => updateOnboardForm('companyCode', event.target.value)}
                  placeholder="Example: SRD001"
                  required
                />
              </label>

              <label>
                Tenant Name
                <input value={onboardingForm.companyName} placeholder="Auto synced with company name" readOnly />
                <small className="subtle">Tenant name always matches company name.</small>
              </label>

              <label>
                Owner Name
                <input
                  value={onboardingForm.ownerName}
                  onChange={(event) => updateOnboardForm('ownerName', event.target.value)}
                  placeholder="Owner full name"
                  required
                />
              </label>

              <label>
                Owner Mobile
                <input
                  value={onboardingForm.ownerMobile}
                  onChange={(event) => updateOnboardForm('ownerMobile', event.target.value)}
                  placeholder="10-digit mobile"
                  required
                />
              </label>

              <label>
                Owner Email
                <input
                  type="email"
                  value={onboardingForm.ownerEmail}
                  onChange={(event) => updateOnboardForm('ownerEmail', event.target.value)}
                  placeholder="owner@company.com"
                  required
                />
              </label>

              <label>
                Admin Username
                <input
                  value={onboardingForm.adminUsername}
                  onChange={(event) => updateOnboardForm('adminUsername', event.target.value)}
                  placeholder="Admin login username"
                  required
                />
              </label>

              <label>
                Admin Password
                <input
                  type="password"
                  value={onboardingForm.adminPassword}
                  onChange={(event) => updateOnboardForm('adminPassword', event.target.value)}
                  placeholder="Set initial password"
                  minLength={8}
                  title="Password must be at least 8 characters"
                  required
                />
                <small className="subtle">Minimum 8 characters required.</small>
              </label>

              <label>
                City
                <input
                  value={onboardingForm.city}
                  onChange={(event) => updateOnboardForm('city', event.target.value)}
                  placeholder="City"
                  required
                />
              </label>

              <label>
                State
                <input
                  value={onboardingForm.state}
                  onChange={(event) => updateOnboardForm('state', event.target.value)}
                  placeholder="State"
                  required
                />
              </label>

              <div className="login-actions-row">
                <button type="submit" disabled={busy} className="login-submit">
                  {busy ? 'Registering...' : 'Create Company Workspace'}
                </button>
                <button type="button" className="link-btn" onClick={onBackToLogin}>
                  Back to Login
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : (
        <div className="login-card">
          <section className="login-brand-panel">
            <div className="login-glow" aria-hidden="true" />
            <p className="eyebrow">Smart Dairy ERP</p>
            <h1 className="login-title">Operations Workspace</h1>
            <p className="subtle">
              Unified multi-tenant operations for procurement, production, sales, settlements, and analytics.
            </p>
            <div className="login-points">
              <p>Tenant-first login for shared database architecture</p>
              <p>Company-name based tenant resolution workflow</p>
              <p>JWT session with branch-aware operational controls</p>
            </div>
            <div className="login-pill-row">
              <span className="login-pill">API: /api/v1/auth/login</span>
              <span className="login-pill">Header: X-Tenant-Id</span>
            </div>
          </section>

          <section className="login-form-panel">
            <h2>Sign In</h2>
            <p className="subtle">Use your authorized credentials to continue.</p>
            <p className="subtle">Header: X-Tenant-Id</p>
            <form className="form" onSubmit={onLogin}>
              <label>
                Username
                <input
                  value={loginUsername}
                  onChange={(event) => setLoginUsername(event.target.value)}
                  placeholder="Enter username"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Enter password"
                  required
                />
              </label>

              <label>
                Company name
                <input
                  value={loginCompanyName}
                  onChange={(event) => onLoginCompanyChange(event.target.value)}
                  onBlur={() => {
                    void onResolveCompanyTenantUuid(loginCompanyName)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      void onResolveCompanyTenantUuid(loginCompanyName)
                    }
                  }}
                  placeholder="Enter registered company name"
                  list="known-company-names"
                />
                {resolvingTenantUuid && <small className="subtle">Resolving tenant context...</small>}
                {resolvedTenantUuid && <small className="subtle">Tenant context resolved successfully.</small>}
                {tenantLookupNote && <small className="subtle">{tenantLookupNote}</small>}
                {tenantDirectory.length > 0 && (
                  <datalist id="known-company-names">
                    {tenantDirectory.map((entry) => (
                      <option key={normalizeCompanyName(entry.companyName)} value={entry.companyName} />
                    ))}
                  </datalist>
                )}
              </label>

              <label>
                Company Tenant
                <input
                  value={loginTenantUuid}
                  onChange={(event) => onLoginTenantChange(event.target.value)}
                  placeholder="Auto resolved from company name"
                />
                <small className="subtle">Auto-filled when available. You can enter tenant ID manually if needed.</small>
              </label>

              <button type="submit" disabled={busy} className="login-submit">
                {busy ? 'Signing in...' : 'Sign in to Workspace'}
              </button>
            </form>

            <div className="public-auth-links">
              <button type="button" className="link-btn register-link" onClick={onOpenOnboard}>
                Register your company
              </button>
              <button type="button" className="link-btn forgot-link" onClick={onForgotPassword}>
                Forgot Password?
              </button>
            </div>

            {loginDebug && <p className="subtle login-debug">{loginDebug}</p>}
          </section>
        </div>
      )}
    </div>
  )
}
