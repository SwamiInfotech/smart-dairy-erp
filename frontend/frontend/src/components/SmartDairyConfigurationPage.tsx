import type { FormEvent } from 'react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { api, getSavedAuth } from '../lib/api'
import { ApiError } from '../lib/apiResponseParsers'
import type {
  CreateSmartDairyConfigurationRequest,
  SmartDairyConfigurationResponse,
} from '../types/api'

type SmartDairyConfigurationForm = Omit<
  CreateSmartDairyConfigurationRequest,
  'dailyPayment' | 'weeklyPayment' | 'monthlyPayment'
>
type CollectionTypeOption = 'FAT' | 'SNF' | 'MAVA'
type CollectionEntryModeOption = 'SINGLE' | 'MULTI'

type BooleanField = {
  key: keyof SmartDairyConfigurationForm
  label: string
  description: string
}

type NumberField = {
  key: 'morningCollectionLimit' | 'eveningCollectionLimit'
  label: string
  description: string
}

const DEFAULT_CONFIGURATION_FORM: SmartDairyConfigurationForm = {
  collectionFat: true,
  collectionMava: true,
  morningCollectionLimit: 1,
  eveningCollectionLimit: 1,
  allowMultipleCollection: true,
  allowLoan: true,
  allowAdvance: true,
  allowLoanAndAdvanceTogether: false,
  allowBackdatedEntry: true,
  maxBackdatedDays: 7,
  autoLock: false,
}

const BOOLEAN_GROUPS: Array<{ title: string; fields: BooleanField[] }> = [
  {
    title: 'Milk Collection Settings',
    fields: [],
  },
  {
    title: 'Farmer Finance Settings',
    fields: [
      {
        key: 'allowLoan',
        label: 'Allow Loan in the Milk Collection',
        description: 'Show and permit loan recovery actions.',
      },
      {
        key: 'allowAdvance',
        label: 'Allow Advance in the Milk Collection',
        description: 'Show and permit advance recovery actions.',
      },
      {
        key: 'allowLoanAndAdvanceTogether',
        label: 'Loan + Advance Together in the Milk Collection',
        description: 'Allow both deductions in the same settlement.',
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
    label: 'How many times Morning milk to be supplied',
    description: 'Minimum collection rows allowed for morning.',
  },
  {
    key: 'eveningCollectionLimit',
    label: 'How many times Evening milk to be supplied',
    description: 'Minimum collection rows allowed for evening.',
  },
]

type CollectionLimitOption = 'ONE_TIME' | 'MULTIPLE_TIME'

const COLLECTION_TYPE_OPTIONS: Array<{
  value: CollectionTypeOption
  label: string
  description: string
  disabled?: boolean
}> = [
  {
    value: 'FAT',
    label: 'FAT',
    description: 'Enable FAT-based collection entry and quality rules.',
  },
  {
    value: 'SNF',
    label: 'SNF',
    description: 'Reserved for future SNF-based collection rules.',
    disabled: true,
  },
  {
    value: 'MAVA',
    label: 'MAVA',
    description: 'Enable MAVA-based collection entry and quality rules.',
  },
]

function cloneDefaults(): SmartDairyConfigurationForm {
  return { ...DEFAULT_CONFIGURATION_FORM }
}

function mapResponseToForm(response: SmartDairyConfigurationResponse): SmartDairyConfigurationForm {
  const allowMultipleCollection = true

  return {
    collectionFat: response.collectionFat,
    collectionMava: response.collectionMava,
    morningCollectionLimit: response.morningCollectionLimit,
    eveningCollectionLimit: response.eveningCollectionLimit,
    allowMultipleCollection,
    allowLoan: response.allowLoan,
    allowAdvance: response.allowAdvance,
    allowLoanAndAdvanceTogether: response.allowLoanAndAdvanceTogether,
    allowBackdatedEntry: response.allowBackdatedEntry,
    maxBackdatedDays: response.allowBackdatedEntry ? response.maxBackdatedDays : 0,
    autoLock: response.autoLock,
  }
}

function deriveCollectionTypes(form: SmartDairyConfigurationForm): CollectionTypeOption[] {
  const selected: CollectionTypeOption[] = []
  if (form.collectionFat) selected.push('FAT')
  if (form.collectionMava) selected.push('MAVA')
  return selected
}

function applyCollectionTypesToForm(
  prev: SmartDairyConfigurationForm,
  selectedTypes: CollectionTypeOption[],
): SmartDairyConfigurationForm {
  return {
    ...prev,
    collectionFat: selectedTypes.includes('FAT'),
    collectionMava: selectedTypes.includes('MAVA'),
  }
}

function formatDateTime(value: string) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 16)
}

