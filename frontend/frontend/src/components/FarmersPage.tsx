import { useEffect, useRef } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type {
  FarmerResponse,
  MilkRateChartResponse,
  MilkTypeResponse,
  PaymentCycleResponse,
} from '../types/api'

export type FarmerFormState = {
  branchUuid: string
  farmerCode: string
  farmerName: string
  mobileNo: string
  alternateMobileNo: string
  email: string
  address: string
  village: string
  taluka: string
  district: string
  state: string
  pincode: string
  aadharNo: string
  panNo: string
  photoUrl: string
  remarks: string
  milkTypeUuid: string
  milkRateChartUuid: string
  collectionMethodUuid: string
  paymentCycleUuid: string
  rateCategoryUuid: string
  configEffectiveFrom: string
}

type FarmersPageProps = {
  busy: boolean
  farmers: FarmerResponse[]
  branchUuid: string
  branchName: string
  farmerForm: FarmerFormState
  setFarmerForm: Dispatch<SetStateAction<FarmerFormState>>
  editingFarmerUuid: string
  farmerRateCharts: MilkRateChartResponse[]
  selectedFarmerRateChartUuid: string
  setSelectedFarmerRateChartUuid: (value: string) => void
  farmerMappedFieldError: string
  setFarmerMappedFieldError: (value: string) => void
  milkTypes: MilkTypeResponse[]
  paymentCycles: PaymentCycleResponse[]
  loadFarmers: () => void | Promise<void>
  onCreateFarmer: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onCancelFarmerEdit: () => void
  onEditFarmer: (farmer: FarmerResponse) => void
  onDeleteFarmer: (farmer: FarmerResponse) => void | Promise<void>
}

