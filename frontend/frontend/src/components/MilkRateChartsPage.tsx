import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { RateCategory } from './RateCategory'
import type {
  CollectionMethodResponse,
  CreateMilkRateChartRequest,
  MilkRateChartResponse,
  RateCategoryResponse,
} from '../types/api'

type MilkRateQualityVisibility = {
  showFat: boolean
  showSnf: boolean
  showMava: boolean
}

type MilkRateRowConflictState = {
  conflictingRows: number[]
  messages: string[]
}

type MilkRateChartsPageProps = {
  busy: boolean
  branchDisplay: string
  milkRateForm: CreateMilkRateChartRequest
  setMilkRateForm: Dispatch<SetStateAction<CreateMilkRateChartRequest>>
  editingMilkRateChartUuid: string
  rateCategories: RateCategoryResponse[]
  collectionMethods: CollectionMethodResponse[]
  milkRateCharts: MilkRateChartResponse[]
  milkRateQualityVisibility: MilkRateQualityVisibility
  milkRateRowConflictState: MilkRateRowConflictState
  loadMilkRateLookups: () => void | Promise<void>
  loadMilkRateChartsView: () => void | Promise<void>
  onCreateMilkRateChart: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  updateMilkRateDetail: (
    index: number,
    key: keyof CreateMilkRateChartRequest['details'][number],
    value: number | null,
  ) => void
  removeMilkRateDetailRow: (index: number) => void
  addMilkRateDetailRow: () => void
  setMavaFromRef: (index: number, element: HTMLInputElement | null) => void
  onCancelMilkRateChartEdit: () => void
  onEditMilkRateChart: (chart: MilkRateChartResponse) => void
  onDeleteMilkRateChart: (chart: MilkRateChartResponse) => void
}