function getToggleStateLabel(value: boolean) {
  return value ? 'Enabled' : 'Disabled'
}

function getCollectionModeLabel(allowMultipleCollection: boolean) {
  return allowMultipleCollection ? 'Multi Farmer' : 'Single Farmer'
}

function deriveCollectionEntryModes(form: SmartDairyConfigurationForm): CollectionEntryModeOption[] {
  return (form.allowMultipleCollection ?? true) ? ['MULTI'] : ['SINGLE']
}

function applyCollectionEntryModesToForm(
  prev: SmartDairyConfigurationForm,
  selectedModes: CollectionEntryModeOption[],
): SmartDairyConfigurationForm {
  return {
    ...prev,
    allowMultipleCollection: selectedModes.includes('MULTI'),
  }
}

function deriveCollectionLimitOption(value: number): CollectionLimitOption {
  return value > 1 ? 'MULTIPLE_TIME' : 'ONE_TIME'
}

function getCollectionLimitLabel(value: number) {
  return deriveCollectionLimitOption(value) === 'MULTIPLE_TIME' ? 'Multiple Time' : 'One Time'
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
  const selectedCollectionTypes = useMemo(() => deriveCollectionTypes(form), [form])
  const selectedCollectionTypeLabel = useMemo(() => {
    if (!selectedCollectionTypes.length) return 'None selected'
    return selectedCollectionTypes.join(' + ')
  }, [selectedCollectionTypes])

  const headerSummary = useMemo(() => [
    { label: 'Tenant mode', value: isEditMode ? 'Override saved' : 'Default draft' },
    { label: 'Collection mode', value: form.allowMultipleCollection ? 'Multi' : 'Single' },
    { label: 'Collection types', value: selectedCollectionTypeLabel },
    { label: 'Backdated days', value: String(form.maxBackdatedDays) },
  ], [
    form.allowMultipleCollection,
    form.maxBackdatedDays,
    isEditMode,
    selectedCollectionTypeLabel,
  ])

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
    setForm((prev) => {
      if (field === 'allowBackdatedEntry') {
        return {
          ...prev,
          allowBackdatedEntry: value,
          maxBackdatedDays: value ? (prev.maxBackdatedDays > 0 ? prev.maxBackdatedDays : 7) : 0,
        }
      }

      return { ...prev, [field]: value }
    })
  }

  const updateNumberField = (field: NumberField['key'] | 'maxBackdatedDays', value: string) => {
    const nextValue = value === '' ? 0 : Number(value)
    setForm((prev) => ({ ...prev, [field]: nextValue }))
  }

  const updateCollectionLimitOption = (
    field: NumberField['key'],
    mode: CollectionLimitOption,
    checked: boolean,
  ) => {
    setForm((prev) => {
      const currentValue = prev[field]
      const currentMode = deriveCollectionLimitOption(currentValue)

      if (!checked && currentMode === mode) {
        return { ...prev, [field]: 1 }
      }

      if (checked) {
        return {
          ...prev,
          [field]: mode === 'ONE_TIME' ? 1 : currentValue > 1 ? currentValue : 2,
        }
      }

      return prev
    })
  }

  const updateCollectionModeOption = (mode: CollectionEntryModeOption, checked: boolean) => {
    setForm((prev) => {
      const current = deriveCollectionEntryModes(prev)
      const next = checked
        ? current.includes(mode)
          ? current
          : [...current.filter((item) => item !== 'SINGLE' && item !== 'MULTI'), mode]
        : current.filter((item) => item !== mode)

      const normalized: CollectionEntryModeOption[] = next.length ? next : ['MULTI']
      return applyCollectionEntryModesToForm(prev, normalized)
    })
  }

  const updateCollectionTypeOption = (type: CollectionTypeOption, checked: boolean) => {
    setForm((prev) => {
      const current = deriveCollectionTypes(prev)
      const next = checked
        ? current.includes(type)
          ? current
          : [...current, type]
        : current.filter((item) => item !== type)
      return applyCollectionTypesToForm(prev, next)
    })
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
      const payload: CreateSmartDairyConfigurationRequest = {
        ...form,
        // Payment Settings removed from page; keep API contract stable.
        dailyPayment: true,
        weeklyPayment: true,
        monthlyPayment: true,
      }

      const response = configurationUuid
        ? await api.updateSmartDairyConfiguration(authToken, configurationUuid, payload)
        : await api.createSmartDairyConfiguration(authToken, payload)

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
          <div className="smart-config-sheet-wrap">
            <table className="smart-config-sheet">
              <thead>
                <tr>
                  <th>Setting</th>
                  <th>Description</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {BOOLEAN_GROUPS.map((group, groupIndex) => (
                  <Fragment key={group.title}>
                    <tr key={`${group.title}-group`} className="smart-config-sheet-group">
                      <td colSpan={3}>{group.title}</td>
                    </tr>

                    {groupIndex === 0 && (
                      <tr className="smart-config-sheet-row" key="collection-type-row">
                        <td>Collection Type</td>
                        <td>Select one or more quality modes for this Dairy.</td>
                        <td>
                          <div className="smart-config-sheet-multi-list" role="group" aria-label="Collection Type multi select">
                            {COLLECTION_TYPE_OPTIONS.map((option) => {
                              const checked = selectedCollectionTypes.includes(option.value)
                              return (
                                <label
                                  key={option.value}
                                  className={
                                    option.disabled
                                      ? 'smart-config-sheet-check is-disabled'
                                      : 'smart-config-sheet-check'
                                  }
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={option.disabled}
                                    onChange={(event) =>
                                      updateCollectionTypeOption(option.value, event.target.checked)
                                    }
                                  />
                                  <span>{option.label}</span>
                                </label>
                              )
                            })}
                          </div>
                          <small className="smart-config-sheet-note">
                            Multi-select values are currently saved as FAT/MAVA flags.
                          </small>
                        </td>
                      </tr>
                    )}

                    {groupIndex === 0 && (
                      <tr className="smart-config-sheet-row" key="collection-mode-row">
                        <td>Collection Entry Mode</td>
                        <td>Choose whether collection entry should be Single Farmer or Multi Farmer.</td>
                        <td>
                          <div className="smart-config-sheet-multi-list" role="group" aria-label="Collection Entry Mode multi select">
                            {(['SINGLE', 'MULTI'] as const).map((mode) => {
                              const checked = deriveCollectionEntryModes(form).includes(mode)
                              return (
                                <label key={mode} className="smart-config-sheet-check">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => updateCollectionModeOption(mode, event.target.checked)}
                                  />
                                  <span>{mode === 'SINGLE' ? 'Single Farmer' : 'Multi Farmer'}</span>
                                </label>
                              )
                            })}
                          </div>
                          <small className="smart-config-sheet-note">
                            Selected mode: {getCollectionModeLabel(form.allowMultipleCollection)}.
                          </small>
                        </td>
                      </tr>
                    )}

                    {group.fields.map((field) => {
                      const value = form[field.key]
                      return (
                        <Fragment key={field.key}>
                          <tr className="smart-config-sheet-row">
                            <td>{field.label}</td>
                            <td>{field.description}</td>
                            <td>
                              <label className="smart-config-sheet-toggle">
                                <input
                                  type="checkbox"
                                  checked={Boolean(value)}
                                  onChange={(event) => updateBooleanField(field.key, event.target.checked)}
                                />
                                <span>{getToggleStateLabel(Boolean(value))}</span>
                              </label>
                            </td>
                          </tr>

                          {field.key === 'allowBackdatedEntry' && (
                            <tr className="smart-config-sheet-row" key="max-backdated-days-row">
                              <td>Maximum Backdated Days</td>
                              <td>How many days back the customer may enter data.</td>
                              <td>
                                <input
                                  className="smart-config-sheet-number"
                                  type="number"
                                  min={1}
                                  disabled={!form.allowBackdatedEntry}
                                  value={form.maxBackdatedDays}
                                  onChange={(event) => updateNumberField('maxBackdatedDays', event.target.value)}
                                />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })}
                  </Fragment>
                ))}

                <tr className="smart-config-sheet-group">
                  <td colSpan={3}>Collection Limits</td>
                </tr>

                {NUMBER_FIELDS.map((field) => (
                  <tr key={field.key} className="smart-config-sheet-row">
                    <td>{field.label}</td>
                    <td>{field.description}</td>
                    <td>
                      <div className="smart-config-sheet-multi-list" role="group" aria-label={`${field.label} selection`}>
                        {(['ONE_TIME', 'MULTIPLE_TIME'] as const).map((mode) => {
                          const checked = deriveCollectionLimitOption(form[field.key]) === mode
                          return (
                            <label key={`${field.key}-${mode}`} className="smart-config-sheet-check">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) => updateCollectionLimitOption(field.key, mode, event.target.checked)}
                              />
                              <span>{mode === 'ONE_TIME' ? 'One Time' : 'Multiple Time'}</span>
                            </label>
                          )
                        })}
                      </div>
                      <small className="smart-config-sheet-note">
                        Selected: {getCollectionLimitLabel(form[field.key])}.
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
