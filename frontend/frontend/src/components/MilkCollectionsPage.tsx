import { useMemo, useRef, useState, type ChangeEvent, type Dispatch, type FormEvent, type KeyboardEvent, type SetStateAction } from 'react'
import type {
  FarmerResponse,
  MilkRateChartResponse,
  MilkTypeResponse,
  ShiftResponse,
} from '../types/api'
import {
  findCollectionRateMatch,
  isCollectionDateWithinRateChartRange,
  resolveActiveCollectionQuality,
  roundToTwo,
} from '../lib/uiHelpers'

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
  farmerUuid?: string
  shiftUuid?: string
  milkTypeUuid?: string
  collectionDate: string
  collectionTime?: string
  quantity: number
  fat?: number | null
  snf?: number | null
  mava?: number | null
  remarks?: string | null
  grossAmount: number
}

type MultiCollectionEntryInput = {
  farmerUuid: string
  quantity: number
  fat: number
  snf: number | null
  mava: number
  remarks: string
}

type CollectionMode = 'single' | 'multi'

type MultiCollectionDraftRow = {
  selected: boolean
  quantity: string
  fat: string
  snf: string
  mava: string
  remarks: string
}

const COLLECTION_LIST_PAGE_SIZE = 10

type MilkCollectionsPageProps = {
  busy: boolean
  collectionForm: CollectionFormState
  setCollectionForm: Dispatch<SetStateAction<CollectionFormState>>
  farmers: FarmerResponse[]
  shifts: ShiftResponse[]
  milkTypes: MilkTypeResponse[]
  milkRateCharts: MilkRateChartResponse[]
  collections: CollectionListItem[]
  collectionQualityVisibility: CollectionQualityVisibility
  calculatedCollectionRate: number
  calculatedCollectionAmount: number
  isCollectionDateWithinRateChart: boolean
  onCollectionFarmerChange: (event: ChangeEvent<HTMLSelectElement>) => void | Promise<void>
  onOpenFarmerFromCollection: () => void
  onCreateCollection: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onCreateMultipleCollections: (entries: MultiCollectionEntryInput[]) => void | Promise<void>
  editingCollectionUuid: string
  onEditCollection: (item: CollectionListItem) => void
  onCancelCollectionEdit: () => void
  onDeleteCollection: (item: CollectionListItem) => void | Promise<void>
  loadCollections: () => void | Promise<void>
}

const EMPTY_MULTI_ROW: MultiCollectionDraftRow = {
  selected: false,
  quantity: '',
  fat: '',
  snf: '',
  mava: '',
  remarks: '',
}