export function MilkRateChartsPage({
  busy,
  branchDisplay,
  milkRateForm,
  setMilkRateForm,
  editingMilkRateChartUuid,
  rateCategories,
  collectionMethods,
  milkRateCharts,
  milkRateQualityVisibility,
  milkRateRowConflictState,
  loadMilkRateLookups,
  loadMilkRateChartsView,
  onCreateMilkRateChart,
  updateMilkRateDetail,
  removeMilkRateDetailRow,
  addMilkRateDetailRow,
  setMavaFromRef,
  onCancelMilkRateChartEdit,
  onEditMilkRateChart,
  onDeleteMilkRateChart,
}: MilkRateChartsPageProps) {
  return (
    <section className="panel panel-milk-rate">
      <div className="panel-head">
        <h2>Milk Rate Charts</h2>
        <button
          type="button"
          onClick={() => {
            void loadMilkRateLookups()
            void loadMilkRateChartsView()
          }}
          disabled={busy}
        >
          Reload
        </button>
      </div>

      <div className="milk-rate-layout">
        <form className="milk-rate-form" onSubmit={onCreateMilkRateChart}>
          <div className="milk-rate-form-head">
            <p className="eyebrow">Rate Configuration</p>
            <h3>{editingMilkRateChartUuid ? 'Edit Milk Rate Chart' : 'Create Milk Rate Chart'}</h3>
            <p className="subtle">Select names from masters, define quality slab, and save effective chart.</p>
          </div>

          <div className="milk-rate-grid">
            <label className="milk-rate-field milk-rate-field-wide">
              <span>Branch</span>
              <input value={branchDisplay} readOnly />
              <small className="subtle">Mapped from active shop context.</small>
            </label>

            <RateCategory
              categories={rateCategories}
              value={milkRateForm.rateCategoryUuid}
              onChange={(value) => setMilkRateForm((prev) => ({ ...prev, rateCategoryUuid: value }))}
            />

            <label className="milk-rate-field">
              <span>Collection Method</span>
              <select
                required
                value={milkRateForm.collectionMethodUuid}
                onChange={(event) =>
                  setMilkRateForm((prev) => ({ ...prev, collectionMethodUuid: event.target.value }))
                }
              >
                <option value="">Select collection method</option>
                {collectionMethods.map((item) => (
                  <option key={item.uuid} value={item.uuid}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="milk-rate-form-row milk-rate-form-row-three">
              <label className="milk-rate-field">
                <span>Chart Name</span>
                <input
                  required
                  value={milkRateForm.chartName}
                  onChange={(event) => setMilkRateForm((prev) => ({ ...prev, chartName: event.target.value }))}
                  placeholder="Example: Morning Fat-SNF Standard"
                />
              </label>

              <label className="milk-rate-field">
                <span>Effective From</span>
                <input
                  required
                  type="date"
                  value={milkRateForm.effectiveFrom}
                  onChange={(event) =>
                    setMilkRateForm((prev) => ({ ...prev, effectiveFrom: event.target.value }))
                  }
                />
              </label>

              <label className="milk-rate-field">
                <span>Effective To</span>
                <input
                  required
                  type="date"
                  value={milkRateForm.effectiveTo}
                  onChange={(event) => setMilkRateForm((prev) => ({ ...prev, effectiveTo: event.target.value }))}
                />
              </label>
            </div>
          </div>

          <div className="milk-rate-slab">
            <div className="milk-rate-slab-head">
              <h4>Quality Slab</h4>
              <p>Add multiple quality slab rows and rates, then save in one go.</p>
            </div>

            <div className="milk-rate-slab-table-wrap">
              <table className="milk-rate-slab-table">
                <thead>
                  <tr>
                    <th className="milk-rate-row-index-head">#</th>
                    {milkRateQualityVisibility.showFat && (
                      <>
                        <th>FAT From</th>
                        <th>FAT To</th>
                      </>
                    )}
                    {milkRateQualityVisibility.showSnf && (
                      <>
                        <th>SNF From</th>
                        <th>SNF To</th>
                      </>
                    )}
                    {milkRateQualityVisibility.showMava && (
                      <>
                        <th>Mava From</th>
                        <th>Mava To</th>
                      </>
                    )}
                    <th>Rate</th>
                    <th>Row Action</th>
                  </tr>
                </thead>
                <tbody>
                  {milkRateForm.details.map((detail, index) => (
                    <tr
                      key={`milk-rate-detail-row-${index + 1}`}
                      className={
                        milkRateRowConflictState.conflictingRows.includes(index)
                          ? 'milk-rate-slab-row has-conflict'
                          : 'milk-rate-slab-row'
                      }
                    >
                      <td data-label="#" className="milk-rate-row-index-cell">{index + 1}</td>
                      {milkRateQualityVisibility.showFat && (
                        <>
                          <td data-label="FAT From">
                            <input
                              required
                              type="number"
                              step="0.1"
                              min="0"
                              value={detail.fatFrom ?? ''}
                              onChange={(event) =>
                                updateMilkRateDetail(
                                  index,
                                  'fatFrom',
                                  event.target.value === '' ? null : Number(event.target.value),
                                )
                              }
                            />
                          </td>
                          <td data-label="FAT To">
                            <input
                              required
                              type="number"
                              step="0.1"
                              min="0"
                              value={detail.fatTo ?? ''}
                              onChange={(event) =>
                                updateMilkRateDetail(
                                  index,
                                  'fatTo',
                                  event.target.value === '' ? null : Number(event.target.value),
                                )
                              }
                            />
                          </td>
                        </>
                      )}

                      {milkRateQualityVisibility.showSnf && (
                        <>
                          <td data-label="SNF From">
                            <input
                              required
                              type="number"
                              step="0.1"
                              min="0"
                              value={detail.snfFrom ?? ''}
                              onChange={(event) =>
                                updateMilkRateDetail(
                                  index,
                                  'snfFrom',
                                  event.target.value === '' ? null : Number(event.target.value),
                                )
                              }
                            />
                          </td>
                          <td data-label="SNF To">
                            <input
                              required
                              type="number"
                              step="0.1"
                              min="0"
                              value={detail.snfTo ?? ''}
                              onChange={(event) =>
                                updateMilkRateDetail(
                                  index,
                                  'snfTo',
                                  event.target.value === '' ? null : Number(event.target.value),
                                )
                              }
                            />
                          </td>
                        </>
                      )}

                      {milkRateQualityVisibility.showMava && (
                        <>
                          <td data-label="Mava From">
                            <input
                              ref={(element) => {
                                setMavaFromRef(index, element)
                              }}
                              required
                              type="number"
                              step="0.1"
                              min="0"
                              value={detail.mavaFrom ?? ''}
                              onChange={(event) =>
                                updateMilkRateDetail(
                                  index,
                                  'mavaFrom',
                                  event.target.value === '' ? null : Number(event.target.value),
                                )
                              }
                            />
                          </td>
                          <td data-label="Mava To">
                            <input
                              required
                              type="number"
                              step="0.1"
                              min="0"
                              value={detail.mavaTo ?? ''}
                              onChange={(event) =>
                                updateMilkRateDetail(
                                  index,
                                  'mavaTo',
                                  event.target.value === '' ? null : Number(event.target.value),
                                )
                              }
                            />
                          </td>
                        </>
                      )}

                      <td data-label="Rate">
                        <input
                          required
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={detail.rate > 0 ? detail.rate : ''}
                          onChange={(event) =>
                            updateMilkRateDetail(
                              index,
                              'rate',
                              event.target.value === '' ? 0 : Number(event.target.value),
                            )
                          }
                        />
                      </td>
                      <td data-label="Row Action">
                        <div className="milk-rate-row-actions-cell">
                          <button
                            type="button"
                            className="milk-rate-row-remove-btn"
                            onClick={() => removeMilkRateDetailRow(index)}
                            disabled={busy}
                            aria-label="Remove slab row"
                            title="Remove slab row"
                          >
                            -
                          </button>
                          {index === milkRateForm.details.length - 1 && (
                            <button
                              type="button"
                              className="milk-rate-row-add-btn"
                              onClick={addMilkRateDetailRow}
                              disabled={busy}
                              aria-label="Add slab row"
                              title="Add slab row"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {milkRateRowConflictState.messages.length > 0 && (
              <div className="milk-rate-slab-alert" role="alert" aria-live="polite">
                {milkRateRowConflictState.messages.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            )}
          </div>

          <label className="milk-rate-field milk-rate-field-wide">
            <span>Remarks</span>
            <input
              value={milkRateForm.remarks}
              onChange={(event) => setMilkRateForm((prev) => ({ ...prev, remarks: event.target.value }))}
              placeholder="Optional operational notes"
            />
          </label>

          <div className="form-actions">
            <button type="submit" disabled={busy} className="milk-rate-submit">
              {busy
                ? editingMilkRateChartUuid
                  ? 'Updating...'
                  : 'Saving...'
                : editingMilkRateChartUuid
                  ? 'Update Milk Rate Chart'
                  : 'Save Milk Rate Chart'}
            </button>
            {editingMilkRateChartUuid && (
              <button type="button" onClick={onCancelMilkRateChartEdit} disabled={busy}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Chart Name</th>
              <th>Effective From</th>
              <th>Effective To</th>
              <th>Rate Category</th>
              <th>Collection Method</th>
              <th>Remarks</th>
              <th>Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {milkRateCharts.length === 0 && (
              <tr>
                <td colSpan={9}>No milk rate charts available.</td>
              </tr>
            )}
            {milkRateCharts.map((item) => (
              <tr key={item.uuid}>
                <td>{item.chartName}</td>
                <td>{item.effectiveFrom}</td>
                <td>{item.effectiveTo || '-'}</td>
                <td>{rateCategories.find((rateCategory) => rateCategory.uuid === item.rateCategoryUuid)?.name || '-'}</td>
                <td>{collectionMethods.find((collectionMethod) => collectionMethod.uuid === item.collectionMethodUuid)?.name || '-'}</td>
                <td>{item.remarks || '-'}</td>
                <td>{item.details.length}</td>
                <td>{item.active ? 'ACTIVE' : 'INACTIVE'}</td>
                <td>
                  <div className="farmer-row-actions">
                    <button
                      type="button"
                      className="farmer-action-icon icon-edit"
                      onClick={() => onEditMilkRateChart(item)}
                      disabled={busy}
                      title="Edit milk rate chart"
                      aria-label="Edit milk rate chart"
                    >
                      <span aria-hidden="true">✎</span>
                    </button>
                    <button
                      type="button"
                      className="farmer-action-icon icon-delete"
                      onClick={() => onDeleteMilkRateChart(item)}
                      disabled={busy}
                      title="Delete milk rate chart"
                      aria-label="Delete milk rate chart"
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