export function FarmersPage({
  busy,
  farmers,
  branchUuid,
  branchName,
  farmerForm,
  setFarmerForm,
  editingFarmerUuid,
  farmerRateCharts,
  selectedFarmerRateChartUuid,
  setSelectedFarmerRateChartUuid,
  farmerMappedFieldError,
  setFarmerMappedFieldError,
  milkTypes,
  paymentCycles,
  loadFarmers,
  onCreateFarmer,
  onCancelFarmerEdit,
  onEditFarmer,
  onDeleteFarmer,
}: FarmersPageProps) {
  const farmerNameInputRef = useRef<HTMLInputElement | null>(null)
  const previousFarmerNameRef = useRef(farmerForm.farmerName)
  const currentFarmerRateChart = farmerRateCharts.find((item) => item.uuid === selectedFarmerRateChartUuid)
  const currentMilkType = milkTypes.find((item) => item.uuid === farmerForm.milkTypeUuid)
  const currentPaymentCycle = paymentCycles.find((item) => item.uuid === farmerForm.paymentCycleUuid)
  const totalFarmers = farmers.length
  const currentBranchFarmers = farmers.filter((item) => item.branchUuid === branchUuid).length
  const linkedRateCharts = farmers.filter((item) => Boolean(item.milkRateChartUuid)).length
  const currentRateChartDetails = currentFarmerRateChart?.details ?? []
  const currentRateChartRates = currentRateChartDetails.map((item) => item.rate)
  const currentRateChartMinRate = currentRateChartRates.length ? Math.min(...currentRateChartRates) : null
  const currentRateChartMaxRate = currentRateChartRates.length ? Math.max(...currentRateChartRates) : null
  const activeFormCompleteness = [
    farmerForm.farmerCode,
    farmerForm.farmerName,
    farmerForm.mobileNo,
    farmerForm.village,
    farmerForm.milkTypeUuid,
    farmerForm.paymentCycleUuid,
    farmerForm.configEffectiveFrom,
  ].filter((value) => value.trim()).length
  const formCompletionPercent = Math.round((activeFormCompleteness / 7) * 100)

  useEffect(() => {
    // Keep focus on Farmer Name after form reset (save/update/cancel) and when edit row is opened.
    if (editingFarmerUuid) {
      requestAnimationFrame(() => farmerNameInputRef.current?.focus())
      previousFarmerNameRef.current = farmerForm.farmerName
      return
    }

    const previousName = previousFarmerNameRef.current.trim()
    const currentName = farmerForm.farmerName.trim()

    if (previousName && !currentName) {
      requestAnimationFrame(() => farmerNameInputRef.current?.focus())
    }

    previousFarmerNameRef.current = farmerForm.farmerName
  }, [editingFarmerUuid, farmerForm.farmerName])

  return (
    <section className="panel panel-farmer">
      <div className="panel-head">
        <h2>Farmers</h2>
        <button type="button" onClick={loadFarmers} disabled={busy}>
          Reload
        </button>
      </div>
      <div className="farmer-layout">
        <form className="farmer-form" onSubmit={onCreateFarmer}>
          <div className="farmer-form-head">
            <p className="eyebrow">Farmer Master</p>
            <h3>Create Farmer</h3>
          </div>

          <div className="farmer-grid">
            <div className="farmer-grid-group farmer-field-wide">
              <div className="farmer-grid-title">Identity & Contact</div>
              <div className="farmer-grid-cols farmer-grid-cols-identity">
                <label className="farmer-field">
                  <span>Farmer Code</span>
                  <input required value={farmerForm.farmerCode} readOnly />
                </label>
                <label className="farmer-field">
                  <span>Farmer Name</span>
                  <input
                    ref={farmerNameInputRef}
                    required
                    value={farmerForm.farmerName}
                    onChange={(event) => setFarmerForm((prev) => ({ ...prev, farmerName: event.target.value }))}
                  />
                </label>
              </div>

              <div className="farmer-grid-cols farmer-grid-cols-contact">
                <label className="farmer-field farmer-field-numeric farmer-field-phone">
                  <span>Mobile</span>
                  <input
                    required
                    inputMode="numeric"
                    maxLength={10}
                    value={farmerForm.mobileNo}
                    onChange={(event) => setFarmerForm((prev) => ({ ...prev, mobileNo: event.target.value }))}
                  />
                </label>
                <label className="farmer-field farmer-field-numeric farmer-field-phone">
                  <span>Alternate Mobile</span>
                  <input
                    inputMode="numeric"
                    maxLength={10}
                    value={farmerForm.alternateMobileNo}
                    onChange={(event) =>
                      setFarmerForm((prev) => ({ ...prev, alternateMobileNo: event.target.value }))
                    }
                  />
                </label>

                <label className="farmer-field">
                  <span>Email</span>
                  <input
                    value={farmerForm.email}
                    onChange={(event) => setFarmerForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </label>
              </div>
            </div>

            <div className="farmer-grid-group farmer-field-wide">
              <div className="farmer-grid-title">Location</div>
              <div className="farmer-grid-cols farmer-grid-cols-three">
                <label className="farmer-field">
                  <span>Village</span>
                  <input
                    required
                    value={farmerForm.village}
                    onChange={(event) => setFarmerForm((prev) => ({ ...prev, village: event.target.value }))}
                  />
                </label>
                <label className="farmer-field">
                  <span>Taluka</span>
                  <input
                    value={farmerForm.taluka}
                    onChange={(event) => setFarmerForm((prev) => ({ ...prev, taluka: event.target.value }))}
                  />
                </label>
                <label className="farmer-field">
                  <span>District</span>
                  <input
                    value={farmerForm.district}
                    onChange={(event) => setFarmerForm((prev) => ({ ...prev, district: event.target.value }))}
                  />
                </label>
              </div>
              <div className="farmer-grid-cols farmer-grid-cols-two">
                <label className="farmer-field">
                  <span>State</span>
                  <input
                    value={farmerForm.state}
                    onChange={(event) => setFarmerForm((prev) => ({ ...prev, state: event.target.value }))}
                  />
                </label>
                <label className="farmer-field farmer-field-numeric">
                  <span>Pincode</span>
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={farmerForm.pincode}
                    onChange={(event) => setFarmerForm((prev) => ({ ...prev, pincode: event.target.value }))}
                  />
                </label>
                <label className="farmer-field farmer-field-wide-col">
                  <span>Address</span>
                  <input
                    value={farmerForm.address}
                    onChange={(event) => setFarmerForm((prev) => ({ ...prev, address: event.target.value }))}
                  />
                </label>
              </div>
              <div className="farmer-grid-cols farmer-grid-cols-two">
                <label className="farmer-field farmer-field-numeric">
                  <span>Aadhar No</span>
                  <input
                    inputMode="numeric"
                    maxLength={12}
                    value={farmerForm.aadharNo}
                    onChange={(event) => setFarmerForm((prev) => ({ ...prev, aadharNo: event.target.value }))}
                  />
                </label>
                <label className="farmer-field">
                  <span>PAN No</span>
                  <input
                    maxLength={10}
                    value={farmerForm.panNo}
                    onChange={(event) => setFarmerForm((prev) => ({ ...prev, panNo: event.target.value }))}
                  />
                </label>
              </div>
              <div className="farmer-grid-cols farmer-grid-cols-two">
                <label className="farmer-field">
                  <span>Photo URL</span>
                  <input
                    value={farmerForm.photoUrl}
                    onChange={(event) => setFarmerForm((prev) => ({ ...prev, photoUrl: event.target.value }))}
                  />
                </label>

                <label className="farmer-field">
                  <span>Remarks</span>
                  <input
                    value={farmerForm.remarks}
                    onChange={(event) => setFarmerForm((prev) => ({ ...prev, remarks: event.target.value }))}
                  />
                </label>
              </div>
            </div>

            <div className="farmer-grid-group farmer-field-wide">
              <div className="farmer-grid-title">Configuration (Required)</div>
              <div className="farmer-grid-cols farmer-grid-cols-three">
                <label className="farmer-field farmer-field-wide-col">
                  <span>Milk Rate Chart</span>
                  <select
                    required
                    value={selectedFarmerRateChartUuid}
                    onChange={(event) => {
                      setFarmerMappedFieldError('')
                      setSelectedFarmerRateChartUuid(event.target.value)
                    }}
                  >
                    <option value="">Select chart from the list</option>
                    {farmerRateCharts.map((item) => (
                      <option key={item.uuid} value={item.uuid}>
                        Chart: {item.chartName} | Chart UUID: {item.uuid}
                      </option>
                    ))}
                  </select>
                  {farmerMappedFieldError && (
                    <p className="field-error farmer-mapped-field-error">{farmerMappedFieldError}</p>
                  )}
                </label>

                <label className="farmer-field">
                  <span>Milk Type</span>
                  <select
                    required
                    value={farmerForm.milkTypeUuid}
                    onChange={(event) => setFarmerForm((prev) => ({ ...prev, milkTypeUuid: event.target.value }))}
                  >
                    <option value="">Select milk type</option>
                    {milkTypes.map((item) => (
                      <option key={item.uuid} value={item.uuid}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="farmer-field">
                  <span>Payment Cycle</span>
                  <select
                    required
                    value={farmerForm.paymentCycleUuid}
                    onChange={(event) =>
                      setFarmerForm((prev) => ({ ...prev, paymentCycleUuid: event.target.value }))
                    }
                  >
                    <option value="">Select payment cycle</option>
                    {paymentCycles.map((item) => (
                      <option key={item.uuid} value={item.uuid}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="farmer-field">
                  <span>Config Effective From</span>
                  <input
                    required
                    type="date"
                    value={farmerForm.configEffectiveFrom}
                    onChange={(event) =>
                      setFarmerForm((prev) => ({ ...prev, configEffectiveFrom: event.target.value }))
                    }
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="farmer-actions-row">
            <button type="submit" disabled={busy} className="farmer-submit">
              {busy
                ? editingFarmerUuid
                  ? 'Updating...'
                  : 'Creating...'
                : editingFarmerUuid
                  ? 'Update farmer'
                  : 'Create farmer'}
            </button>
            {editingFarmerUuid && (
              <button
                type="button"
                onClick={() => {
                  onCancelFarmerEdit()
                  window.location.reload()
                }}
                disabled={busy}
                className="farmer-cancel-btn"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <aside className="farmer-snapshot-card">
          <div className="farmer-snapshot-head">
            <div>
              <p className="eyebrow">Snapshot Window</p>
              <h3>{editingFarmerUuid ? 'Editing farmer snapshot' : 'Live farmer snapshot'}</h3>
            </div>
            <span className={editingFarmerUuid ? 'farmer-snapshot-badge is-editing' : 'farmer-snapshot-badge is-ready'}>
              {editingFarmerUuid ? 'EDIT MODE' : 'READY'}
            </span>
          </div>

          <div className="farmer-snapshot-grid">
            <article>
              <span>Total Farmers</span>
              <strong>{totalFarmers}</strong>
            </article>
            <article>
              <span>Current Branch</span>
              <strong>{branchName || 'Branch not loaded'}</strong>
            </article>
            <article>
              <span>Current Branch Farmers</span>
              <strong>{currentBranchFarmers}</strong>
            </article>
            <article>
              <span>Linked Rate Charts</span>
              <strong>{linkedRateCharts}</strong>
            </article>
          </div>

          <div className="farmer-snapshot-details">
            <div>
              <span>Farmer Code</span>
              <strong>{farmerForm.farmerCode || 'Auto-generated'}</strong>
            </div>
            <div>
              <span>Farmer Name</span>
              <strong>{farmerForm.farmerName || 'Not entered yet'}</strong>
            </div>
            <div>
              <span>Mobile</span>
              <strong>{farmerForm.mobileNo || 'Pending'}</strong>
            </div>
            <div>
              <span>Village</span>
              <strong>{farmerForm.village || 'Pending'}</strong>
            </div>
            <div>
              <span>Milk Type</span>
              <strong>{currentMilkType?.name || 'Select milk type'}</strong>
            </div>
            <div>
              <span>Payment Cycle</span>
              <strong>{currentPaymentCycle?.name || 'Select payment cycle'}</strong>
            </div>
            <div>
              <span>Rate Chart</span>
              <strong>{currentFarmerRateChart?.chartName || 'Select chart'}</strong>
            </div>
            <div>
              <span>Effective From</span>
              <strong>{farmerForm.configEffectiveFrom || 'Not set'}</strong>
            </div>
          </div>

          <div className="farmer-snapshot-chart">
            <div className="farmer-snapshot-chart-head">
              <div>
                <span>Selected Rate Chart</span>
                <strong>{currentFarmerRateChart?.chartName || 'No chart selected'}</strong>
              </div>
              <span className={currentFarmerRateChart?.active ? 'farmer-snapshot-badge is-ready' : 'farmer-snapshot-badge is-editing'}>
                {currentFarmerRateChart?.active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div className="farmer-snapshot-chart-meta">
              <div>
                <span>Entries</span>
                <strong>{currentRateChartDetails.length}</strong>
              </div>
              <div>
                <span>Rate Range</span>
                <strong>
                  {currentRateChartMinRate !== null && currentRateChartMaxRate !== null
                    ? `${currentRateChartMinRate.toFixed(2)} - ${currentRateChartMaxRate.toFixed(2)}`
                    : 'No data'}
                </strong>
              </div>
              <div>
                <span>Effective From</span>
                <strong>{currentFarmerRateChart?.effectiveFrom || 'Not set'}</strong>
              </div>
              <div>
                <span>Effective To</span>
                <strong>{currentFarmerRateChart?.effectiveTo || 'Open ended'}</strong>
              </div>
            </div>
            <p className="subtle">
              {currentFarmerRateChart?.remarks || 'The selected chart preview shows the range and status that will drive the farmer rate setup.'}
            </p>
          </div>

          <div className="farmer-snapshot-progress">
            <div className="farmer-snapshot-progress-head">
              <span>Form Completion</span>
              <strong>{formCompletionPercent}%</strong>
            </div>
            <div className="farmer-snapshot-progress-bar" aria-hidden="true">
              <span style={{ width: `${formCompletionPercent}%` }} />
            </div>
            <p className="subtle">
              The form stays on the left, the live snapshot stays on the right, and the table flows below on every screen size.
            </p>
          </div>
        </aside>
      </div>

      <div className="table-wrap farmer-table">
        <table className="farmer-list-table">
          <thead>
            <tr>
              <th>Farmer Code</th>
              <th>Farmer Name</th>
              <th>Mobile</th>
              <th>Village</th>
              <th>Branch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {farmers.map((item) => (
              <tr key={item.uuid}>
                <td>
                  <span className="farmer-code-chip">{item.farmerCode}</span>
                </td>
                <td>{item.farmerName}</td>
                <td>{item.mobileNo || '-'}</td>
                <td>{item.village || '-'}</td>
                <td>
                  <span
                    className={
                      item.branchUuid === branchUuid
                        ? 'farmer-branch-chip is-current'
                        : 'farmer-branch-chip is-mapped'
                    }
                  >
                    {item.branchUuid === branchUuid ? branchName || 'Current Branch' : 'Mapped Branch'}
                  </span>
                </td>
                <td>
                  <div className="farmer-row-actions">
                    <button
                      type="button"
                      className="farmer-action-icon icon-edit"
                      onClick={() => onEditFarmer(item)}
                      disabled={busy}
                      title="Edit farmer"
                      aria-label="Edit farmer"
                    >
                      <span aria-hidden="true">✎</span>
                    </button>
                    <button
                      type="button"
                      className="farmer-action-icon icon-delete"
                      onClick={() => onDeleteFarmer(item)}
                      disabled={busy}
                      title="Delete farmer"
                      aria-label="Delete farmer"
                    >
                      <span aria-hidden="true">✕</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
