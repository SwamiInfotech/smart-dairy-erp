import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'react'
import type {
  FarmerResponse,
  MasterLookupResponse,
  MilkRateChartResponse,
  MilkTypeResponse,
  ShiftResponse,
} from '../types/api'

export type CollectionFormState = {
  collectionNo: string
  farmerUuid: string
  shiftUuid: string
  milkTypeUuid: string
  collectionDate: string
  collectionTime: string
  quantity: number
  rate: number
  fat: number
  snf: number | null
  mava: number
  remarks: string
}

export type CollectionQualityVisibility = {
  showFat: boolean
  showSnf: boolean
  showMava: boolean
}

type CollectionListItem = {
  uuid: string
  collectionNo: string
  farmerName: string
  collectionDate: string
  quantity: number
  grossAmount: number
}

type MilkCollectionsPageProps = {
  busy: boolean
  collectionForm: CollectionFormState
  setCollectionForm: Dispatch<SetStateAction<CollectionFormState>>
  farmers: FarmerResponse[]
  shifts: ShiftResponse[]
  milkTypes: MilkTypeResponse[]
  collections: CollectionListItem[]
  selectedCollectionFarmer: FarmerResponse | null
  selectedCollectionMilkRateChart: MilkRateChartResponse | null
  selectedCollectionMethod: MasterLookupResponse | null
  collectionQualityVisibility: CollectionQualityVisibility
  calculatedCollectionRate: number
  calculatedCollectionAmount: number
  isCollectionDateWithinRateChart: boolean
  onCollectionFarmerChange: (event: ChangeEvent<HTMLSelectElement>) => void | Promise<void>
  onOpenFarmerFromCollection: () => void
  onCreateCollection: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  loadCollections: () => void | Promise<void>
}

