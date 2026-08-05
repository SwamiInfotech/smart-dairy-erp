import { useEffect, useMemo, useRef, useState, type ChangeEvent, type Dispatch, type FormEvent, type KeyboardEvent, type SetStateAction } from 'react'
import type {
  FarmerResponse,
  MilkRateChartResponse,
  MilkTypeResponse,
  ShiftResponse,
} from '../types/api'
import { toInputDate } from '../lib/appCoreUtils'
import type { CollectionEntryMode } from '../lib/collectionEntryMode'
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
  entryMode?: CollectionEntryMode
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
type CollectionMethodFilter = 'ALL' | 'FAT' | 'MAVA'
type CollectionEntryModeFilter = 'ALL' | 'SINGLE' | 'MULTI'

type CollectionConfirmAction = 'save-single' | 'update-single' | 'save-multi' | 'delete'

type CollectionConfirmDialogState = {
  open: boolean
  title: string
  message: string
  action: CollectionConfirmAction
  item: CollectionListItem | null
}

type MultiShiftVariant = 'morning' | 'evening'

type MultiCollectionDraftRow = {
  selected: boolean
  quantity: string
  fat: string
  snf: string
  mava: string
  remarks: string
  activeMetric: 'fat' | 'snf' | 'mava' | ''
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
  onCreateMultipleCollections: (entries: MultiCollectionEntryInput[], shiftUuid: string) => void | Promise<void>
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
  activeMetric: '',
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
  const todayDate = toInputDate(new Date())
  const [collectionMode, setCollectionMode] = useState<CollectionMode>('single')
  const [showCollectionList, setShowCollectionList] = useState(false)
  const [collectionListDateFilter, setCollectionListDateFilter] = useState(todayDate)
  const [collectionListMethodFilter, setCollectionListMethodFilter] = useState<CollectionMethodFilter>('ALL')
  const [collectionListEntryModeFilter, setCollectionListEntryModeFilter] = useState<CollectionEntryModeFilter>('ALL')
  const [collectionListPage, setCollectionListPage] = useState(1)
  const [confirmBusy, setConfirmBusy] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<CollectionConfirmDialogState>({
    open: false,
    title: '',
    message: '',
    action: 'save-single',
    item: null,
  })
  const [multiRowsByShift, setMultiRowsByShift] = useState<Record<MultiShiftVariant, Record<string, MultiCollectionDraftRow>>>(
    {
      morning: {},
      evening: {},
    },
  )
  const multiCellRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const collectionListAnchorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!showCollectionList) return

    // Ensure the list is rendered first, then move viewport to it.
    requestAnimationFrame(() => {
      collectionListAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [showCollectionList])

  useEffect(() => {
    if (!confirmDialog.open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [confirmDialog.open])

  useEffect(() => {
    if (!confirmDialog.open) return

    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !confirmBusy) {
        setConfirmDialog((prev) => ({ ...prev, open: false }))
      }
    }

    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [confirmBusy, confirmDialog.open])

  const getMultiRowsForShift = (variant: MultiShiftVariant) => {
    return multiRowsByShift[variant] || {}
  }

  const getDraftRow = (variant: MultiShiftVariant, farmerUuid: string): MultiCollectionDraftRow => {
    return getMultiRowsForShift(variant)[farmerUuid] || EMPTY_MULTI_ROW
  }

  const getSelectedMultiCount = (variant: MultiShiftVariant) =>
    farmers.filter((farmer) => getDraftRow(variant, farmer.uuid).selected).length

  const getAllFarmersSelected = (variant: MultiShiftVariant) =>
    farmers.length > 0 && getSelectedMultiCount(variant) === farmers.length

  const resolveShiftUuidForVariant = (variant: MultiShiftVariant) => {
    const directMatch = shifts.find((shift) => {
      const shiftDescriptor = `${shift.name || ''} ${shift.code || ''}`.toLowerCase()
      return variant === 'morning' ? shiftDescriptor.includes('morn') : shiftDescriptor.includes('even')
    })

    if (directMatch) {
      return directMatch.uuid
    }

    if (variant === 'morning') {
      return shifts[0]?.uuid || ''
    }

    return shifts[1]?.uuid || shifts[0]?.uuid || ''
  }

  const buildMultiRowCalculations = (variant: MultiShiftVariant) =>
    farmers.map((farmer) => {
      const row = getDraftRow(variant, farmer.uuid)
      return {
        farmer,
        row,
        rowCalc: resolveRowRateAmount(farmer, row),
      }
    })

  const buildMultiSelectedTotals = (variant: MultiShiftVariant) => {
    return buildMultiRowCalculations(variant).reduce(
      (acc, current) => {
        if (!current.row.selected) return acc

        const quantity = Number(current.row.quantity || 0)
        acc.quantity += Number.isFinite(quantity) ? quantity : 0
        acc.amount += current.rowCalc.amount || 0
        return acc
      },
      { quantity: 0, amount: 0 },
    )
  }

  const resolveRowRateAmount = (farmer: FarmerResponse, row: MultiCollectionDraftRow) => {
    const chartUuid = farmer.milkRateChartUuid || ''
    const chart = chartUuid ? milkRateCharts.find((item) => item.uuid === chartUuid) || null : null
    const isDateWithinRateChart = isCollectionDateWithinRateChartRange(collectionForm.collectionDate, chart)

    const qualityInput = {
      fat: Number(row.fat || 0),
      snf: row.snf.trim() === '' ? null : Number(row.snf),
      mava: Number(row.mava || 0),
    }

    const hasVisibleQualityInput =
      (collectionQualityVisibility.showFat && qualityInput.fat > 0) ||
      (collectionQualityVisibility.showSnf && (Number(qualityInput.snf || 0) > 0)) ||
      (collectionQualityVisibility.showMava && qualityInput.mava > 0)

    // Keep default rate as 0 in multi-grid rows until user enters a quality value.
    if (!hasVisibleQualityInput) {
      return {
        rate: 0,
        amount: 0,
      }
    }

    const defaultActiveQuality = resolveActiveCollectionQuality(qualityInput, collectionQualityVisibility)
    const metricValueMap = {
      fat: Number(row.fat || 0),
      snf: Number(row.snf || 0),
      mava: Number(row.mava || 0),
    } as const

    const preferredMetric = row.activeMetric
    const preferredMetricVisible =
      (preferredMetric === 'fat' && collectionQualityVisibility.showFat) ||
      (preferredMetric === 'snf' && collectionQualityVisibility.showSnf) ||
      (preferredMetric === 'mava' && collectionQualityVisibility.showMava)

    const activeQuality = preferredMetric && preferredMetricVisible && metricValueMap[preferredMetric] > 0
      ? {
          metric: preferredMetric,
          value: metricValueMap[preferredMetric],
        }
      : defaultActiveQuality

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

  const formatDecimal = (value: number) => roundToTwo(value).toFixed(2)

  const classifyCollectionShift = (item: CollectionListItem) => {
    const shiftMatch = shifts.find((shift) => shift.uuid === item.shiftUuid)
    const shiftDescriptor = `${shiftMatch?.name || ''} ${shiftMatch?.code || ''}`.toLowerCase()

    if (shiftDescriptor.includes('morn')) {
      return 'morning'
    }

    if (shiftDescriptor.includes('even')) {
      return 'evening'
    }

    const collectionHour = Number.parseInt((item.collectionTime || '').slice(0, 2), 10)
    if (Number.isFinite(collectionHour)) {
      return collectionHour < 12 ? 'morning' : 'evening'
    }

    return 'morning'
  }

  const resolveCollectionMethodTag = (item: CollectionListItem) => {
    const hasFat = item.fat != null
    const hasSnf = item.snf != null
    const hasMava = item.mava != null

    if (hasFat && !hasSnf && !hasMava) return 'FAT'
    if (!hasFat && !hasSnf && hasMava) return 'MAVA'
    if (!hasFat && hasSnf && !hasMava) return 'SNF'
    if (hasFat || hasSnf || hasMava) return 'MIXED'
    return 'UNKNOWN'
  }

  const resolveCollectionEntryModeTag = (item: CollectionListItem) => {
    if (item.entryMode === 'single') return 'SINGLE'
    if (item.entryMode === 'multi') return 'MULTI'
    return 'UNKNOWN'
  }

  const resolveCollectionShiftLabel = (item: CollectionListItem) => {
    const shiftName = shifts.find((shift) => shift.uuid === item.shiftUuid)?.name?.trim()
    if (shiftName) return shiftName
    return classifyCollectionShift(item) === 'morning' ? 'Morning' : 'Evening'
  }

  const filteredCollections = useMemo(() => {
    return collections.filter((item) => {
      if (collectionListDateFilter && item.collectionDate !== collectionListDateFilter) {
        return false
      }

      if (collectionListMethodFilter !== 'ALL' && resolveCollectionMethodTag(item) !== collectionListMethodFilter) {
        return false
      }

      if (collectionListEntryModeFilter !== 'ALL' && resolveCollectionEntryModeTag(item) !== collectionListEntryModeFilter) {
        return false
      }

      return true
    })
  }, [collectionListDateFilter, collectionListEntryModeFilter, collectionListMethodFilter, collections])

  const totalCollectionPages = Math.max(1, Math.ceil(filteredCollections.length / COLLECTION_LIST_PAGE_SIZE))
  const safeCollectionListPage = Math.min(collectionListPage, totalCollectionPages)

  const paginatedCollections = useMemo(() => {
    const startIndex = (safeCollectionListPage - 1) * COLLECTION_LIST_PAGE_SIZE
    return filteredCollections.slice(startIndex, startIndex + COLLECTION_LIST_PAGE_SIZE)
  }, [filteredCollections, safeCollectionListPage])

  useEffect(() => {
    setCollectionListPage(1)
  }, [collectionListDateFilter, collectionListEntryModeFilter, collectionListMethodFilter])

  const renderCollectionEntryFields = () => (
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
            onChange={(event) => setCollectionForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))}
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
              onChange={(event) => setCollectionForm((prev) => ({ ...prev, mava: Number(event.target.value) }))}
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
  )

  const multiEditableColumns = useMemo(() => {
    const columns: Array<'quantity' | 'fat' | 'snf' | 'mava' | 'remarks'> = ['quantity']

    if (collectionQualityVisibility.showFat) {
      columns.push('fat')
    }

    if (collectionQualityVisibility.showSnf) {
      columns.push('snf')
    }

    if (collectionQualityVisibility.showMava) {
      columns.push('mava')
    }

    columns.push('remarks')
    return columns
  }, [collectionQualityVisibility.showFat, collectionQualityVisibility.showMava, collectionQualityVisibility.showSnf])

  const buildCellKey = (variant: MultiShiftVariant, rowIndex: number, columnKey: string) => `${variant}:${rowIndex}:${columnKey}`

  const focusMultiCell = (variant: MultiShiftVariant, rowIndex: number, columnKey: string) => {
    const key = buildCellKey(variant, rowIndex, columnKey)
    const element = multiCellRefs.current[key]
    if (element) {
      element.focus()
      element.select()
    }
  }

  const moveMultiGridFocus = (
    variant: MultiShiftVariant,
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

    focusMultiCell(variant, nextRowIndex, multiEditableColumns[nextColumnIndex])
  }

  const onMultiGridCellKeyDown = (
    variant: MultiShiftVariant,
    event: KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    columnKey: 'quantity' | 'fat' | 'snf' | 'mava' | 'remarks',
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      moveMultiGridFocus(variant, rowIndex, columnKey, 'enter')
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveMultiGridFocus(variant, rowIndex, columnKey, 'down')
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveMultiGridFocus(variant, rowIndex, columnKey, 'up')
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveMultiGridFocus(variant, rowIndex, columnKey, 'left')
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveMultiGridFocus(variant, rowIndex, columnKey, 'right')
    }
  }

  const updateDraftRow = (variant: MultiShiftVariant, farmerUuid: string, patch: Partial<MultiCollectionDraftRow>) => {
    setMultiRowsByShift((prev) => ({
      ...prev,
      [variant]: {
        ...(prev[variant] || {}),
        [farmerUuid]: {
          ...(prev[variant]?.[farmerUuid] || EMPTY_MULTI_ROW),
          ...patch,
        },
      },
    }))
  }

  const toggleSelectAllRows = (variant: MultiShiftVariant) => {
    const nextSelected = !getAllFarmersSelected(variant)
    setMultiRowsByShift((prev) => {
      const next = { ...prev }
      next[variant] = { ...(next[variant] || {}) }
      for (const farmer of farmers) {
        next[variant][farmer.uuid] = {
          ...(next[variant][farmer.uuid] || EMPTY_MULTI_ROW),
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

  const handleCreateMultiCollections = async (variant: MultiShiftVariant) => {
    const entries: MultiCollectionEntryInput[] = farmers
      .map((farmer) => ({ farmer, row: getDraftRow(variant, farmer.uuid) }))
      .filter(({ row }) => row.selected)
      .map(({ farmer, row }) => ({
        farmerUuid: farmer.uuid,
        quantity: Number(row.quantity || 0),
        fat: Number(row.fat || 0),
        snf: row.snf.trim() === '' ? null : Number(row.snf),
        mava: Number(row.mava || 0),
        remarks: row.remarks,
      }))

    await onCreateMultipleCollections(entries, resolveShiftUuidForVariant(variant))

    setMultiRowsByShift((prev) => {
      const next = { ...prev }
      next[variant] = { ...(next[variant] || {}) }
      for (const farmer of farmers) {
        if (!next[variant][farmer.uuid]?.selected) continue
        next[variant][farmer.uuid] = { ...EMPTY_MULTI_ROW }
      }
      return next
    })
  }

  const renderMultiCollectionGrid = () => {
    const morningRows = buildMultiRowCalculations('morning')
    const eveningRows = buildMultiRowCalculations('evening')
    const morningTotals = buildMultiSelectedTotals('morning')
    const eveningTotals = buildMultiSelectedTotals('evening')
    const morningAllSelected = getAllFarmersSelected('morning')
    const eveningAllSelected = getAllFarmersSelected('evening')
    const morningColumnCount = 4 + (collectionQualityVisibility.showFat ? 1 : 0) + (collectionQualityVisibility.showSnf ? 1 : 0) + (collectionQualityVisibility.showMava ? 1 : 0)
    const eveningColumnCount = morningColumnCount

    return (
      <div className="collection-field-wide collection-panel-table-wrap">
        <div className="table-wrap multi-grid-ultra-compact">
          <table className="multi-collection-table multi-collection-table-split">
            <colgroup>
              <col className="col-freeze-checkbox" />
              <col className="col-freeze-farmer" />
              <col className="col-morning-qty" />
              {collectionQualityVisibility.showFat && <col className="col-morning-fat" />}
              {collectionQualityVisibility.showSnf && <col className="col-morning-snf" />}
              {collectionQualityVisibility.showMava && <col className="col-morning-mava" />}
              <col className="col-morning-rate" />
              <col className="col-morning-amount" />
              <col className="col-morning-remarks" />
              <col className="col-split-divider" />
              <col className="col-evening-qty" />
              {collectionQualityVisibility.showFat && <col className="col-evening-fat" />}
              {collectionQualityVisibility.showSnf && <col className="col-evening-snf" />}
              {collectionQualityVisibility.showMava && <col className="col-evening-mava" />}
              <col className="col-evening-rate" />
              <col className="col-evening-amount" />
              <col className="col-evening-remarks-fill" />
            </colgroup>
            <thead>
              <tr className="multi-split-group-row">
                <th rowSpan={2} className="freeze-col-checkbox">
                  <input
                    type="checkbox"
                    checked={morningAllSelected || eveningAllSelected}
                    onChange={() => {
                      toggleSelectAllRows('morning')
                      toggleSelectAllRows('evening')
                    }}
                    aria-label="Select all farmers for morning and evening"
                  />
                </th>
                <th rowSpan={2} className="freeze-col-farmer">Farmer</th>
                <th colSpan={morningColumnCount}>Morning Collection</th>
                <th className="multi-split-divider" rowSpan={2} />
                <th colSpan={eveningColumnCount}>Evening Collection</th>
              </tr>
              <tr className="multi-split-columns-row">
                <th className="multi-col-qty morning-highlight-col">Qty (L)</th>
                {collectionQualityVisibility.showFat && <th className="multi-col-fat">FAT</th>}
                {collectionQualityVisibility.showSnf && <th className="multi-col-snf">SNF</th>}
                {collectionQualityVisibility.showMava && <th className="multi-col-mava morning-highlight-col">Mava</th>}
                <th className="multi-col-rate">Rate</th>
                <th className="multi-col-amount">Amount</th>
                <th className="multi-col-remarks">Remarks</th>
                <th className="multi-col-qty">Qty (L)</th>
                {collectionQualityVisibility.showFat && <th className="multi-col-fat">FAT</th>}
                {collectionQualityVisibility.showSnf && <th className="multi-col-snf">SNF</th>}
                {collectionQualityVisibility.showMava && <th className="multi-col-mava">Mava</th>}
                <th className="multi-col-rate">Rate</th>
                <th className="multi-col-amount">Amount</th>
                <th className="multi-col-remarks multi-col-remarks-fill">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((farmer, rowIndex) => {
                const morningRow = morningRows[rowIndex]
                const eveningRow = eveningRows[rowIndex]

                return (
                  <tr key={farmer.uuid}>
                    <td className="freeze-col-checkbox">
                      <input
                        type="checkbox"
                        checked={morningRow.row.selected || eveningRow.row.selected}
                        onChange={(event) => {
                          updateDraftRow('morning', farmer.uuid, { selected: event.target.checked })
                          updateDraftRow('evening', farmer.uuid, { selected: event.target.checked })
                        }}
                        aria-label={`Select ${farmer.farmerName}`}
                      />
                    </td>
                    <td className="freeze-col-farmer">
                      <div className="multi-collection-farmer-name">{farmer.farmerName}</div>
                      <div className="subtle">{farmer.farmerCode || farmer.mobileNo || 'Farmer'}</div>
                    </td>

                    <td className="multi-col-qty morning-highlight-cell">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={morningRow.row.quantity}
                        onChange={(event) => updateDraftRow('morning', farmer.uuid, { quantity: event.target.value, selected: true })}
                        placeholder="0.00"
                        ref={(element) => {
                          multiCellRefs.current[buildCellKey('morning', rowIndex, 'quantity')] = element
                        }}
                        onKeyDown={(event) => onMultiGridCellKeyDown('morning', event, rowIndex, 'quantity')}
                      />
                    </td>
                    {collectionQualityVisibility.showFat && (
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={morningRow.row.fat}
                          onChange={(event) => updateDraftRow('morning', farmer.uuid, { fat: event.target.value, selected: true, activeMetric: 'fat' })}
                          placeholder="0"
                          ref={(element) => {
                            multiCellRefs.current[buildCellKey('morning', rowIndex, 'fat')] = element
                          }}
                          onKeyDown={(event) => onMultiGridCellKeyDown('morning', event, rowIndex, 'fat')}
                        />
                      </td>
                    )}
                    {collectionQualityVisibility.showSnf && (
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={morningRow.row.snf}
                          onChange={(event) => updateDraftRow('morning', farmer.uuid, { snf: event.target.value, selected: true, activeMetric: 'snf' })}
                          placeholder="0"
                          ref={(element) => {
                            multiCellRefs.current[buildCellKey('morning', rowIndex, 'snf')] = element
                          }}
                          onKeyDown={(event) => onMultiGridCellKeyDown('morning', event, rowIndex, 'snf')}
                        />
                      </td>
                    )}
                    {collectionQualityVisibility.showMava && (
                      <td className="multi-col-mava morning-highlight-cell">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={morningRow.row.mava}
                          onChange={(event) => updateDraftRow('morning', farmer.uuid, { mava: event.target.value, selected: true, activeMetric: 'mava' })}
                          placeholder="0"
                          ref={(element) => {
                            multiCellRefs.current[buildCellKey('morning', rowIndex, 'mava')] = element
                          }}
                          onKeyDown={(event) => onMultiGridCellKeyDown('morning', event, rowIndex, 'mava')}
                        />
                      </td>
                    )}
                    <td className="multi-col-rate">
                      <input type="text" value={formatDecimal(morningRow.rowCalc.rate)} readOnly tabIndex={-1} />
                    </td>
                    <td className="multi-col-amount">
                      <input type="text" value={formatDecimal(morningRow.rowCalc.amount)} readOnly tabIndex={-1} />
                    </td>
                    <td className="multi-col-remarks">
                      <input
                        value={morningRow.row.remarks}
                        onChange={(event) => updateDraftRow('morning', farmer.uuid, { remarks: event.target.value, selected: true })}
                        placeholder="Optional"
                        ref={(element) => {
                          multiCellRefs.current[buildCellKey('morning', rowIndex, 'remarks')] = element
                        }}
                        onKeyDown={(event) => onMultiGridCellKeyDown('morning', event, rowIndex, 'remarks')}
                      />
                    </td>

                    <td className="multi-split-divider" />

                    <td className="multi-col-qty">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={eveningRow.row.quantity}
                        onChange={(event) => updateDraftRow('evening', farmer.uuid, { quantity: event.target.value, selected: true })}
                        placeholder="0.00"
                        ref={(element) => {
                          multiCellRefs.current[buildCellKey('evening', rowIndex, 'quantity')] = element
                        }}
                        onKeyDown={(event) => onMultiGridCellKeyDown('evening', event, rowIndex, 'quantity')}
                      />
                    </td>
                    {collectionQualityVisibility.showFat && (
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={eveningRow.row.fat}
                          onChange={(event) => updateDraftRow('evening', farmer.uuid, { fat: event.target.value, selected: true, activeMetric: 'fat' })}
                          placeholder="0"
                          ref={(element) => {
                            multiCellRefs.current[buildCellKey('evening', rowIndex, 'fat')] = element
                          }}
                          onKeyDown={(event) => onMultiGridCellKeyDown('evening', event, rowIndex, 'fat')}
                        />
                      </td>
                    )}
                    {collectionQualityVisibility.showSnf && (
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={eveningRow.row.snf}
                          onChange={(event) => updateDraftRow('evening', farmer.uuid, { snf: event.target.value, selected: true, activeMetric: 'snf' })}
                          placeholder="0"
                          ref={(element) => {
                            multiCellRefs.current[buildCellKey('evening', rowIndex, 'snf')] = element
                          }}
                          onKeyDown={(event) => onMultiGridCellKeyDown('evening', event, rowIndex, 'snf')}
                        />
                      </td>
                    )}
                    {collectionQualityVisibility.showMava && (
                      <td className="multi-col-mava">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={eveningRow.row.mava}
                          onChange={(event) => updateDraftRow('evening', farmer.uuid, { mava: event.target.value, selected: true, activeMetric: 'mava' })}
                          placeholder="0"
                          ref={(element) => {
                            multiCellRefs.current[buildCellKey('evening', rowIndex, 'mava')] = element
                          }}
                          onKeyDown={(event) => onMultiGridCellKeyDown('evening', event, rowIndex, 'mava')}
                        />
                      </td>
                    )}
                    <td className="multi-col-rate">
                      <input type="text" value={formatDecimal(eveningRow.rowCalc.rate)} readOnly tabIndex={-1} />
                    </td>
                    <td className="multi-col-amount">
                      <input type="text" value={formatDecimal(eveningRow.rowCalc.amount)} readOnly tabIndex={-1} />
                    </td>
                    <td className="multi-col-remarks multi-col-remarks-fill">
                      <input
                        value={eveningRow.row.remarks}
                        onChange={(event) => updateDraftRow('evening', farmer.uuid, { remarks: event.target.value, selected: true })}
                        placeholder="Optional"
                        ref={(element) => {
                          multiCellRefs.current[buildCellKey('evening', rowIndex, 'remarks')] = element
                        }}
                        onKeyDown={(event) => onMultiGridCellKeyDown('evening', event, rowIndex, 'remarks')}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="multi-collection-total-row">
                <td className="freeze-col-checkbox" />
                <td className="freeze-col-farmer">Selected Totals</td>
                <td>{formatDecimal(morningTotals.quantity)}</td>
                {collectionQualityVisibility.showFat && <td />}
                {collectionQualityVisibility.showSnf && <td />}
                {collectionQualityVisibility.showMava && <td />}
                <td />
                <td>{formatDecimal(morningTotals.amount)}</td>
                <td className="multi-col-remarks" />
                <td className="multi-split-divider" />
                <td className="multi-col-qty">{formatDecimal(eveningTotals.quantity)}</td>
                {collectionQualityVisibility.showFat && <td />}
                {collectionQualityVisibility.showSnf && <td />}
                {collectionQualityVisibility.showMava && <td />}
                <td />
                <td>{formatDecimal(eveningTotals.amount)}</td>
                <td className="multi-col-remarks multi-col-remarks-fill" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  }

  const openConfirmDialog = (action: CollectionConfirmAction, item?: CollectionListItem) => {
    const title = action === 'delete'
      ? 'Delete Collection Record'
      : action === 'save-multi'
        ? 'Save Multi Farmer Collection'
        : action === 'update-single'
          ? 'Update Collection Entry'
          : 'Save Collection Entry'

    const message = action === 'delete'
      ? 'Do you really want to delete this collection record? This action cannot be undone.'
      : action === 'save-multi'
        ? 'Do you really want to save selected multi-farmer collection entries?'
        : action === 'update-single'
          ? 'Do you really want to update this milk collection entry?'
          : 'Do you really want to save this milk collection entry?'

    setConfirmDialog({
      open: true,
      title,
      message,
      action,
      item: item || null,
    })
  }

  const closeConfirmDialog = () => {
    if (confirmBusy) return
    setConfirmDialog((prev) => ({ ...prev, open: false }))
  }

  const handleConfirmAction = async () => {
    if (confirmBusy) return

    setConfirmBusy(true)

    try {
      if (confirmDialog.action === 'save-multi') {
        await handleCreateMultiCollections('morning')
        await handleCreateMultiCollections('evening')
        await loadCollections()
      } else if (confirmDialog.action === 'delete') {
        if (confirmDialog.item) {
          await onDeleteCollection(confirmDialog.item)
          await loadCollections()
        }
      } else {
        await onCreateCollection({ preventDefault: () => {} } as FormEvent<HTMLFormElement>)
        await loadCollections()
      }
    } finally {
      setConfirmBusy(false)
      setConfirmDialog((prev) => ({ ...prev, open: false }))
    }
  }

  const handleSaveMultiCollections = () => {
    openConfirmDialog('save-multi')
  }

  const handleDeleteCollection = (item: CollectionListItem) => {
    openConfirmDialog('delete', item)
  }

  const handleCollectionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    if (collectionMode === 'single') {
      event.preventDefault()
      openConfirmDialog(editingCollectionUuid ? 'update-single' : 'save-single')
      return
    }

    event.preventDefault()
  }

  return (
    <section className="panel panel-collection">
      <div className="panel-head">
        <h2>Milk Collections</h2>
        <button type="button" className="collection-reload-btn" onClick={loadCollections} disabled={busy}>
          Reload
        </button>
      </div>
      <div className="collection-layout">
        <form className="collection-form" onSubmit={handleCollectionSubmit}>
          <div className="collection-form-head">
            <div className="collection-form-title-row">
              <h3>Milk Collection Entry</h3>
              <div className="collection-form-switches">
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
                {!showCollectionList && (
                  <button
                    type="button"
                    className="collection-history-toggle-btn collection-history-toggle-btn-inline"
                    onClick={toggleCollectionListVisibility}
                  >
                    View Collection List
                  </button>
                )}
                <span className="subtle collection-record-count-inline">Total records: {collections.length}</span>
              </div>
            </div>
          </div>

          <div className="collection-grid">
            {collectionMode === 'single' ? (
              <div className="collection-meta-row collection-meta-row-single-top collection-field-wide">
                <label className="collection-field">
                  <span>Collection No</span>
                  <input type="text" value={collectionForm.collectionNo} disabled readOnly />
                </label>

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
            ) : (
              <div className="collection-meta-row collection-meta-row-multi-top collection-field-wide">
                <label className="collection-field">
                  <span>Collection No (Auto)</span>
                  <input type="text" value={collectionForm.collectionNo} disabled readOnly />
                </label>

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
            )}

            {collectionMode === 'single' && (
              <div className="collection-farmer-row collection-farmer-row-single collection-field-wide">
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
            )}

            {collectionMode === 'single' && renderCollectionEntryFields()}

            {collectionMode === 'multi' && renderMultiCollectionGrid()}

            {collectionMode === 'multi' && (
              <div className="collection-form-actions collection-panel-actions-bottom">
                <span className="subtle">
                  Morning: {getSelectedMultiCount('morning')} selected, Evening: {getSelectedMultiCount('evening')} selected
                </span>
                <button
                  type="button"
                  className="collection-submit collection-panel-save"
                  onClick={() => {
                    handleSaveMultiCollections()
                  }}
                  disabled={busy}
                >
                  Save Multi Farmer Collections
                </button>
              </div>
            )}

          </div>

          {collectionMode === 'single' && (
            <div className="collection-form-actions">
              <button type="submit" disabled={busy} className="collection-submit">
                {busy ? 'Saving...' : editingCollectionUuid ? 'Update Collection' : 'Save Collection'}
              </button>
              {editingCollectionUuid && (
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
          )}
        </form>

      </div>

      {showCollectionList && (
        <>
          <div ref={collectionListAnchorRef} className="collection-history-toggle-row">
            <button
              type="button"
              className="collection-history-toggle-btn collection-history-toggle-btn-inline"
              onClick={toggleCollectionListVisibility}
            >
              Hide Collection List
            </button>
            <div className="collection-history-filters">
              <label className="collection-history-filter-item">
                <span>Date</span>
                <input
                  type="date"
                  value={collectionListDateFilter}
                  onChange={(event) => setCollectionListDateFilter(event.target.value)}
                />
              </label>
              <label className="collection-history-filter-item">
                <span>Method</span>
                <select
                  value={collectionListMethodFilter}
                  onChange={(event) => setCollectionListMethodFilter(event.target.value as CollectionMethodFilter)}
                >
                  <option value="ALL">All</option>
                  <option value="FAT">FAT</option>
                  <option value="MAVA">MAVA</option>
                </select>
              </label>
              <label className="collection-history-filter-item">
                <span>Entry Type</span>
                <select
                  value={collectionListEntryModeFilter}
                  onChange={(event) => setCollectionListEntryModeFilter(event.target.value as CollectionEntryModeFilter)}
                >
                  <option value="ALL">All</option>
                  <option value="SINGLE">Single Farmer</option>
                  <option value="MULTI">Multi Farmer</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => {
                  setCollectionListDateFilter(todayDate)
                  setCollectionListMethodFilter('ALL')
                  setCollectionListEntryModeFilter('ALL')
                }}
                disabled={collectionListDateFilter === todayDate && collectionListMethodFilter === 'ALL' && collectionListEntryModeFilter === 'ALL'}
              >
                Reset
              </button>
            </div>
            <p className="subtle">Showing {filteredCollections.length} of {collections.length}</p>
          </div>

          <section className="collection-shift-list-panel">
            <div className="collection-shift-list-head">
              <h3>Collection List</h3>
              <span>{filteredCollections.length}</span>
            </div>

            <div className="table-wrap collection-shift-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Collection No</th>
                    <th>Farmer</th>
                    <th>Date</th>
                    <th>Shift</th>
                    <th>Method</th>
                    <th>Entry Type</th>
                    <th>Qty</th>
                    <th>Gross</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCollections.length === 0 && (
                    <tr>
                      <td colSpan={9}>No collections found for selected filters.</td>
                    </tr>
                  )}
                  {paginatedCollections.map((item) => (
                    <tr key={item.uuid}>
                      <td>{item.collectionNo}</td>
                      <td>{item.farmerName}</td>
                      <td>{item.collectionDate}</td>
                      <td>{resolveCollectionShiftLabel(item)}</td>
                      <td>{resolveCollectionMethodTag(item)}</td>
                      <td>{resolveCollectionEntryModeTag(item)}</td>
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
                              handleDeleteCollection(item)
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
          </section>

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

      {confirmDialog.open && (
        <div className="collection-confirm-overlay" role="presentation" onClick={closeConfirmDialog}>
          <div
            className="collection-confirm-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="collection-confirm-title"
            aria-describedby="collection-confirm-message"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="collection-confirm-title">{confirmDialog.title}</h3>
            <p id="collection-confirm-message">{confirmDialog.message}</p>
            <div className="collection-confirm-actions">
              <button
                type="button"
                className="collection-confirm-cancel"
                onClick={closeConfirmDialog}
                disabled={confirmBusy || busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="collection-confirm-primary"
                onClick={() => {
                  void handleConfirmAction()
                }}
                disabled={confirmBusy || busy}
              >
                {confirmBusy ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
