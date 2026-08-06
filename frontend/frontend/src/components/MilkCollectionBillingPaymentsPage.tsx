import { useEffect, useMemo, useState } from 'react'
import { PAYMENT_MODES } from '../lib/appShellConfig'
import { toInputDate } from '../lib/appCoreUtils'
import type { MilkTypeResponse, PaymentMode, ShiftResponse } from '../types/api'

type CollectionEntryMode = 'single' | 'multi' | 'unknown'

type CollectionListItem = {
  uuid: string
  collectionNo: string
  farmerName: string
  farmerUuid?: string
  collectionDate: string
  collectionTime?: string
  shiftUuid?: string
  milkTypeUuid?: string
  quantity: number
  fat?: number | null
  snf?: number | null
  mava?: number | null
  grossAmount: number
  entryMode?: CollectionEntryMode
}

type FarmerLookup = {
  uuid: string
  farmerName: string
  farmerCode?: string | null
  mobileNo?: string | null
}

type PaymentRecord = {
  uuid: string
  paymentDate: string
  amount: number
  mode: PaymentMode
  referenceNo: string
  remarks: string
}

type GeneratedBill = {
  billNo: string
  generatedAt: string
  farmerUuid: string
  farmerName: string
  milkTypeUuid: string
  fromDate: string
  toDate: string
  collections: CollectionListItem[]
  totalQty: number
  totalAmount: number
}

type BillFilters = {
  farmerUuid: string
  milkTypeUuid: string
  fromDate: string
  toDate: string
}

type MilkCollectionBillingPaymentsPageProps = {
  busy: boolean
  collections: CollectionListItem[]
  farmers: FarmerLookup[]
  milkTypes: MilkTypeResponse[]
  shifts: ShiftResponse[]
  branchDisplay: string
  loadCollections: () => void | Promise<void>
}

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function startOfMonthInputDate() {
  const date = new Date()
  return toInputDate(new Date(date.getFullYear(), date.getMonth(), 1))
}

function buildBillNo(farmerName: string, fromDate: string, toDate: string) {
  const safeName = farmerName.trim().replace(/\s+/g, '').slice(0, 10).toUpperCase() || 'FARMER'
  return `BILL-${safeName}-${fromDate.replace(/-/g, '')}-${toDate.replace(/-/g, '')}`
}

function getRowRate(item: CollectionListItem) {
  const qty = Number(item.quantity || 0)
  if (!qty) return 0
  return Number(item.grossAmount || 0) / qty
}

function compareCollectionsByDate(left: CollectionListItem, right: CollectionListItem) {
  const leftDate = (left.collectionDate || '').slice(0, 10)
  const rightDate = (right.collectionDate || '').slice(0, 10)

  if (leftDate !== rightDate) {
    return leftDate.localeCompare(rightDate)
  }

  const leftTime = left.collectionTime || ''
  const rightTime = right.collectionTime || ''
  if (leftTime !== rightTime) {
    return leftTime.localeCompare(rightTime)
  }

  return (left.collectionNo || '').localeCompare(right.collectionNo || '')
}

