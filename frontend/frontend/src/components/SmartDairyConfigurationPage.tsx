import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { api, getSavedAuth } from '../lib/api'
import { ApiError } from '../lib/apiResponseParsers'
import type {
  CreateSmartDairyConfigurationRequest,
  SmartDairyConfigurationResponse,
} from '../types/api'

type SmartDairyConfigurationForm = CreateSmartDairyConfigurationRequest

type BooleanField = {
  key: keyof SmartDairyConfigurationForm
  label: string
  description: string
}

type NumberField = {
  key: 'morningCollectionLimit' | 'eveningCollectionLimit' | 'maxBackdatedDays'
  label: string
  description: string
  min: number
}

const DEFAULT_CONFIGURATION_FORM: SmartDairyConfigurationForm = {
  collectionFat: true,
  collectionMava: true,
  morningCollectionLimit: 1,
  eveningCollectionLimit: 1,
  allowMultipleCollection: false,
  allowLoan: true,
  allowAdvance: true,
  allowLoanAndAdvanceTogether: false,
  dailyPayment: true,
  weeklyPayment: true,
  monthlyPayment: true,
  allowBackdatedEntry: true,
  maxBackdatedDays: 7,
  autoLock: false,
}

const BOOLEAN_GROUPS: Array<{ title: string; fields: BooleanField[] }> = [
  {
    title: 'Milk Collection Settings',
    fields: [
      {
        key: 'collectionFat',
        label: 'Collection FAT',
        description: 'Enable FAT input and rules for collection entry.',
      },
      {
        key: 'collectionMava',
        label: 'Collection MAVA',
        description: 'Enable MAVA input and rules for collection entry.',
      },
      {
        key: 'allowMultipleCollection',
        label: 'Allow Multiple Collection',
        description: 'Allow multi-farmer or multi-row collection flow.',
      },
    ],
  },
  {
    title: 'Farmer Finance Settings',
    fields: [
      {
        key: 'allowLoan',
        label: 'Allow Loan',
        description: 'Show and permit loan recovery actions.',
      },
      {
        key: 'allowAdvance',
        label: 'Allow Advance',
        description: 'Show and permit advance recovery actions.',
      },
      {
        key: 'allowLoanAndAdvanceTogether',
        label: 'Loan + Advance Together',
        description: 'Allow both deductions in the same settlement.',
      },
    ],
  },
  {
    title: 'Payment Settings',
    fields: [
      {
        key: 'dailyPayment',
        label: 'Daily Payment',
        description: 'Enable daily settlement workflow.',
      },
      {
        key: 'weeklyPayment',
        label: 'Weekly Payment',
        description: 'Enable weekly settlement workflow.',
      },
      {
        key: 'monthlyPayment',
        label: 'Monthly Payment',
        description: 'Enable monthly settlement workflow.',
      },
    ],
  },
  {
    title: 'Collection Control',
    fields: [
      {
        key: 'allowBackdatedEntry',
        label: 'Allow Backdated Entry',
        description: 'Allow collection entry for previous dates.',
      },
      {
        key: 'autoLock',
        label: 'Auto Lock',
        description: 'Automatically lock collection after processing.',
      },
    ],
  },
]

const NUMBER_FIELDS: NumberField[] = [
  {
    key: 'morningCollectionLimit',
    label: 'Morning Collection Limit',
    description: 'Minimum collection rows allowed for morning.',
    min: 1,
  },
  {
    key: 'eveningCollectionLimit',
    label: 'Evening Collection Limit',
    description: 'Minimum collection rows allowed for evening.',
    min: 1,
  },
  {
    key: 'maxBackdatedDays',
    label: 'Maximum Backdated Days',
    description: 'How many days back the customer may enter data.',
    min: 1,
  },
]

function cloneDefaults(): SmartDairyConfigurationForm {
  return { ...DEFAULT_CONFIGURATION_FORM }
}