export function MilkCollectionsPage({
  busy,
  collectionForm,
  setCollectionForm,
  farmers,
  shifts,
  milkTypes,
  milkRateCharts,
  collections,
  collectionQualityVisibility,
  calculatedCollectionRate,
  calculatedCollectionAmount,
  isCollectionDateWithinRateChart,
  onCollectionFarmerChange,
  onOpenFarmerFromCollection,
  onCreateCollection,
  onCreateMultipleCollections,
  editingCollectionUuid,
  onEditCollection,
  onCancelCollectionEdit,
  onDeleteCollection,
  loadCollections,
}: MilkCollectionsPageProps) {
  const [collectionMode, setCollectionMode] = useState<CollectionMode>('single')
  const [showCollectionList, setShowCollectionList] = useState(false)
  const [collectionListPage, setCollectionListPage] = useState(1)
  const [multiRows, setMultiRows] = useState<Record<string, MultiCollectionDraftRow>>({})
  const multiCellRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const getDraftRow = (farmerUuid: string): MultiCollectionDraftRow => {
    return multiRows[farmerUuid] || EMPTY_MULTI_ROW
  }

  const selectedMultiCount = useMemo(
    () => farmers.filter((farmer) => getDraftRow(farmer.uuid).selected).length,
    [farmers, multiRows],
  )

  const allFarmersSelected = farmers.length > 0 && selectedMultiCount === farmers.length

  const resolveRowRateAmount = (farmer: FarmerResponse, row: MultiCollectionDraftRow) => {
    const chartUuid = farmer.milkRateChartUuid || ''
    const chart = chartUuid ? milkRateCharts.find((item) => item.uuid === chartUuid) || null : null
    const isDateWithinRateChart = isCollectionDateWithinRateChartRange(collectionForm.collectionDate, chart)

    const qualityInput = {
      fat: Number(row.fat || 0),
      snf: row.snf.trim() === '' ? null : Number(row.snf),
      mava: Number(row.mava || 0),
    }

    const activeQuality = resolveActiveCollectionQuality(qualityInput, collectionQualityVisibility)
    const match = findCollectionRateMatch({
      qualityInput,
      visibility: collectionQualityVisibility,
      details: chart?.details || [],
      isDateWithinRateChart,
      activeQuality,
    })

    const rate = roundToTwo(Number(match.matchedDetail?.rate) || 0)
    const quantity = Number(row.quantity || 0)
    const amount = quantity > 0 && rate > 0
      ? roundToTwo(quantity * rate)
      : 0

    return {
      rate,
      amount,
    }
  }

  const multiRowCalculations = useMemo(
    () =>
      farmers.map((farmer) => {
        const row = getDraftRow(farmer.uuid)
        return {
          farmer,
          row,
          rowCalc: resolveRowRateAmount(farmer, row),
        }
      }),
    [collectionForm.collectionDate, collectionQualityVisibility, farmers, milkRateCharts, multiRows],
  )

  const multiSelectedTotals = useMemo(() => {
    return multiRowCalculations.reduce(
      (acc, current) => {
        if (!current.row.selected) return acc

        const quantity = Number(current.row.quantity || 0)
        acc.quantity += Number.isFinite(quantity) ? quantity : 0
        acc.amount += current.rowCalc.amount || 0
        return acc
      },
      { quantity: 0, amount: 0 },
    )
  }, [multiRowCalculations])

  const formatDecimal = (value: number) => roundToTwo(value).toFixed(2)

  const totalCollectionPages = Math.max(1, Math.ceil(collections.length / COLLECTION_LIST_PAGE_SIZE))
  const safeCollectionListPage = Math.min(collectionListPage, totalCollectionPages)

  const paginatedCollections = useMemo(() => {
    const startIndex = (safeCollectionListPage - 1) * COLLECTION_LIST_PAGE_SIZE
    return collections.slice(startIndex, startIndex + COLLECTION_LIST_PAGE_SIZE)
  }, [collections, safeCollectionListPage])

  const multiEditableColumns = useMemo(() => {
    const columns: Array<'quantity' | 'fat' | 'snf' | 'mava' | 'remarks'> = ['quantity']
    if (collectionQualityVisibility.showFat) columns.push('fat')
    if (collectionQualityVisibility.showSnf) columns.push('snf')
    if (collectionQualityVisibility.showMava) columns.push('mava')
    columns.push('remarks')
    return columns
  }, [collectionQualityVisibility.showFat, collectionQualityVisibility.showMava, collectionQualityVisibility.showSnf])

  const buildCellKey = (rowIndex: number, columnKey: string) => `${rowIndex}:${columnKey}`

  const focusMultiCell = (rowIndex: number, columnKey: string) => {
    const key = buildCellKey(rowIndex, columnKey)
    const element = multiCellRefs.current[key]
    if (element) {
      element.focus()
      element.select()
    }
  }

  const moveMultiGridFocus = (
    rowIndex: number,
    columnKey: string,
    direction: 'up' | 'down' | 'left' | 'right' | 'enter',
  ) => {
    const columnIndex = multiEditableColumns.indexOf(columnKey as (typeof multiEditableColumns)[number])
    if (columnIndex < 0) return

    let nextRowIndex = rowIndex
    let nextColumnIndex = columnIndex

    if (direction === 'up') nextRowIndex = Math.max(0, rowIndex - 1)
    if (direction === 'down' || direction === 'enter') nextRowIndex = Math.min(farmers.length - 1, rowIndex + 1)
    if (direction === 'left') nextColumnIndex = Math.max(0, columnIndex - 1)
    if (direction === 'right') nextColumnIndex = Math.min(multiEditableColumns.length - 1, columnIndex + 1)

    focusMultiCell(nextRowIndex, multiEditableColumns[nextColumnIndex])
  }

  const onMultiGridCellKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    columnKey: 'quantity' | 'fat' | 'snf' | 'mava' | 'remarks',
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      moveMultiGridFocus(rowIndex, columnKey, 'enter')
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveMultiGridFocus(rowIndex, columnKey, 'down')
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveMultiGridFocus(rowIndex, columnKey, 'up')
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveMultiGridFocus(rowIndex, columnKey, 'left')
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveMultiGridFocus(rowIndex, columnKey, 'right')
    }
  }

  const updateDraftRow = (farmerUuid: string, patch: Partial<MultiCollectionDraftRow>) => {
    setMultiRows((prev) => ({
      ...prev,
      [farmerUuid]: {
        ...(prev[farmerUuid] || EMPTY_MULTI_ROW),
        ...patch,
      },
    }))
  }

  const toggleSelectAllRows = () => {
    const nextSelected = !allFarmersSelected
    setMultiRows((prev) => {
      const next = { ...prev }
      for (const farmer of farmers) {
        next[farmer.uuid] = {
          ...(next[farmer.uuid] || EMPTY_MULTI_ROW),
          selected: nextSelected,
        }
      }
      return next
    })
  }

  const toggleCollectionListVisibility = () => {
    setShowCollectionList((prev) => !prev)
    setCollectionListPage(1)
  }

  const handleCreateMultiCollections = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const entries: MultiCollectionEntryInput[] = farmers
      .map((farmer) => ({ farmer, row: getDraftRow(farmer.uuid) }))
      .filter(({ row }) => row.selected)
      .map(({ farmer, row }) => ({
        farmerUuid: farmer.uuid,
        quantity: Number(row.quantity || 0),
        fat: Number(row.fat || 0),
        snf: row.snf.trim() === '' ? null : Number(row.snf),
        mava: Number(row.mava || 0),
        remarks: row.remarks,
      }))

    await onCreateMultipleCollections(entries)

    setMultiRows((prev) => {
      const next = { ...prev }
      for (const farmer of farmers) {
        if (!next[farmer.uuid]?.selected) continue
        next[farmer.uuid] = { ...EMPTY_MULTI_ROW }
      }
      return next
    })
  }

  return (
    <section className="panel panel-collection">
      <div className="panel-head">
        <h2>Milk Collections</h2>
        <button type="button" onClick={loadCollections} disabled={busy}>
          Reload
        </button>
      </div>
      <div className="collection-layout">
        <form
          className="collection-form"
          onSubmit={collectionMode === 'single' ? onCreateCollection : handleCreateMultiCollections}
        >
          <div className="collection-form-head">
            <div className="collection-form-title-row">
              <h3>Milk Collection Entry</h3>
              <div className="collection-mode-switch" role="tablist" aria-label="Collection mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={collectionMode === 'single'}
                  className={collectionMode === 'single' ? 'collection-mode-btn active' : 'collection-mode-btn'}
                  onClick={() => setCollectionMode('single')}
                >
                  Single Farmer
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={collectionMode === 'multi'}
                  className={collectionMode === 'multi' ? 'collection-mode-btn active' : 'collection-mode-btn'}
                  onClick={() => setCollectionMode('multi')}
                >
                  Multi Farmer
                </button>
              </div>
            </div>
          </div>

          <div className="collection-grid">
            {collectionMode === 'single' ? (
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
            ) : (
              <div className="collection-farmer-row collection-field-wide collection-farmer-row-multi">
                <label className="collection-field">
                  <span>Collection No (Auto)</span>
                  <input type="text" value={collectionForm.collectionNo} disabled readOnly />
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
            )}

            <div className="collection-meta-row collection-field-wide">
              <label className="collection-field">
                <span>Collection Date</span>
                <input
                  required
                  type="date"
                  value={collectionForm.collectionDate}
                  onChange={(event) => setCollectionForm((prev) => ({ ...prev, collectionDate: event.target.value }))}
                />
              </label>

              <label className="collection-field">
                <span>Shift</span>
                <select
                  required
                  value={collectionForm.shiftUuid}
                  onChange={(event) => setCollectionForm((prev) => ({ ...prev, shiftUuid: event.target.value }))}
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
                  onChange={(event) => setCollectionForm((prev) => ({ ...prev, milkTypeUuid: event.target.value }))}
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

            {collectionMode === 'single' ? (
              <>
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
                        onChange={(event) => setCollectionForm((prev) => ({ ...prev, fat: Number(event.target.value) }))}
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
              </>
            ) : (
              <div className="collection-field-wide multi-collection-table-wrap">
                <div className="table-wrap multi-grid-ultra-compact">
                  <table className="multi-collection-table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={allFarmersSelected}
                            onChange={toggleSelectAllRows}
                            aria-label="Select all farmers"
                          />
                        </th>
                        <th>Farmer</th>
                        <th>Quantity (L)</th>
                        {collectionQualityVisibility.showFat && <th>FAT</th>}
                        {collectionQualityVisibility.showSnf && <th>SNF</th>}
                        {collectionQualityVisibility.showMava && <th>Mava</th>}
                        <th>Rate</th>
                        <th>Amount</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {multiRowCalculations.map(({ farmer, row, rowCalc }, rowIndex) => {

                        return (
                          <tr key={farmer.uuid} className={row.selected ? 'is-selected' : ''}>
                            <td>
                              <input
                                type="checkbox"
                                checked={row.selected}
                                onChange={(event) => updateDraftRow(farmer.uuid, { selected: event.target.checked })}
                                aria-label={`Select ${farmer.farmerName}`}
                              />
                            </td>
                            <td>
                              <div className="multi-collection-farmer-name">{farmer.farmerName}</div>
                              <div className="subtle">{farmer.farmerCode || farmer.mobileNo || 'Farmer'}</div>
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={row.quantity}
                                onChange={(event) =>
                                  updateDraftRow(farmer.uuid, {
                                    quantity: event.target.value,
                                    selected: true,
                                  })
                                }
                                placeholder="0.00"
                                ref={(element) => {
                                  multiCellRefs.current[buildCellKey(rowIndex, 'quantity')] = element
                                }}
                                onKeyDown={(event) => onMultiGridCellKeyDown(event, rowIndex, 'quantity')}
                              />
                            </td>
                            {collectionQualityVisibility.showFat && (
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={row.fat}
                                  onChange={(event) =>
                                    updateDraftRow(farmer.uuid, {
                                      fat: event.target.value,
                                      selected: true,
                                    })
                                  }
                                  placeholder="0"
                                  ref={(element) => {
                                    multiCellRefs.current[buildCellKey(rowIndex, 'fat')] = element
                                  }}
                                  onKeyDown={(event) => onMultiGridCellKeyDown(event, rowIndex, 'fat')}
                                />
                              </td>
                            )}
                            {collectionQualityVisibility.showSnf && (
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={row.snf}
                                  onChange={(event) =>
                                    updateDraftRow(farmer.uuid, {
                                      snf: event.target.value,
                                      selected: true,
                                    })
                                  }
                                  placeholder="0"
                                  ref={(element) => {
                                    multiCellRefs.current[buildCellKey(rowIndex, 'snf')] = element
                                  }}
                                  onKeyDown={(event) => onMultiGridCellKeyDown(event, rowIndex, 'snf')}
                                />
                              </td>
                            )}
                            {collectionQualityVisibility.showMava && (
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={row.mava}
                                  onChange={(event) =>
                                    updateDraftRow(farmer.uuid, {
                                      mava: event.target.value,
                                      selected: true,
                                    })
                                  }
                                  placeholder="0"
                                  ref={(element) => {
                                    multiCellRefs.current[buildCellKey(rowIndex, 'mava')] = element
                                  }}
                                  onKeyDown={(event) => onMultiGridCellKeyDown(event, rowIndex, 'mava')}
                                />
                              </td>
                            )}
                            <td>
                              <input type="text" value={formatDecimal(rowCalc.rate)} readOnly tabIndex={-1} />
                            </td>
                            <td>
                              <input type="text" value={formatDecimal(rowCalc.amount)} readOnly tabIndex={-1} />
                            </td>
                            <td>
                              <input
                                value={row.remarks}
                                onChange={(event) =>
                                  updateDraftRow(farmer.uuid, {
                                    remarks: event.target.value,
                                    selected: true,
                                  })
                                }
                                placeholder="Optional"
                                ref={(element) => {
                                  multiCellRefs.current[buildCellKey(rowIndex, 'remarks')] = element
                                }}
                                onKeyDown={(event) => onMultiGridCellKeyDown(event, rowIndex, 'remarks')}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="multi-collection-total-row">
                        <td colSpan={2}>Selected Totals</td>
                        <td>{formatDecimal(multiSelectedTotals.quantity)}</td>
                        {collectionQualityVisibility.showFat && <td />}
                        {collectionQualityVisibility.showSnf && <td />}
                        {collectionQualityVisibility.showMava && <td />}
                        <td />
                        <td>{formatDecimal(multiSelectedTotals.amount)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="collection-form-actions">
            <button type="submit" disabled={busy} className="collection-submit">
              {busy
                ? 'Saving...'
                : collectionMode === 'single'
                  ? editingCollectionUuid
                    ? 'Update Collection'
                    : 'Save Collection'
                  : 'Save Selected Farmer Collections'}
            </button>
            {collectionMode === 'single' && editingCollectionUuid && (
              <button
                type="button"
                className="collection-cancel-edit-btn"
                onClick={onCancelCollectionEdit}
                disabled={busy}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="collection-history-toggle-row">
          <button
            type="button"
            className="collection-history-toggle-btn"
            onClick={toggleCollectionListVisibility}
          >
            {showCollectionList ? 'Hide Collection List' : 'View Collection List'}
          </button>
          <p className="subtle">Total records: {collections.length}</p>
        </div>

      </div>

      {showCollectionList && (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Collection No</th>
                  <th>Farmer</th>
                  <th>Date</th>
                  <th>Qty</th>
                  <th>Gross</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCollections.length === 0 && (
                  <tr>
                    <td colSpan={6}>No collection records found.</td>
                  </tr>
                )}
                {paginatedCollections.map((item) => (
                  <tr key={item.uuid}>
                    <td>{item.collectionNo}</td>
                    <td>{item.farmerName}</td>
                    <td>{item.collectionDate}</td>
                    <td>{item.quantity}</td>
                    <td>{item.grossAmount}</td>
                    <td>
                      <div className="collection-list-actions">
                        <button
                          type="button"
                          onClick={() => {
                            setCollectionMode('single')
                            onEditCollection(item)
                          }}
                          disabled={busy}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="collection-list-delete-btn"
                          onClick={() => {
                            void onDeleteCollection(item)
                          }}
                          disabled={busy}
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

          <div className="collection-pagination-row">
            <button
              type="button"
              onClick={() => setCollectionListPage((prev) => Math.max(1, prev - 1))}
              disabled={safeCollectionListPage <= 1}
            >
              Previous
            </button>
            <span>
              Page {safeCollectionListPage} of {totalCollectionPages}
            </span>
            <button
              type="button"
              onClick={() => setCollectionListPage((prev) => Math.min(totalCollectionPages, prev + 1))}
              disabled={safeCollectionListPage >= totalCollectionPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  )
}