export function MilkCollectionBillingPaymentsPage({
  busy,
  collections,
  farmers,
  milkTypes,
  shifts,
  branchDisplay: _branchDisplay,
  loadCollections,
}: MilkCollectionBillingPaymentsPageProps) {
  const today = toInputDate(new Date())
  const [filters, setFilters] = useState<BillFilters>({
    farmerUuid: '',
    milkTypeUuid: '',
    fromDate: startOfMonthInputDate(),
    toDate: today,
  })
  const [generatedBill, setGeneratedBill] = useState<GeneratedBill | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: today,
    amount: 0,
    mode: 'CASH' as PaymentMode,
    referenceNo: '',
    remarks: '',
  })

  const farmerOptions = useMemo(() => {
    const seen = new Set<string>()
    const options: FarmerLookup[] = []

    for (const farmer of farmers) {
      if (!farmer.uuid || seen.has(farmer.uuid)) continue
      seen.add(farmer.uuid)
      options.push(farmer)
    }

    for (const item of collections) {
      if (!item.farmerUuid || seen.has(item.farmerUuid)) continue
      seen.add(item.farmerUuid)
      options.push({ uuid: item.farmerUuid, farmerName: item.farmerName })
    }

    return options.sort((left, right) => left.farmerName.localeCompare(right.farmerName))
  }, [collections, farmers])

  useEffect(() => {
    if (farmerOptions.length === 0) return

    setFilters((prev) => {
      if (prev.farmerUuid && farmerOptions.some((item) => item.uuid === prev.farmerUuid)) {
        return prev
      }

      return {
        ...prev,
        farmerUuid: farmerOptions[0].uuid,
      }
    })
  }, [farmerOptions])

  const filteredCollections = useMemo(() => {
    return collections.filter((item) => {
      const itemDate = (item.collectionDate || '').slice(0, 10)
      if (filters.farmerUuid && item.farmerUuid !== filters.farmerUuid) return false
      if (filters.milkTypeUuid && item.milkTypeUuid !== filters.milkTypeUuid) return false
      if (filters.fromDate && itemDate < filters.fromDate) return false
      if (filters.toDate && itemDate > filters.toDate) return false
      return true
    }).sort(compareCollectionsByDate)
  }, [collections, filters.farmerUuid, filters.fromDate, filters.milkTypeUuid, filters.toDate])

  const totalQty = filteredCollections.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const totalAmount = filteredCollections.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0)
  const paidAmount = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const balanceAmount = Math.max(0, totalAmount - paidAmount)
  const averageRate = totalQty > 0 ? totalAmount / totalQty : 0

  const shiftNameByUuid = useMemo(() => {
    const next = new Map<string, string>()
    for (const shift of shifts) {
      if (!shift.uuid) continue
      next.set(shift.uuid, shift.name || shift.code || shift.uuid)
    }
    return next
  }, [shifts])

  const resolveShiftLabel = (item: CollectionListItem) => {
    if (item.shiftUuid && shiftNameByUuid.has(item.shiftUuid)) {
      return shiftNameByUuid.get(item.shiftUuid) || '-'
    }
    return item.collectionTime || '-'
  }

  useEffect(() => {
    if (!generatedBill) return

    setGeneratedBill((prev) => {
      if (!prev) return prev
      const refreshed = collections.filter((item) => {
        const itemDate = (item.collectionDate || '').slice(0, 10)
        if (prev.farmerUuid && item.farmerUuid !== prev.farmerUuid) return false
        if (prev.milkTypeUuid && item.milkTypeUuid !== prev.milkTypeUuid) return false
        if (itemDate < prev.fromDate) return false
        if (itemDate > prev.toDate) return false
        return true
      }).sort(compareCollectionsByDate)
      return {
        ...prev,
        collections: refreshed,
        totalQty: refreshed.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        totalAmount: refreshed.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0),
      }
    })
  }, [collections, generatedBill?.farmerUuid, generatedBill?.fromDate, generatedBill?.milkTypeUuid, generatedBill?.toDate])

  const openBill = () => {
    const selectedFarmer = farmerOptions.find((item) => item.uuid === filters.farmerUuid) || null
    const selectedCollections = collections.filter((item) => {
      const itemDate = (item.collectionDate || '').slice(0, 10)
      if (selectedFarmer?.uuid && item.farmerUuid !== selectedFarmer.uuid) return false
      if (filters.milkTypeUuid && item.milkTypeUuid !== filters.milkTypeUuid) return false
      if (itemDate < filters.fromDate) return false
      if (itemDate > filters.toDate) return false
      return true
    }).sort(compareCollectionsByDate)

    setGeneratedBill({
      billNo: buildBillNo(selectedFarmer?.farmerName || 'ALL', filters.fromDate, filters.toDate),
      generatedAt: new Date().toISOString(),
      farmerUuid: selectedFarmer?.uuid || '',
      farmerName: selectedFarmer?.farmerName || 'All Farmers',
      milkTypeUuid: filters.milkTypeUuid,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      collections: selectedCollections,
      totalQty: selectedCollections.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      totalAmount: selectedCollections.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0),
    })
    setPayments([])
  }

  const splitCollectionsByShift = useMemo(() => {
    const morning: CollectionListItem[] = []
    const evening: CollectionListItem[] = []

    for (const item of filteredCollections) {
      const label = resolveShiftLabel(item).toLowerCase()
      const hour = Number((item.collectionTime || '').slice(0, 2))
      const isMorning = label.includes('morning') || label === 'm' || (!Number.isNaN(hour) && hour < 12)

      if (isMorning) {
        morning.push(item)
      } else {
        evening.push(item)
      }
    }

    return { morning, evening }
  }, [filteredCollections, shiftNameByUuid])

  const combinedBillRows = useMemo(() => {
    const rows: Array<{
      date: string
      morningItem?: CollectionListItem
      eveningItem?: CollectionListItem
    }> = []

    const morningByDate = new Map<string, CollectionListItem[]>()
    const eveningByDate = new Map<string, CollectionListItem[]>()

    for (const item of splitCollectionsByShift.morning) {
      const dateKey = (item.collectionDate || '').slice(0, 10)
      const bucket = morningByDate.get(dateKey)
      if (bucket) {
        bucket.push(item)
      } else {
        morningByDate.set(dateKey, [item])
      }
    }

    for (const item of splitCollectionsByShift.evening) {
      const dateKey = (item.collectionDate || '').slice(0, 10)
      const bucket = eveningByDate.get(dateKey)
      if (bucket) {
        bucket.push(item)
      } else {
        eveningByDate.set(dateKey, [item])
      }
    }

    const allDates = [...new Set([...morningByDate.keys(), ...eveningByDate.keys()])].sort((left, right) => left.localeCompare(right))

    for (const dateKey of allDates) {
      const morningItems = morningByDate.get(dateKey) || []
      const eveningItems = eveningByDate.get(dateKey) || []
      const rowCount = Math.max(morningItems.length, eveningItems.length)

      for (let index = 0; index < rowCount; index += 1) {
        rows.push({
          date: dateKey,
          morningItem: morningItems[index],
          eveningItem: eveningItems[index],
        })
      }
    }

    return rows
  }, [splitCollectionsByShift.evening, splitCollectionsByShift.morning])

  const combinedBillRowCount = combinedBillRows.length
  const showFatColumn = filteredCollections.some((item) => item.fat != null && Number(item.fat) > 0)
  const showSnfColumn = filteredCollections.some((item) => item.snf != null && Number(item.snf) > 0)
  const hiddenQualityColumnCount = (showFatColumn ? 1 : 0) + (showSnfColumn ? 1 : 0)

  const addPayment = () => {
    if (!generatedBill || paymentForm.amount <= 0) return

    setPayments((prev) => [
      ...prev,
      {
        uuid: crypto.randomUUID(),
        paymentDate: paymentForm.paymentDate,
        amount: Number(paymentForm.amount),
        mode: paymentForm.mode,
        referenceNo: paymentForm.referenceNo.trim(),
        remarks: paymentForm.remarks.trim(),
      },
    ])

    setPaymentForm((prev) => ({ ...prev, amount: 0, referenceNo: '', remarks: '' }))
  }

  return (
    <section className="panel panel-payment-billing">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Payments</p>
          <h2>Milk Billing Statement</h2>
          <p className="subtle">English layout of the attached billing template for bill generation and payment management.</p>
        </div>
        <button type="button" onClick={loadCollections} disabled={busy}>
          Reload Collections
        </button>
      </div>

      <div className="payment-billing-grid">
        <section className="payment-billing-card payment-billing-card-main">
          <div className="payment-billing-card-head">
            <h3>Bill Header</h3>
          </div>

          <div className="form two-col payment-billing-form payment-billing-filter-row">
            <label className="payment-filter-farmer">
              Farmer
              <select
                value={filters.farmerUuid}
                onChange={(event) => setFilters((prev) => ({ ...prev, farmerUuid: event.target.value }))}
              >
                {farmerOptions.map((farmer) => (
                  <option key={farmer.uuid} value={farmer.uuid}>
                    {farmer.farmerName}
                  </option>
                ))}
              </select>
            </label>

            <label className="payment-filter-milk-type">
              Milk Type
              <select
                value={filters.milkTypeUuid}
                onChange={(event) => setFilters((prev) => ({ ...prev, milkTypeUuid: event.target.value }))}
              >
                <option value="">All Milk Types</option>
                {milkTypes.map((milkType) => (
                  <option key={milkType.uuid} value={milkType.uuid}>
                    {milkType.name || milkType.code}
                  </option>
                ))}
              </select>
            </label>

            <label className="payment-filter-from-date">
              From date
              <input type="date" value={filters.fromDate} onChange={(event) => setFilters((prev) => ({ ...prev, fromDate: event.target.value }))} />
            </label>

            <label className="payment-filter-to-date">
              To date
              <input type="date" value={filters.toDate} onChange={(event) => setFilters((prev) => ({ ...prev, toDate: event.target.value }))} />
            </label>

            <label className="payment-filter-count">
              Collections found
              <input readOnly value={String(filteredCollections.length)} />
            </label>
          </div>

          <div className="table-wrap payment-collection-table-wrap payment-template-table-wrap">
            <table className="payment-billing-dual-table">
              <colgroup>
                <col className="payment-col-shared-date" />
                <col className="payment-col-collection-no" />
                <col className="payment-col-qty" />
                {showFatColumn && <col className="payment-col-quality" />}
                {showSnfColumn && <col className="payment-col-quality" />}
                <col className="payment-col-rate" />
                <col className="payment-col-amount" />
                <col className="payment-col-collection-no" />
                <col className="payment-col-qty" />
                {showFatColumn && <col className="payment-col-quality" />}
                {showSnfColumn && <col className="payment-col-quality" />}
                <col className="payment-col-rate" />
                <col className="payment-col-amount" />
                <col className="payment-col-total" />
                <col className="payment-col-total" />
              </colgroup>
              <thead>
                <tr>
                  <th rowSpan={2} className="payment-billing-shared-date-head">Date</th>
                  <th colSpan={2 + (showFatColumn ? 1 : 0) + (showSnfColumn ? 1 : 0) + 2}>Morning Collection</th>
                  <th colSpan={2 + (showFatColumn ? 1 : 0) + (showSnfColumn ? 1 : 0) + 2}>Evening Collection</th>
                  <th colSpan={2} className="payment-billing-shared-total-head">Day Total</th>
                </tr>
                <tr>
                  <th>Collection No</th>
                  <th>Qty</th>
                  {showFatColumn && <th>Fat</th>}
                  {showSnfColumn && <th>SNF</th>}
                  <th>Rate</th>
                  <th className="payment-billing-divider-cell">Amount</th>
                  <th>Collection No</th>
                  <th>Qty</th>
                  {showFatColumn && <th>Fat</th>}
                  {showSnfColumn && <th>SNF</th>}
                  <th>Rate</th>
                  <th>Amount</th>
                  <th className="payment-billing-shared-total-start">Total Milk</th>
                  <th className="payment-billing-shared-total-cell">Total for the day</th>
                </tr>
              </thead>
              <tbody>
                {combinedBillRowCount === 0 && (
                  <tr>
                    <td colSpan={3 + ((2 + (showFatColumn ? 1 : 0) + (showSnfColumn ? 1 : 0) + 2) * 2)}>No collection data found for this filter.</td>
                  </tr>
                )}
                {combinedBillRows.map((row, index) => {
                  const morningItem = row.morningItem
                  const eveningItem = row.eveningItem
                  const sharedDate = row.date || '-'
                  const morningQty = Number(morningItem?.quantity || 0)
                  const eveningQty = Number(eveningItem?.quantity || 0)
                  const morningAmount = Number(morningItem?.grossAmount || 0)
                  const eveningAmount = Number(eveningItem?.grossAmount || 0)
                  const totalMilkForRow = morningQty + eveningQty
                  const totalAmountForRow = morningAmount + eveningAmount

                  return (
                    <tr key={`${morningItem?.uuid || 'morning-empty'}-${eveningItem?.uuid || 'evening-empty'}-${index}`}>
                      <td className="payment-billing-shared-date-cell">{sharedDate}</td>
                      <td>{morningItem?.collectionNo || '-'}</td>
                      <td>{morningItem ? morningItem.quantity : '-'}</td>
                      {showFatColumn && <td>{morningItem?.fat != null ? morningItem.fat : '-'}</td>}
                      {showSnfColumn && <td>{morningItem?.snf != null ? morningItem.snf : '-'}</td>}
                      <td>{morningItem ? formatAmount(getRowRate(morningItem)) : '-'}</td>
                      <td className="payment-billing-divider-cell">{morningItem ? formatAmount(morningItem.grossAmount) : '-'}</td>
                      <td>{eveningItem?.collectionNo || '-'}</td>
                      <td>{eveningItem ? eveningItem.quantity : '-'}</td>
                      {showFatColumn && <td>{eveningItem?.fat != null ? eveningItem.fat : '-'}</td>}
                      {showSnfColumn && <td>{eveningItem?.snf != null ? eveningItem.snf : '-'}</td>}
                      <td>{eveningItem ? formatAmount(getRowRate(eveningItem)) : '-'}</td>
                      <td>{eveningItem ? formatAmount(eveningItem.grossAmount) : '-'}</td>
                      <td className="payment-billing-shared-total-start">{formatAmount(totalMilkForRow)}</td>
                      <td className="payment-billing-shared-total-cell">{formatAmount(totalAmountForRow)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="payment-template-footer-row">
                  <td className="payment-billing-shared-date-cell">Totals</td>
                  <td colSpan={1}>Morning Totals</td>
                  <td>{formatAmount(splitCollectionsByShift.morning.reduce((sum, item) => sum + Number(item.quantity || 0), 0))}</td>
                  {hiddenQualityColumnCount > 0 && <td colSpan={hiddenQualityColumnCount} />}
                  <td>{formatAmount(splitCollectionsByShift.morning.reduce((sum, item) => sum + Number(item.quantity || 0), 0) > 0 ? splitCollectionsByShift.morning.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0) / splitCollectionsByShift.morning.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0)}</td>
                  <td className="payment-billing-divider-cell">{formatAmount(splitCollectionsByShift.morning.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0))}</td>
                  <td colSpan={1}>Evening Totals</td>
                  <td>{formatAmount(splitCollectionsByShift.evening.reduce((sum, item) => sum + Number(item.quantity || 0), 0))}</td>
                  {hiddenQualityColumnCount > 0 && <td colSpan={hiddenQualityColumnCount} />}
                  <td>{formatAmount(splitCollectionsByShift.evening.reduce((sum, item) => sum + Number(item.quantity || 0), 0) > 0 ? splitCollectionsByShift.evening.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0) / splitCollectionsByShift.evening.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0)}</td>
                  <td>{formatAmount(splitCollectionsByShift.evening.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0))}</td>
                  <td className="payment-billing-shared-total-start">{formatAmount((generatedBill?.totalQty ?? totalQty) || 0)}</td>
                  <td className="payment-billing-shared-total-cell">{formatAmount((generatedBill?.totalAmount ?? totalAmount) || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="payment-billing-generate-action">
            <button type="button" className="payment-primary-btn" onClick={openBill} disabled={busy}>
              Generate Bill
            </button>
          </div>

          <div className="payment-billing-summary-grid">
            <article>
              <p>Total quantity</p>
              <strong>{formatAmount(generatedBill?.totalQty ?? totalQty)}</strong>
            </article>
            <article>
              <p>Total amount</p>
              <strong>{formatAmount(generatedBill?.totalAmount ?? totalAmount)}</strong>
            </article>
            <article>
              <p>Average rate</p>
              <strong>{formatAmount((generatedBill?.totalQty ?? totalQty) > 0 ? (generatedBill?.totalAmount ?? totalAmount) / (generatedBill?.totalQty ?? totalQty) : 0)}</strong>
            </article>
            <article>
              <p>Collection count</p>
              <strong>{generatedBill?.collections.length ?? filteredCollections.length}</strong>
            </article>
          </div>
        </section>

      </div>

      <div className="payment-billing-summary-dock">
        <section className="payment-billing-card payment-billing-card-summary">
          <div className="payment-billing-card-head">
            <h3>Payment Summary</h3>
            <span className="payment-billing-pill">{generatedBill ? generatedBill.billNo : 'No bill generated'}</span>
          </div>

          <div className="payment-billing-bill-meta">
            <article>
              <span>Farmer</span>
              <strong>{generatedBill?.farmerName || 'Select farmer and generate bill'}</strong>
            </article>
            <article>
              <span>Bill period</span>
              <strong>{generatedBill ? `${generatedBill.fromDate} to ${generatedBill.toDate}` : 'Not generated'}</strong>
            </article>
            <article>
              <span>Bill amount</span>
              <strong>{formatAmount(generatedBill?.totalAmount || 0)}</strong>
            </article>
            <article>
              <span>Outstanding</span>
              <strong>{formatAmount(balanceAmount)}</strong>
            </article>
          </div>

          <div className="form two-col payment-billing-form">
            <label>
              Payment date
              <input type="date" value={paymentForm.paymentDate} onChange={(event) => setPaymentForm((prev) => ({ ...prev, paymentDate: event.target.value }))} disabled={!generatedBill} />
            </label>
            <label>
              Amount
              <input type="number" step="0.01" min="0" value={paymentForm.amount} onChange={(event) => setPaymentForm((prev) => ({ ...prev, amount: Number(event.target.value) }))} disabled={!generatedBill} />
            </label>
            <label>
              Payment mode
              <select value={paymentForm.mode} onChange={(event) => setPaymentForm((prev) => ({ ...prev, mode: event.target.value as PaymentMode }))} disabled={!generatedBill}>
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </label>
            <label>
              Reference no.
              <input value={paymentForm.referenceNo} onChange={(event) => setPaymentForm((prev) => ({ ...prev, referenceNo: event.target.value }))} disabled={!generatedBill} />
            </label>
            <label className="payment-field-wide">
              Remarks
              <input value={paymentForm.remarks} onChange={(event) => setPaymentForm((prev) => ({ ...prev, remarks: event.target.value }))} disabled={!generatedBill} />
            </label>
            <button type="button" className="payment-primary-btn payment-field-wide" onClick={addPayment} disabled={!generatedBill || busy || balanceAmount <= 0}>
              Record Payment
            </button>
          </div>

          <div className="table-wrap payment-ledger-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sr</th>
                  <th>Date</th>
                  <th>Mode</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6}>No payments recorded for the current bill.</td>
                  </tr>
                )}
                {payments.map((item, index) => (
                  <tr key={item.uuid}>
                    <td>{index + 1}</td>
                    <td>{item.paymentDate}</td>
                    <td>{item.mode}</td>
                    <td>{formatAmount(item.amount)}</td>
                    <td>{item.referenceNo || '-'}</td>
                    <td>{item.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="payment-billing-footer-summary">
            <article>
              <span>Bill Amount</span>
              <strong>{formatAmount(generatedBill?.totalAmount || totalAmount)}</strong>
            </article>
            <article>
              <span>Paid Total</span>
              <strong>{formatAmount(paidAmount)}</strong>
            </article>
            <article>
              <span>Outstanding</span>
              <strong>{formatAmount(balanceAmount)}</strong>
            </article>
            <article>
              <span>Collection Count</span>
              <strong>{generatedBill?.collections.length || filteredCollections.length}</strong>
            </article>
          </div>
        </section>
      </div>
    </section>
  )
}