function mapResponseToForm(response: SmartDairyConfigurationResponse): SmartDairyConfigurationForm {
  return {
    collectionFat: response.collectionFat,
    collectionMava: response.collectionMava,
    morningCollectionLimit: response.morningCollectionLimit,
    eveningCollectionLimit: response.eveningCollectionLimit,
    allowMultipleCollection: response.allowMultipleCollection,
    allowLoan: response.allowLoan,
    allowAdvance: response.allowAdvance,
    allowLoanAndAdvanceTogether: response.allowLoanAndAdvanceTogether,
    dailyPayment: response.dailyPayment,
    weeklyPayment: response.weeklyPayment,
    monthlyPayment: response.monthlyPayment,
    allowBackdatedEntry: response.allowBackdatedEntry,
    maxBackdatedDays: response.maxBackdatedDays,
    autoLock: response.autoLock,
  }
}

function formatDateTime(value: string) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 16)
}

function getToggleStateLabel(value: boolean) {
  return value ? 'Enabled' : 'Disabled'
}

export function SmartDairyConfigurationPage() {
  const authToken = getSavedAuth().token
  const [configurationUuid, setConfigurationUuid] = useState('')
  const [configurationStatus, setConfigurationStatus] = useState<SmartDairyConfigurationResponse | null>(null)
  const [form, setForm] = useState<SmartDairyConfigurationForm>(() => cloneDefaults())
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isEditMode = Boolean(configurationUuid)

  const headerSummary = useMemo(() => [
    { label: 'Tenant mode', value: isEditMode ? 'Override saved' : 'Default draft' },
    { label: 'Collection mode', value: form.allowMultipleCollection ? 'Multi' : 'Single' },
    { label: 'Payment modes', value: [form.dailyPayment, form.weeklyPayment, form.monthlyPayment].filter(Boolean).length.toString() },
    { label: 'Backdated days', value: String(form.maxBackdatedDays) },
  ], [form.allowMultipleCollection, form.dailyPayment, form.maxBackdatedDays, form.monthlyPayment, form.weeklyPayment, isEditMode])

  const loadConfiguration = async () => {
    if (!authToken) {
      setError('Login again to manage Smart Dairy configuration.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const response = await api.getCurrentTenantConfiguration(authToken)
      setConfigurationUuid(response.uuid)
      setConfigurationStatus(response)
      setForm(mapResponseToForm(response))
      setSuccess('Configuration loaded from backend.')
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setConfigurationUuid('')
        setConfigurationStatus(null)
        setForm(cloneDefaults())
        setSuccess('No saved configuration found. Backend defaults are ready to save.')
        return
      }

      setError(error instanceof Error ? error.message : 'Unable to load configuration.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadConfiguration()
  }, [authToken])

  const updateBooleanField = (field: keyof SmartDairyConfigurationForm, value: boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateNumberField = (field: NumberField['key'], value: string) => {
    const nextValue = value === '' ? 0 : Number(value)
    setForm((prev) => ({ ...prev, [field]: nextValue }))
  }

  const saveConfiguration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!authToken) {
      setError('Login again to save configuration.')
      return
    }

    setBusy(true)
    setError('')
    setSuccess('')

    try {
      const response = configurationUuid
        ? await api.updateSmartDairyConfiguration(authToken, configurationUuid, form)
        : await api.createSmartDairyConfiguration(authToken, form)

      setConfigurationUuid(response.uuid)
      setConfigurationStatus(response)
      setForm(mapResponseToForm(response))
      setSuccess(configurationUuid ? 'Configuration updated successfully.' : 'Configuration created successfully.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to save configuration.')
    } finally {
      setBusy(false)
    }
  }

  const resetToDefaults = () => {
    setForm(cloneDefaults())
    setSuccess('Form reset to backend defaults.')
    setError('')
  }

  const deleteConfiguration = async () => {
    if (!authToken || !configurationUuid) {
      return
    }

    const proceed = window.confirm('Delete the saved configuration for this tenant?')
    if (!proceed) {
      return
    }

    setBusy(true)
    setError('')
    setSuccess('')

    try {
      await api.deleteSmartDairyConfiguration(authToken, configurationUuid)
      setConfigurationUuid('')
      setConfigurationStatus(null)
      setForm(cloneDefaults())
      setSuccess('Configuration deleted. Defaults are active again.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to delete configuration.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel panel-smart-dairy-configuration">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Tenant Settings</p>
          <h2>Smart Dairy Configuration</h2>
          <p className="subtle">Customer-controlled flags with backend defaults. Save one record per tenant and keep the active/inactive behavior predictable.</p>
        </div>
        <button type="button" onClick={() => void loadConfiguration()} disabled={loading || busy}>
          Reload
        </button>
      </div>

      <div className="smart-config-layout">
        <article className="smart-config-summary-card">
          <div className="smart-config-summary-head">
            <div>
              <p className="eyebrow">Configuration Snapshot</p>
              <h3>{isEditMode ? 'Saved tenant configuration' : 'Unsaved default configuration'}</h3>
            </div>
            <span className={configurationStatus?.active === false ? 'smart-config-status smart-config-status-inactive' : 'smart-config-status smart-config-status-active'}>
              {configurationStatus?.active === false ? 'INACTIVE' : 'ACTIVE'}
            </span>
          </div>

          <div className="smart-config-summary-grid">
            {headerSummary.map((item) => (
              <article key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>

          <div className="smart-config-record-meta">
            <span>Configuration UUID</span>
            <strong>{configurationUuid || 'Not saved yet'}</strong>
            <span>Created At</span>
            <strong>{configurationStatus ? formatDateTime(configurationStatus.createdAt) : '-'}</strong>
            <span>Updated At</span>
            <strong>{configurationStatus ? formatDateTime(configurationStatus.updatedAt) : '-'}</strong>
          </div>

          <p className="subtle smart-config-note">
            When a field is not saved by the customer, the backend default remains in effect. This keeps the flow stable even before the tenant explicitly configures every option.
          </p>
        </article>

        <form className="smart-config-form" onSubmit={saveConfiguration}>
          {BOOLEAN_GROUPS.map((group) => (
            <section className="smart-config-card" key={group.title}>
              <div className="smart-config-card-head">
                <h4>{group.title}</h4>
                <p>Toggle customer-specific behavior for this tenant.</p>
              </div>

              <div className="smart-config-toggle-grid">
                {group.fields.map((field) => {
                  const value = form[field.key]
                  return (
                    <label key={field.key} className="smart-config-toggle-card">
                      <div>
                        <span>{field.label}</span>
                        <small>{field.description}</small>
                      </div>
                      <div className="smart-config-toggle-control">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(event) => updateBooleanField(field.key, event.target.checked)}
                        />
                        <strong>{getToggleStateLabel(Boolean(value))}</strong>
                      </div>
                    </label>
                  )
                })}
              </div>
            </section>
          ))}

          <section className="smart-config-card smart-config-card-wide">
            <div className="smart-config-card-head">
              <h4>Collection Limits</h4>
              <p>Use compact numeric defaults that can be customized per tenant.</p>
            </div>

            <div className="smart-config-number-grid">
              {NUMBER_FIELDS.map((field) => (
                <label key={field.key} className="smart-config-number-field">
                  <span>{field.label}</span>
                  <input
                    type="number"
                    min={field.min}
                    value={form[field.key]}
                    onChange={(event) => updateNumberField(field.key, event.target.value)}
                  />
                  <small>{field.description}</small>
                </label>
              ))}
            </div>
          </section>

          <div className="smart-config-actions">
            <button type="button" className="payment-secondary-btn" onClick={resetToDefaults} disabled={busy || loading}>
              Reset Defaults
            </button>
            <button type="button" className="payment-secondary-btn" onClick={() => void deleteConfiguration()} disabled={busy || loading || !configurationUuid}>
              Delete Saved Config
            </button>
            <button type="submit" className="payment-primary-btn" disabled={busy || loading}>
              {isEditMode ? 'Update Configuration' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      {success && <p className="subtle smart-config-feedback smart-config-feedback-success">{success}</p>}
      {error && <p className="field-error smart-config-feedback">{error}</p>}
    </section>
  )
}
