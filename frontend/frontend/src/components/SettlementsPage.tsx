import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { api, getSavedAuth } from '../lib/api'
import { toInputDate } from '../lib/appCoreUtils'
import type { FarmerResponse, SettlementResponse, SettlementStatus } from '../types/api'

type SettlementFilters = {
  farmerUuid: string
  status: '' | SettlementStatus
  fromDate: string
  toDate: string
}

type SettlementFormState = {
  farmerUuid: string
  fromDate: string
  toDate: string
  bonusAmount: number
  loanRecovery: number
  advanceRecovery: number
  otherDeduction: number
  remarks: string
}

type SettlementsPageProps = {
  busy: boolean
  farmers: FarmerResponse[]
  branchDisplay: string
  loadFarmers: () => void | Promise<void>
}

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDisplayDate(value: string) {
  const normalized = (value || '').slice(0, 10)
  if (!normalized) return '-'

  const parts = normalized.split('-')
  if (parts.length !== 3) return normalized

  const [year, month, day] = parts
  if (!year || !month || !day) return normalized

  return `${day}-${month}-${year}`
}

function startOfMonthInputDate() {
  const date = new Date()
  return toInputDate(new Date(date.getFullYear(), date.getMonth(), 1))
}

function addDaysToInputDate(inputDate: string, days: number) {
  const date = new Date(`${inputDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return inputDate
  date.setDate(date.getDate() + days)
  return toInputDate(date)
}

function inclusiveDaySpan(fromDate: string, toDate: string) {
  const from = new Date(`${fromDate}T00:00:00`)
  const to = new Date(`${toDate}T00:00:00`)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) return 1
  const diffMs = to.getTime() - from.getTime()
  return Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1
}

export function SettlementsPage({ busy, farmers, branchDisplay, loadFarmers }: SettlementsPageProps) {
  const authToken = getSavedAuth().token
  const today = toInputDate(new Date())

  const [filters, setFilters] = useState<SettlementFilters>({
    farmerUuid: '',
    status: '',
    fromDate: startOfMonthInputDate(),
    toDate: today,
  })
  const [form, setForm] = useState<SettlementFormState>({
    farmerUuid: '',
    fromDate: startOfMonthInputDate(),
    toDate: today,
    bonusAmount: 0,
    loanRecovery: 0,
    advanceRecovery: 0,
    otherDeduction: 0,
    remarks: '',
  })
  const [settlements, setSettlements] = useState<SettlementResponse[]>([])
  const [editingSettlementUuid, setEditingSettlementUuid] = useState('')
  const [actionBusy, setActionBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    if (farmers.length === 0) return

    setFilters((prev) => {
      if (prev.farmerUuid) return prev
      return { ...prev, farmerUuid: farmers[0].uuid }
    })

    setForm((prev) => {
      if (prev.farmerUuid) return prev
      return { ...prev, farmerUuid: farmers[0].uuid }
    })
  }, [farmers])

  const loadSettlements = async () => {
    if (!authToken) return

    setActionError('')
    const page = await api.searchSettlements(authToken, {
      farmerUuid: filters.farmerUuid || undefined,
      status: filters.status || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      page: pageIndex,
      size: pageSize,
    })

    setSettlements(page.content || [])
    setTotalPages(Number(page.totalPages || 0))
    setTotalElements(Number(page.totalElements || 0))
  }

  useEffect(() => {
    if (!authToken) return

    void loadSettlements().catch((error) => {
      setActionError(error instanceof Error ? error.message : 'Failed to load settlements.')
    })
  }, [authToken, filters.farmerUuid, filters.fromDate, filters.status, filters.toDate, pageIndex, pageSize])

  const paidCount = useMemo(() => settlements.filter((item) => item.status === 'PAID').length, [settlements])
  const generatedCount = useMemo(() => settlements.filter((item) => item.status === 'GENERATED').length, [settlements])
  const payableTotal = useMemo(() => settlements.reduce((sum, item) => sum + Number(item.netPayable || 0), 0), [settlements])

  const visibleFrom = settlements.length === 0 ? 0 : pageIndex * pageSize + 1
  const visibleTo = settlements.length === 0 ? 0 : pageIndex * pageSize + settlements.length

  const resetForm = () => {
    setEditingSettlementUuid('')
    setForm((prev) => ({
      ...prev,
      bonusAmount: 0,
      loanRecovery: 0,
      advanceRecovery: 0,
      otherDeduction: 0,
      remarks: '',
    }))
  }

  const onGenerateOrUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!authToken) {
      setActionError('You are not logged in. Please login again.')
      return
    }

    if (!form.farmerUuid && !editingSettlementUuid) {
      setActionError('Select a farmer before saving settlement.')
      return
    }

    if (!form.fromDate && !editingSettlementUuid) {
      setActionError('From date is required.')
      return
    }

    if (!form.toDate && !editingSettlementUuid) {
      setActionError('To date is required.')
      return
    }

    setActionBusy(true)
    setActionError('')
    setActionSuccess('')

    try {
      if (editingSettlementUuid) {
        await api.updateSettlement(authToken, editingSettlementUuid, {
          bonusAmount: Number(form.bonusAmount || 0),
          loanRecovery: Number(form.loanRecovery || 0),
          advanceRecovery: Number(form.advanceRecovery || 0),
          otherDeduction: Number(form.otherDeduction || 0),
          remarks: form.remarks.trim(),
        })
        setActionSuccess('Settlement updated successfully.')
      } else {
        await api.generateSettlement(authToken, {
          farmerUuid: form.farmerUuid,
          fromDate: form.fromDate,
          toDate: form.toDate,
          bonusAmount: Number(form.bonusAmount || 0),
          loanRecovery: Number(form.loanRecovery || 0),
          advanceRecovery: Number(form.advanceRecovery || 0),
          otherDeduction: Number(form.otherDeduction || 0),
          remarks: form.remarks.trim(),
        })
        setActionSuccess('Settlement generated successfully.')
      }

      resetForm()
      await loadSettlements()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to save settlement.')
    } finally {
      setActionBusy(false)
    }
  }

  const onClonePreviousPeriod = async () => {
    if (!authToken) {
      setActionError('You are not logged in. Please login again.')
      return
    }

    if (!form.farmerUuid) {
      setActionError('Select a farmer before cloning previous period.')
      return
    }

    setActionBusy(true)
    setActionError('')
    setActionSuccess('')

    try {
      const page = await api.searchSettlements(authToken, {
        farmerUuid: form.farmerUuid,
        page: 0,
        size: 200,
      })

      const farmerRows = (page.content || []).filter((item) => item.farmerUuid === form.farmerUuid)
      if (farmerRows.length === 0) {
        setActionError('No previous settlement found for selected farmer.')
        return
      }

      const latest = farmerRows.sort((left, right) => {
        const leftKey = `${(left.toDate || '').slice(0, 10)}|${(left.fromDate || '').slice(0, 10)}`
        const rightKey = `${(right.toDate || '').slice(0, 10)}|${(right.fromDate || '').slice(0, 10)}`
        return rightKey.localeCompare(leftKey)
      })[0]

      const latestFrom = (latest.fromDate || '').slice(0, 10)
      const latestTo = (latest.toDate || '').slice(0, 10)
      const spanDays = inclusiveDaySpan(latestFrom, latestTo)
      const nextFrom = addDaysToInputDate(latestTo, 1)
      const nextTo = addDaysToInputDate(nextFrom, spanDays - 1)

      setEditingSettlementUuid('')
      setForm((prev) => ({
        ...prev,
        farmerUuid: latest.farmerUuid || prev.farmerUuid,
        fromDate: nextFrom,
        toDate: nextTo,
        bonusAmount: Number(latest.bonusAmount || 0),
        loanRecovery: Number(latest.loanRecovery || 0),
        advanceRecovery: Number(latest.advanceRecovery || 0),
        otherDeduction: Number(latest.otherDeduction || 0),
        remarks: latest.remarks || prev.remarks,
      }))

      setActionSuccess(`Cloned previous period from ${formatDisplayDate(latestFrom)} to ${formatDisplayDate(latestTo)}.`)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to clone previous settlement period.')
    } finally {
      setActionBusy(false)
    }
  }

  const onEditSettlement = (item: SettlementResponse) => {
    setEditingSettlementUuid(item.uuid)
    setForm((prev) => ({
      ...prev,
      farmerUuid: item.farmerUuid || prev.farmerUuid,
      fromDate: (item.fromDate || '').slice(0, 10),
      toDate: (item.toDate || '').slice(0, 10),
      bonusAmount: Number(item.bonusAmount || 0),
      loanRecovery: Number(item.loanRecovery || 0),
      advanceRecovery: Number(item.advanceRecovery || 0),
      otherDeduction: Number(item.otherDeduction || 0),
      remarks: item.remarks || '',
    }))
  }

  const onPaySettlement = async (item: SettlementResponse) => {
    if (!authToken || item.status !== 'GENERATED') return

    setActionBusy(true)
    setActionError('')
    setActionSuccess('')

    try {
      await api.paySettlement(authToken, item.uuid)
      await loadSettlements()
      setActionSuccess('Settlement paid successfully.')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to pay settlement.')
    } finally {
      setActionBusy(false)
    }
  }

  const onDeleteSettlement = async (item: SettlementResponse) => {
    if (!authToken) return

    const confirmed = window.confirm(`Delete settlement ${item.settlementNo}?`)
    if (!confirmed) return

    setActionBusy(true)
    setActionError('')
    setActionSuccess('')

    try {
      await api.deleteSettlement(authToken, item.uuid)
      await loadSettlements()
      setActionSuccess('Settlement deleted successfully.')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to delete settlement.')
    } finally {
      setActionBusy(false)
    }
  }

  const onPrintSettlement = async (item: SettlementResponse) => {
    if (!authToken) return

    setActionBusy(true)
    setActionError('')
    setActionSuccess('')

    try {
      const pdfBlob = await api.getSettlementPdf(authToken, item.uuid)
      const pdfUrl = URL.createObjectURL(pdfBlob)
      const popup = window.open(pdfUrl, '_blank', 'noopener,noreferrer')

      if (!popup) {
        const link = document.createElement('a')
        link.href = pdfUrl
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        link.download = `${item.settlementNo}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000)
      setActionSuccess('Settlement PDF generated successfully.')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to generate settlement PDF.')
    } finally {
      setActionBusy(false)
    }
  }

  return (
    <section className="panel panel-settlements">
      <div className="panel-head">
        <h2>Settlements</h2>
        <div className="settlements-head-actions">
          <button type="button" onClick={() => void loadFarmers()} disabled={busy || actionBusy}>
            Reload Farmers
          </button>
          <button type="button" onClick={() => void loadSettlements()} disabled={busy || actionBusy}>
            Reload Settlements
          </button>
        </div>
      </div>

      <div className="settlements-layout">
        <form className="form two-col settlements-form" onSubmit={onGenerateOrUpdate}>
          <div className="settlements-form-head">
            <p className="eyebrow">Settlement Management</p>
            <h3>{editingSettlementUuid ? 'Update Settlement' : 'Generate Settlement'}</h3>
            <p className="subtle">Branch: {branchDisplay || 'Main Branch'}</p>
          </div>

          <label>
            Farmer
            <select
              value={form.farmerUuid}
              onChange={(event) => setForm((prev) => ({ ...prev, farmerUuid: event.target.value }))}
              disabled={Boolean(editingSettlementUuid)}
              required
            >
              {farmers.map((farmer) => (
                <option key={farmer.uuid} value={farmer.uuid}>{farmer.farmerName}</option>
              ))}
            </select>
          </label>

          <label>
            From date
            <input
              type="date"
              value={form.fromDate}
              onChange={(event) => setForm((prev) => ({ ...prev, fromDate: event.target.value }))}
              disabled={Boolean(editingSettlementUuid)}
              required
            />
          </label>

          <label>
            To date
            <input
              type="date"
              value={form.toDate}
              onChange={(event) => setForm((prev) => ({ ...prev, toDate: event.target.value }))}
              disabled={Boolean(editingSettlementUuid)}
              required
            />
          </label>

          <label>
            Bonus amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.bonusAmount}
              onChange={(event) => setForm((prev) => ({ ...prev, bonusAmount: Number(event.target.value) }))}
            />
          </label>

          <label>
            Loan recovery
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.loanRecovery}
              onChange={(event) => setForm((prev) => ({ ...prev, loanRecovery: Number(event.target.value) }))}
            />
          </label>

          <label>
            Advance recovery
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.advanceRecovery}
              onChange={(event) => setForm((prev) => ({ ...prev, advanceRecovery: Number(event.target.value) }))}
            />
          </label>

          <label>
            Other deduction
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.otherDeduction}
              onChange={(event) => setForm((prev) => ({ ...prev, otherDeduction: Number(event.target.value) }))}
            />
          </label>

          <label className="settlements-field-wide">
            Remarks
            <input
              value={form.remarks}
              onChange={(event) => setForm((prev) => ({ ...prev, remarks: event.target.value }))}
              placeholder="Optional remarks"
            />
          </label>

          <div className="settlements-actions">
            <button type="submit" disabled={busy || actionBusy}>
              {editingSettlementUuid ? 'Update Settlement' : 'Generate Settlement'}
            </button>
            {!editingSettlementUuid && (
              <button
                type="button"
                className="payment-secondary-btn"
                onClick={() => void onClonePreviousPeriod()}
                disabled={busy || actionBusy}
              >
                Clone Previous Period
              </button>
            )}
            {editingSettlementUuid && (
              <button
                type="button"
                className="payment-secondary-btn"
                onClick={resetForm}
                disabled={busy || actionBusy}
              >
                Cancel Edit
              </button>
            )}
          </div>

          {actionError && <p className="field-error">{actionError}</p>}
          {actionSuccess && <p className="subtle">{actionSuccess}</p>}
        </form>

        <aside className="settlements-summary" aria-label="Settlement summary">
          <h3>Snapshot</h3>
          <div className="settlements-summary-grid">
            <article>
              <p>Total Rows</p>
              <strong>{settlements.length}</strong>
            </article>
            <article>
              <p>Generated</p>
              <strong>{generatedCount}</strong>
            </article>
            <article>
              <p>Paid</p>
              <strong>{paidCount}</strong>
            </article>
            <article>
              <p>Net Payable</p>
              <strong>{formatAmount(payableTotal)}</strong>
            </article>
          </div>

          <div className="form two-col settlements-filter-grid">
            <label>
              Farmer
              <select
                value={filters.farmerUuid}
                onChange={(event) => {
                  setPageIndex(0)
                  setFilters((prev) => ({ ...prev, farmerUuid: event.target.value }))
                }}
              >
                <option value="">All Farmers</option>
                {farmers.map((farmer) => (
                  <option key={farmer.uuid} value={farmer.uuid}>{farmer.farmerName}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                value={filters.status}
                onChange={(event) => {
                  setPageIndex(0)
                  setFilters((prev) => ({ ...prev, status: event.target.value as SettlementStatus | '' }))
                }}
              >
                <option value="">All</option>
                <option value="GENERATED">GENERATED</option>
                <option value="PAID">PAID</option>
              </select>
            </label>
            <label>
              From date
              <input
                type="date"
                value={filters.fromDate}
                onChange={(event) => {
                  setPageIndex(0)
                  setFilters((prev) => ({ ...prev, fromDate: event.target.value }))
                }}
              />
            </label>
            <label>
              To date
              <input
                type="date"
                value={filters.toDate}
                onChange={(event) => {
                  setPageIndex(0)
                  setFilters((prev) => ({ ...prev, toDate: event.target.value }))
                }}
              />
            </label>
          </div>
        </aside>
      </div>

      <div className="table-wrap settlements-table-wrap">
        <div className="settlements-table-scroll">
          <table className="settlements-table">
            <thead>
              <tr>
                <th>Settlement No</th>
                <th>Farmer</th>
                <th>From</th>
                <th>To</th>
                <th className="settlements-number">Milk Amount</th>
                <th className="settlements-number">Loan Rec.</th>
                <th className="settlements-number">Advance Rec.</th>
                <th className="settlements-number">Other Ded.</th>
                <th className="settlements-number">Net Payable</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settlements.length === 0 && (
                <tr>
                  <td colSpan={11}>No settlements found for selected filters.</td>
                </tr>
              )}
              {settlements.map((item) => (
                <tr key={item.uuid}>
                  <td>{item.settlementNo}</td>
                  <td>{item.farmerName}</td>
                  <td>{formatDisplayDate(item.fromDate)}</td>
                  <td>{formatDisplayDate(item.toDate)}</td>
                  <td className="settlements-number">{formatAmount(item.milkAmount)}</td>
                  <td className="settlements-number">{formatAmount(item.loanRecovery)}</td>
                  <td className="settlements-number">{formatAmount(item.advanceRecovery)}</td>
                  <td className="settlements-number">{formatAmount(item.otherDeduction)}</td>
                  <td className="settlements-number">{formatAmount(item.netPayable)}</td>
                  <td>
                    <span className={[
                      'settlements-status-badge',
                      item.status === 'PAID' ? 'paid' : 'generated',
                    ].join(' ')}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="settlements-row-actions">
                      <button
                        type="button"
                        className="payment-secondary-btn"
                        onClick={() => onEditSettlement(item)}
                        disabled={busy || actionBusy || item.status !== 'GENERATED'}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="payment-secondary-btn"
                        onClick={() => void onPaySettlement(item)}
                        disabled={busy || actionBusy || item.status !== 'GENERATED'}
                      >
                        Pay
                      </button>
                      <button
                        type="button"
                        className="payment-secondary-btn"
                        onClick={() => void onPrintSettlement(item)}
                        disabled={busy || actionBusy}
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDeleteSettlement(item)}
                        disabled={busy || actionBusy || item.status === 'PAID'}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="settlements-pagination">
          <p className="subtle settlements-pagination-info">
            Showing {visibleFrom} to {visibleTo} of {totalElements}
          </p>
          <div className="settlements-pagination-controls">
            <label>
              Rows
              <select
                value={String(pageSize)}
                onChange={(event) => {
                  setPageIndex(0)
                  setPageSize(Number(event.target.value) || 20)
                }}
                disabled={busy || actionBusy}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </label>
            <button
              type="button"
              className="payment-secondary-btn"
              onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={busy || actionBusy || pageIndex <= 0}
            >
              Prev
            </button>
            <span className="settlements-page-indicator">Page {totalPages === 0 ? 0 : pageIndex + 1} of {Math.max(totalPages, 0)}</span>
            <button
              type="button"
              className="payment-secondary-btn"
              onClick={() => setPageIndex((prev) => prev + 1)}
              disabled={busy || actionBusy || totalPages === 0 || pageIndex >= totalPages - 1}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