export function MilkCollectionsPage({
  busy,
  collectionForm,
  setCollectionForm,
  farmers,
  shifts,
  milkTypes,
  collections,
  selectedCollectionFarmer,
  selectedCollectionMilkRateChart,
  selectedCollectionMethod,
  collectionQualityVisibility,
  calculatedCollectionRate,
  calculatedCollectionAmount,
  isCollectionDateWithinRateChart,
  onCollectionFarmerChange,
  onOpenFarmerFromCollection,
  onCreateCollection,
  loadCollections,
}: MilkCollectionsPageProps) {
  return (
    <section className="panel panel-collection">
      <div className="panel-head">
        <h2>Milk Collections</h2>
        <button type="button" onClick={loadCollections} disabled={busy}>
          Reload
        </button>
      </div>
      <div className="collection-layout">
        <form className="collection-form" onSubmit={onCreateCollection}>
          <div className="collection-form-head">
            <p className="eyebrow">Collection Entry</p>
            <h3>Capture Daily Milk Procurement</h3>
            <p className="subtle">
              Record farmer, shift, milk quality, and collection timing in one structured entry.
            </p>
          </div>

          <div className="collection-grid">
            <div className="collection-farmer-row collection-field-wide">
              <label className="collection-field">
                <span>Collection No</span>
                <input type="text" value={collectionForm.collectionNo} disabled readOnly />
              </label>

              <label className="collection-field">
                <span>Farmer</span>
                <select required value={collectionForm.farmerUuid} onChange={onCollectionFarmerChange}>
                  <option value="">Select Farmer</option>
                  {farmers.map((farmer) => (
                    <option key={farmer.uuid} value={farmer.uuid}>
                      {farmer.farmerName} ({farmer.farmerCode || farmer.mobileNo || 'Farmer'})
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="collection-new-farmer-btn"
                onClick={onOpenFarmerFromCollection}
                aria-label="Create New Farmer"
                title="Create New Farmer"
              >
                +
              </button>
            </div>

            <div className="collection-meta-row collection-field-wide">
              <label className="collection-field">
                <span>Collection Date</span>
                <input
                  required
                  type="date"
                  value={collectionForm.collectionDate}
                  onChange={(event) =>
                    setCollectionForm((prev) => ({ ...prev, collectionDate: event.target.value }))
                  }
                />
              </label>

              <label className="collection-field">
                <span>Shift</span>
                <select
                  required
                  value={collectionForm.shiftUuid}
                  onChange={(event) =>
                    setCollectionForm((prev) => ({ ...prev, shiftUuid: event.target.value }))
                  }
                >
                  <option value="">Select shift</option>
                  {shifts.map((shift) => (
                    <option key={shift.uuid} value={shift.uuid}>
                      {shift.name} ({shift.code || 'Shift'})
                    </option>
                  ))}
                </select>
              </label>

              <label className="collection-field">
                <span>Milk Type</span>
                <select
                  required
                  value={collectionForm.milkTypeUuid}
                  onChange={(event) =>
                    setCollectionForm((prev) => ({ ...prev, milkTypeUuid: event.target.value }))
                  }
                >
                  <option value="">Select milk type</option>
                  {milkTypes.map((item) => (
                    <option key={item.uuid} value={item.uuid}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="collection-metric-row collection-field-wide">
              <label className="collection-field collection-field-compact">
                <span>Quantity (Liters)</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={collectionForm.quantity}
                  onChange={(event) =>
                    setCollectionForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))
                  }
                />
              </label>

              {collectionQualityVisibility.showFat && (
                <label className="collection-field collection-field-compact">
                  <span>FAT</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={collectionForm.fat}
                    onChange={(event) =>
                      setCollectionForm((prev) => ({ ...prev, fat: Number(event.target.value) }))
                    }
                    placeholder="Optional"
                  />
                </label>
              )}

              {collectionQualityVisibility.showSnf && (
                <label className="collection-field collection-field-compact">
                  <span>SNF</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={collectionForm.snf ?? ''}
                    onChange={(event) =>
                      setCollectionForm((prev) => ({
                        ...prev,
                        snf: event.target.value === '' ? null : Number(event.target.value),
                      }))
                    }
                    placeholder="Optional"
                  />
                </label>
              )}

              {collectionQualityVisibility.showMava && (
                <label className="collection-field collection-field-compact">
                  <span>Mava</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={collectionForm.mava}
                    onChange={(event) =>
                      setCollectionForm((prev) => ({ ...prev, mava: Number(event.target.value) }))
                    }
                    placeholder="Optional"
                  />
                </label>
              )}

              <label className="collection-field collection-field-compact">
                <span>Rate</span>
                <input
                  type="number"
                  step="0.01"
                  value={isCollectionDateWithinRateChart ? calculatedCollectionRate : 0}
                  disabled
                />
              </label>

              <label className="collection-field collection-field-compact">
                <span>Amount</span>
                <input type="number" step="0.01" value={calculatedCollectionAmount} disabled />
              </label>
            </div>

            <label className="collection-field collection-field-wide">
              <span>Remarks</span>
              <input
                value={collectionForm.remarks}
                onChange={(event) => setCollectionForm((prev) => ({ ...prev, remarks: event.target.value }))}
                placeholder="Quality notes, can condition, route remarks, etc."
              />
            </label>
          </div>
          <button type="submit" disabled={busy} className="collection-submit">
            {busy ? 'Saving...' : 'Save Collection'}
          </button>
        </form>

        <aside className="collection-summary">
          <h3>Collection Snapshot</h3>
          <div className="collection-summary-grid">
            <article>
              <p>Farmer</p>
              <strong>{selectedCollectionFarmer?.farmerName || '-'}</strong>
            </article>
            <article>
              <p>Milk Type</p>
              <strong>{milkTypes.find((item) => item.uuid === collectionForm.milkTypeUuid)?.name || '-'}</strong>
            </article>
            <article>
              <p>Shift</p>
              <strong>{shifts.find((item) => item.uuid === collectionForm.shiftUuid)?.name || '-'}</strong>
            </article>
            <article>
              <p>Rate Chart</p>
              <strong>
                {selectedCollectionMilkRateChart
                  ? `${selectedCollectionMilkRateChart.chartName}`
                  : selectedCollectionFarmer?.milkRateChartUuid || '-'}
              </strong>
            </article>
            <article>
              <p>Collection Method</p>
              <strong>{selectedCollectionMethod?.name || '-'}</strong>
            </article>
            <article>
              <p>Schedule</p>
              <strong>{collectionForm.collectionDate || '-'}</strong>
            </article>
            <article>
              <p>Quantity</p>
              <strong>{collectionForm.quantity ? `${collectionForm.quantity} L` : '-'}</strong>
            </article>
            <article>
              <p>Rate</p>
              <strong>{calculatedCollectionRate > 0 ? calculatedCollectionRate : '-'}</strong>
            </article>
            <article>
              <p>Amount</p>
              <strong>{calculatedCollectionAmount > 0 ? calculatedCollectionAmount : '-'}</strong>
            </article>
            <article>
              <p>Quality</p>
              <strong>
                FAT {collectionForm.fat || 0} | SNF {collectionForm.snf || 0}
              </strong>
            </article>
          </div>
          <div className="collection-note-box">
            <p className="eyebrow">Checklist</p>
            <p>Confirm farmer, shift, milk type, and quantity before saving.</p>
          </div>
        </aside>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Collection No</th>
              <th>Farmer</th>
              <th>Date</th>
              <th>Qty</th>
              <th>Gross</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((item) => (
              <tr key={item.uuid}>
                <td>{item.collectionNo}</td>
                <td>{item.farmerName}</td>
                <td>{item.collectionDate}</td>
                <td>{item.quantity}</td>
                <td>{item.grossAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
