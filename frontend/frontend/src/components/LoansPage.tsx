import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { api, getSavedAuth } from '../lib/api'
import { toInputDate } from '../lib/appCoreUtils'
import type {
  CreateLoanRequest,
  FarmerResponse,
  LoanResponse,
  LoanStatus,
  UpdateLoanRequest,
} from '../types/api'

type LoanFormState = {
  farmerUuid: string
  loanDate: string
  loanAmount: number
  remarks: string
}

type LoanFilters = {
  farmerUuid: string
  status: '' | LoanStatus
  fromDate: string
  toDate: string
}

type LoansPageProps = {
  busy: boolean
  farmers: FarmerResponse[]
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

export function LoansPage({ busy, farmers, loadFarmers }: LoansPageProps) {
  const authToken = getSavedAuth().token
  const today = toInputDate(new Date())

  const [filters, setFilters] = useState<LoanFilters>({
    farmerUuid: '',
    status: '',
    fromDate: startOfMonthInputDate(),
    toDate: today,
  })
  const [form, setForm] = useState<LoanFormState>({
    farmerUuid: '',
    loanDate: today,
    loanAmount: 0,
    remarks: '',
  })
  const [loans, setLoans] = useState<LoanResponse[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageJump, setPageJump] = useState('1')
  const [editingLoanUuid, setEditingLoanUuid] = useState('')
  const [actionBusy, setActionBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

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

  const loadLoans = async () => {
    if (!authToken) return

    setActionError('')
    const page = await api.searchLoans(authToken, {
      farmerUuid: filters.farmerUuid || undefined,
      status: filters.status || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      page: pageIndex,
      size: pageSize,
    })

    setLoans(page.content || [])
    setTotalPages(Number(page.totalPages || 0))
    setTotalElements(Number(page.totalElements || 0))
  }

  useEffect(() => {
    if (!authToken) return

    void loadLoans().catch((error) => {
      setActionError(error instanceof Error ? error.message : 'Failed to load loans.')
    })
    // Intentionally reload on filter changes to keep list synced.
  }, [authToken, filters.farmerUuid, filters.fromDate, filters.status, filters.toDate, pageIndex, pageSize])

  useEffect(() => {
    setPageJump(totalPages <= 0 ? '0' : String(pageIndex + 1))
  }, [pageIndex, totalPages])

  const totalLoanAmount = useMemo(() => {
    return loans.reduce((sum, item) => sum + Number(item.loanAmount || 0), 0)
  }, [loans])

  const pendingLoanAmount = useMemo(() => {
    return loans
      .filter((item) => item.status === 'PENDING')
      .reduce((sum, item) => sum + Number(item.loanAmount || 0), 0)
  }, [loans])

  const approvedLoanAmount = useMemo(() => {
    return loans
      .filter((item) => item.status === 'APPROVED')
      .reduce((sum, item) => sum + Number(item.loanAmount || 0), 0)
  }, [loans])

  const visibleFrom = loans.length === 0 ? 0 : pageIndex * pageSize + 1
  const visibleTo = loans.length === 0 ? 0 : pageIndex * pageSize + loans.length

  const applyPageJump = () => {
    if (totalPages <= 0) return

    const numericPage = Number.parseInt(pageJump, 10)
    if (!Number.isFinite(numericPage)) {
      setPageJump(String(pageIndex + 1))
      return
    }

    const boundedPage = Math.min(Math.max(numericPage, 1), totalPages)
    setPageIndex(boundedPage - 1)
    setPageJump(String(boundedPage))
  }

  const onPageJumpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    applyPageJump()
  }

  const resetForm = () => {
    setEditingLoanUuid('')
    setForm((prev) => ({
      ...prev,
      loanDate: today,
      loanAmount: 0,
      remarks: '',
    }))
  }

  const onSubmitLoan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!authToken) {
      setActionError('You are not logged in. Please login again.')
      return
    }

    if (!form.farmerUuid) {
      setActionError('Select a farmer before saving loan.')
      return
    }

    if (!form.loanDate) {
      setActionError('Loan date is required.')
      return
    }

    if (!Number.isFinite(form.loanAmount) || form.loanAmount <= 0) {
      setActionError('Loan amount must be greater than 0.')
      return
    }

    setActionBusy(true)
    setActionError('')
    setActionSuccess('')

    try {
      if (editingLoanUuid) {
        const payload: UpdateLoanRequest = {
          loanType: 'OTHER',
          loanDate: form.loanDate,
          sanctionedAmount: Number(form.loanAmount || 0),
          remarks: form.remarks.trim(),
        }

        await api.updateLoan(authToken, editingLoanUuid, payload)
        setActionSuccess('Loan updated successfully.')
      } else {
        const payload: CreateLoanRequest = {
          farmerUuid: form.farmerUuid,
          loanDate: form.loanDate,
          loanAmount: Number(form.loanAmount || 0),
          remarks: form.remarks.trim(),
        }

        await api.createLoan(authToken, payload)
        setActionSuccess('Loan created successfully.')
      }

      resetForm()
      await loadLoans()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to save loan.')
    } finally {
      setActionBusy(false)
    }
  }

  const onEditLoan = (loan: LoanResponse) => {
    setEditingLoanUuid(loan.uuid)
    setForm({
      farmerUuid: loan.farmerUuid || '',
      loanDate: (loan.loanDate || '').slice(0, 10),
      loanAmount: Number(loan.loanAmount || 0),
      remarks: loan.remarks || '',
    })
    setActionError('')
    setActionSuccess('')
  }

  const onApproveLoan = async (loan: LoanResponse) => {
    if (!authToken || loan.status !== 'PENDING') return

    setActionBusy(true)
    setActionError('')
    setActionSuccess('')
    try {
      await api.approveLoan(authToken, loan.uuid)
      await loadLoans()
      setActionSuccess('Loan approved successfully.')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to approve loan.')
    } finally {
      setActionBusy(false)
    }
  }

  const onDeleteLoan = async (loan: LoanResponse) => {
    if (!authToken) return

    const confirmed = window.confirm(`Delete loan ${loan.loanNo}?`)
    if (!confirmed) return

    setActionBusy(true)
    setActionError('')
    setActionSuccess('')
    try {
      await api.deleteLoan(authToken, loan.uuid)
      await loadLoans()
      setActionSuccess('Loan deleted successfully.')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to delete loan.')
    } finally {
      setActionBusy(false)
    }
  }

  return (
    <section className="panel panel-loans">
      <div className="panel-head">
        <h2>Loans</h2>
        <div className="loans-head-actions">
          <button type="button" onClick={() => void loadFarmers()} disabled={busy || actionBusy}>
            Reload Farmers
          </button>
          <button type="button" onClick={() => void loadLoans()} disabled={busy || actionBusy}>
            Reload Loans
          </button>
        </div>
      </div>

      <div className="loans-layout">
        <form className="form two-col loans-form" onSubmit={onSubmitLoan}>
          <div className="loans-form-head">
            <p className="eyebrow">Loan Management</p>
            <h3>{editingLoanUuid ? 'Edit Loan' : 'Create Loan'}</h3>
            <p className="subtle">Integrated with backend endpoints: search/create/update/delete/approve.</p>
          </div>

          <label>
            Farmer
            <select
              value={form.farmerUuid}
              onChange={(event) => setForm((prev) => ({ ...prev, farmerUuid: event.target.value }))}
              required
            >
              {farmers.map((farmer) => (
                <option key={farmer.uuid} value={farmer.uuid}>
                  {farmer.farmerName}
                </option>
              ))}
            </select>
          </label>

          <label>
            Loan date
            <input
              type="date"
              value={form.loanDate}
              onChange={(event) => setForm((prev) => ({ ...prev, loanDate: event.target.value }))}
              required
            />
          </label>

          <label>
            Loan amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.loanAmount}
              onChange={(event) => setForm((prev) => ({ ...prev, loanAmount: Number(event.target.value) }))}
              required
            />
          </label>

          <label className="loans-field-wide">
            Remarks
            <input
              value={form.remarks}
              onChange={(event) => setForm((prev) => ({ ...prev, remarks: event.target.value }))}
              placeholder="Optional remarks"
            />
          </label>

          <div className="loans-actions">
            <button type="submit" disabled={busy || actionBusy}>
              {editingLoanUuid ? 'Update Loan' : 'Create Loan'}
            </button>
            {editingLoanUuid && (
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

        <aside className="loans-summary" aria-label="Loan summary">
          <h3>Snapshot</h3>
          <div className="loans-summary-grid">
            <article>
              <p>Total Loans</p>
              <strong>{loans.length}</strong>
            </article>
            <article>
              <p>Total Amount</p>
              <strong>{formatAmount(totalLoanAmount)}</strong>
            </article>
            <article>
              <p>Pending</p>
              <strong>{formatAmount(pendingLoanAmount)}</strong>
            </article>
            <article>
              <p>Approved</p>
              <strong>{formatAmount(approvedLoanAmount)}</strong>
            </article>
          </div>

          <div className="form two-col loans-filter-grid">
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
                  setFilters((prev) => ({ ...prev, status: event.target.value as LoanStatus | '' }))
                }}
              >
                <option value="">All</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="CLOSED">CLOSED</option>
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

      <div className="table-wrap loans-table-wrap">
        <div className="loans-table-scroll">
          <table className="loans-table">
            <colgroup>
              <col className="loans-col-no" />
              <col className="loans-col-farmer" />
              <col className="loans-col-date" />
              <col className="loans-col-amount" />
              <col className="loans-col-status" />
              <col className="loans-col-remarks" />
              <col className="loans-col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th>Loan No</th>
                <th>Farmer</th>
                <th>Date</th>
                <th className="loans-number">Amount</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 && (
                <tr>
                  <td colSpan={7}>No loans found for selected filters.</td>
                </tr>
              )}
              {loans.map((loan) => (
                <tr key={loan.uuid}>
                  <td>{loan.loanNo}</td>
                  <td>{loan.farmerName}</td>
                  <td>{formatDisplayDate(loan.loanDate)}</td>
                  <td className="loans-number">{formatAmount(loan.loanAmount)}</td>
                  <td>
                    <span className={[
                      'loans-status-badge',
                      loan.status === 'APPROVED' ? 'approved' : '',
                      loan.status === 'PENDING' ? 'pending' : '',
                      loan.status === 'CLOSED' ? 'closed' : '',
                    ].filter(Boolean).join(' ')}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="loans-remarks-cell">{loan.remarks || '-'}</td>
                  <td>
                    <div className="loans-row-actions">
                      <button
                        type="button"
                        className="payment-secondary-btn"
                        onClick={() => onEditLoan(loan)}
                        disabled={busy || actionBusy || loan.status !== 'PENDING'}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="payment-secondary-btn"
                        onClick={() => void onApproveLoan(loan)}
                        disabled={busy || actionBusy || loan.status !== 'PENDING'}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDeleteLoan(loan)}
                        disabled={busy || actionBusy || loan.status === 'APPROVED'}
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

        <div className="loans-pagination">
          <p className="subtle loans-pagination-info">
            Showing {visibleFrom} to {visibleTo} of {totalElements}
          </p>
          <div className="loans-pagination-controls">
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
            <span className="loans-page-indicator">Page {totalPages === 0 ? 0 : pageIndex + 1} of {Math.max(totalPages, 0)}</span>
            <form className="loans-page-jump" onSubmit={onPageJumpSubmit}>
              <label>
                Go to
                <input
                  type="number"
                  min={1}
                  max={Math.max(totalPages, 1)}
                  value={pageJump}
                  onChange={(event) => setPageJump(event.target.value)}
                  onBlur={applyPageJump}
                  disabled={busy || actionBusy || totalPages <= 0}
                />
              </label>
              <button
                type="submit"
                className="payment-secondary-btn"
                disabled={busy || actionBusy || totalPages <= 0}
              >
                Go
              </button>
            </form>
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
