import type { FormEvent } from 'react'
import { useCallback, useState } from 'react'
import { api } from '../lib/api'
import { toInputDate, toInputTime } from '../lib/appCoreUtils'
import {
  fromApiCollectionEntryMode,
  extractCollectionEntryModeFromRemarks,
  stripCollectionEntryModeTag,
  toApiCollectionEntryMode,
  type CollectionEntryMode,
} from '../lib/collectionEntryMode'
import { resolveQualityFieldVisibility } from '../lib/uiHelpers'
import type {
  ApiCollectionEntryMode,
  FarmerResponse,
  LoanResponse,
  MasterLookupResponse,
  MilkTypeResponse,
  ShiftResponse,
} from '../types/api'

const AUTO_MILK_COLLECTION_LOAN_TAG_PREFIX = '[AUTO_MILK_COLLECTION_LOAN:'

function normalizeCollectionDateForLoan(value: string) {
  return (value || '').slice(0, 10)
}

function buildAutoMilkCollectionLoanTag(collectionUuid: string) {
  return `${AUTO_MILK_COLLECTION_LOAN_TAG_PREFIX}${collectionUuid}]`
}

function buildAutoMilkCollectionLoanRemarks(item: { uuid: string; collectionNo: string }) {
  return `${buildAutoMilkCollectionLoanTag(item.uuid)} Auto loan from milk collection ${item.collectionNo}`
}

type CollectionFormState = {
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
  loan: number
  advance: number
  remarks: string
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
  loan?: number | null
  advance?: number | null
  remarks?: string | null
  entryMode?: CollectionEntryMode
  grossAmount: number
}

type ApiCollectionListItem = Omit<CollectionListItem, 'entryMode'> & {
  entryMode?: ApiCollectionEntryMode | null
}

type MultiCollectionEntryInput = {
  farmerUuid: string
  quantity: number
  fat: number
  snf: number | null
  mava: number
  loan: number
  advance: number
  remarks: string
}

type UseCollectionCrudParams = {
  token: string
  collectionForm: CollectionFormState
  collections: CollectionListItem[]
  farmers: FarmerResponse[]
  shifts: ShiftResponse[]
  milkTypes: MilkTypeResponse[]
  selectedCollectionMethod: MasterLookupResponse | null
  runAction: <T>(action: () => Promise<T>, successMessage?: string) => Promise<T | null>
  setError: React.Dispatch<React.SetStateAction<string>>
  setCollections: React.Dispatch<React.SetStateAction<CollectionListItem[]>>
  setCollectionForm: React.Dispatch<React.SetStateAction<CollectionFormState>>
}

export function useCollectionCrud({
  token,
  collectionForm,
  collections,
  farmers,
  shifts,
  milkTypes,
  selectedCollectionMethod,
  runAction,
  setError,
  setCollections,
  setCollectionForm,
}: UseCollectionCrudParams) {
  const [editingCollectionUuid, setEditingCollectionUuid] = useState('')
  const [editingCollectionEntryMode, setEditingCollectionEntryMode] = useState<CollectionEntryMode>('single')

  const normalizeCollectionListItem = useCallback((item: ApiCollectionListItem): CollectionListItem => {
    const resolvedMode = fromApiCollectionEntryMode((item as { entryMode?: unknown }).entryMode)
    const entryMode = resolvedMode !== 'unknown'
      ? resolvedMode
      : extractCollectionEntryModeFromRemarks(item.remarks)

    return {
      ...item,
      entryMode,
      remarks: stripCollectionEntryModeTag(item.remarks),
    }
  }, [])

  const findAutoLoanRecordForCollection = useCallback(
    async (item: Pick<CollectionListItem, 'uuid' | 'farmerUuid' | 'collectionDate'>): Promise<LoanResponse | null> => {
      if (!token) return null
      if (!item.uuid) return null

      const farmerUuid = (item.farmerUuid || '').trim()
      if (!farmerUuid) return null

      const collectionDate = normalizeCollectionDateForLoan(item.collectionDate)
      const page = await api.searchLoans(token, {
        farmerUuid,
        fromDate: collectionDate || undefined,
        toDate: collectionDate || undefined,
        page: 0,
        size: 200,
      })

      const tag = buildAutoMilkCollectionLoanTag(item.uuid)
      return (page.content || []).find((loan) => (loan.remarks || '').includes(tag)) || null
    },
    [token],
  )

  const upsertAutoLoanRecordForCollection = useCallback(
    async (item: Pick<CollectionListItem, 'uuid' | 'collectionNo' | 'farmerUuid' | 'collectionDate' | 'loan'>) => {
      if (!token) return
      if (!item.uuid) return

      const farmerUuid = (item.farmerUuid || '').trim()
      if (!farmerUuid) return

      const loanAmount = Number(item.loan || 0)
      if (!Number.isFinite(loanAmount)) return

      const collectionDate = normalizeCollectionDateForLoan(item.collectionDate)
      const existing = await findAutoLoanRecordForCollection(item)

      if (loanAmount <= 0) {
        if (existing && existing.status === 'PENDING') {
          await api.deleteLoan(token, existing.uuid)
        }
        return
      }

      const remarks = buildAutoMilkCollectionLoanRemarks({
        uuid: item.uuid,
        collectionNo: item.collectionNo,
      })

      if (existing) {
        if (existing.status !== 'PENDING') {
          throw new Error('Linked loan is already approved and cannot be auto-updated from Milk Collections.')
        }

        const existingAmount = Number(existing.loanAmount || 0)
        const existingDate = normalizeCollectionDateForLoan(existing.loanDate)
        const existingRemarks = existing.remarks || ''
        const hasAmountChanged = Math.abs(existingAmount - loanAmount) > 0.0001
        const hasDateChanged = existingDate !== collectionDate
        const hasRemarksChanged = existingRemarks !== remarks

        if (!hasAmountChanged && !hasDateChanged && !hasRemarksChanged) {
          return
        }

        // Backend update endpoint currently does not mutate loan_amount; recreate pending linked loan instead.
        await api.deleteLoan(token, existing.uuid)
      }

      await api.createLoan(token, {
        farmerUuid,
        loanDate: collectionDate,
        loanAmount,
        remarks,
      })
    },
    [findAutoLoanRecordForCollection, token],
  )

  const removeAutoLoanRecordForCollection = useCallback(
    async (item: Pick<CollectionListItem, 'uuid' | 'farmerUuid' | 'collectionDate'>) => {
      if (!token) return

      const existing = await findAutoLoanRecordForCollection(item)
      if (!existing) return
      if (existing.status !== 'PENDING') return

      await api.deleteLoan(token, existing.uuid)
    },
    [findAutoLoanRecordForCollection, token],
  )

  const onCreateCollection = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!token) return

      const previousCollection = editingCollectionUuid
        ? collections.find((entry) => entry.uuid === editingCollectionUuid) || null
        : null

      const created = await runAction(async () => {
        if (!Array.isArray(farmers) || farmers.length === 0) {
          throw new Error('No farmers available. Load master data before saving collection.')
        }

        if (!Array.isArray(shifts) || shifts.length === 0) {
          throw new Error('No shifts are configured. Please configure shifts in master data first.')
        }

        if (!Array.isArray(milkTypes) || milkTypes.length === 0) {
          throw new Error('No milk types are configured. Please configure milk types in master data first.')
        }

        const selectedFarmer = farmers.find((item) => item.uuid === collectionForm.farmerUuid)
        if (!selectedFarmer) {
          throw new Error('Select a valid farmer from the list before saving the collection.')
        }

        const selectedShift = shifts.find((item) => item.uuid === collectionForm.shiftUuid)
        if (!selectedShift) {
          throw new Error('Select a valid shift from the list before saving the collection.')
        }

        const selectedMilkType = milkTypes.find((item) => item.uuid === collectionForm.milkTypeUuid)
        if (!selectedMilkType) {
          throw new Error('Select a valid milk type before saving the collection.')
        }

        const quantity = Number(collectionForm.quantity)
        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new Error('Quantity must be greater than 0 liters.')
        }

        if (!collectionForm.collectionDate.trim()) {
          throw new Error('Collection date is required.')
        }

        if (collectionForm.fat < 0 || (collectionForm.snf ?? 0) < 0 || collectionForm.mava < 0) {
          throw new Error('FAT, SNF, and Mava cannot be negative values.')
        }

        const qualityVisibility = resolveQualityFieldVisibility(selectedCollectionMethod)
        const systemCollectionTime = toInputTime(new Date())
        const { collectionNo: _collectionNo, ...collectionPayload } = collectionForm

        const payload = {
          ...collectionPayload,
          farmerUuid: selectedFarmer.uuid,
          shiftUuid: selectedShift.uuid,
          milkTypeUuid: selectedMilkType.uuid,
          collectionTime: collectionForm.collectionTime || systemCollectionTime,
          quantity,
          fat: qualityVisibility.showFat ? collectionForm.fat || null : null,
          snf: qualityVisibility.showSnf ? collectionForm.snf || null : null,
          mava: qualityVisibility.showMava ? collectionForm.mava || null : null,
          loan: Number(collectionForm.loan || 0),
          advance: Number(collectionForm.advance || 0),
          entryMode: toApiCollectionEntryMode(
            editingCollectionUuid && editingCollectionEntryMode !== 'unknown'
              ? editingCollectionEntryMode
              : 'single',
          ),
          remarks: collectionForm.remarks.trim(),
        }

        return editingCollectionUuid
          ? api.updateMilkCollection(token, editingCollectionUuid, payload)
          : api.createMilkCollection(token, payload)
      }, editingCollectionUuid ? 'Milk collection updated successfully.' : 'Milk collection saved successfully.')

      if (!created) return

      const normalizedCreated = normalizeCollectionListItem(created)

      setCollections((prev) => {
        if (!editingCollectionUuid) {
          return [normalizedCreated, ...prev]
        }

        return prev.map((item) => (item.uuid === editingCollectionUuid ? normalizedCreated : item))
      })

      setEditingCollectionUuid('')
      setEditingCollectionEntryMode('single')
      setCollectionForm((prev) => ({ ...prev, collectionNo: normalizedCreated.collectionNo }))

      try {
        if (
          previousCollection
          && (
            previousCollection.farmerUuid !== normalizedCreated.farmerUuid
            || normalizeCollectionDateForLoan(previousCollection.collectionDate)
              !== normalizeCollectionDateForLoan(normalizedCreated.collectionDate)
          )
        ) {
          await removeAutoLoanRecordForCollection(previousCollection)
        }

        await upsertAutoLoanRecordForCollection(normalizedCreated)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Loan sync failed for this milk collection update.')
      }
    },
    [
      collectionForm,
      collections,
      editingCollectionEntryMode,
      editingCollectionUuid,
      farmers,
      milkTypes,
      normalizeCollectionListItem,
      removeAutoLoanRecordForCollection,
      runAction,
      selectedCollectionMethod,
      setCollectionForm,
      setCollections,
      setError,
      upsertAutoLoanRecordForCollection,
      shifts,
      token,
    ],
  )

  const onCreateMultipleCollections = useCallback(
    async (entries: MultiCollectionEntryInput[], shiftUuid: string) => {
      if (!token) return

      let backendErrorMessage = ''

      const createdItems = await runAction(async () => {
        try {
          if (!Array.isArray(entries) || entries.length === 0) {
            throw new Error('Select at least one farmer row for multi-farmer collection.')
          }

          if (!Array.isArray(farmers) || farmers.length === 0) {
            throw new Error('No farmers available. Load master data before saving collection.')
          }

          if (!Array.isArray(shifts) || shifts.length === 0) {
            throw new Error('No shifts are configured. Please configure shifts in master data first.')
          }

          if (!Array.isArray(milkTypes) || milkTypes.length === 0) {
            throw new Error('No milk types are configured. Please configure milk types in master data first.')
          }

          const selectedShift = shifts.find((item) => item.uuid === shiftUuid)
          if (!selectedShift) {
            throw new Error('Select a valid shift from the list before saving the collection.')
          }

          const selectedMilkType = milkTypes.find((item) => item.uuid === collectionForm.milkTypeUuid)
          if (!selectedMilkType) {
            throw new Error('Select a valid milk type before saving the collection.')
          }

          if (!collectionForm.collectionDate.trim()) {
            throw new Error('Collection date is required.')
          }

          const qualityVisibility = resolveQualityFieldVisibility(selectedCollectionMethod)
          const systemCollectionTime = toInputTime(new Date())
          const payloads = entries.map((entry) => {
            const selectedFarmer = farmers.find((item) => item.uuid === entry.farmerUuid)
            if (!selectedFarmer) {
              throw new Error('One or more selected rows contain an invalid farmer.')
            }

            const quantity = Number(entry.quantity)
            if (!Number.isFinite(quantity) || quantity <= 0) {
              throw new Error(`Quantity must be greater than 0 liters for farmer ${selectedFarmer.farmerName}.`)
            }

            if (entry.fat < 0 || (entry.snf ?? 0) < 0 || entry.mava < 0) {
              throw new Error(`FAT, SNF, and Mava cannot be negative for farmer ${selectedFarmer.farmerName}.`)
            }

            return {
              farmerUuid: selectedFarmer.uuid,
              shiftUuid: selectedShift.uuid,
              milkTypeUuid: selectedMilkType.uuid,
              collectionDate: collectionForm.collectionDate,
              collectionTime: systemCollectionTime,
              quantity,
              fat: qualityVisibility.showFat ? entry.fat || null : null,
              snf: qualityVisibility.showSnf ? entry.snf || null : null,
              mava: qualityVisibility.showMava ? entry.mava || null : null,
              loan: Number(entry.loan || 0),
              advance: Number(entry.advance || 0),
              entryMode: 'MULTI' as ApiCollectionEntryMode,
              remarks: entry.remarks.trim(),
            }
          })

          const savedRows = await api.createMilkCollectionsBulk(token, payloads)
          return savedRows.map(normalizeCollectionListItem)
        } catch (err) {
          backendErrorMessage = err instanceof Error ? err.message : 'Unable to save multi farmer collection.'
          throw err
        }
      }, `Saved ${entries.length} milk collection entries.`)

      if (!createdItems || createdItems.length === 0) {
        throw new Error(backendErrorMessage || 'Unable to save multi farmer collection.')
      }

      setCollections((prev) => [...createdItems, ...prev])
      setCollectionForm((prev) => ({
        ...prev,
        collectionNo: createdItems[createdItems.length - 1]?.collectionNo || prev.collectionNo,
      }))

      try {
        await Promise.all(createdItems.map((item) => upsertAutoLoanRecordForCollection(item)))
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Some loan records could not be synced from multi entry.')
      }
    },
    [
      collectionForm.collectionDate,
      collectionForm.milkTypeUuid,
      farmers,
      milkTypes,
      runAction,
      selectedCollectionMethod,
      setCollectionForm,
      setCollections,
      setError,
      shifts,
      token,
      upsertAutoLoanRecordForCollection,
    ],
  )

  const onEditCollection = useCallback(
    (item: CollectionListItem) => {
      if (!item.farmerUuid || !item.shiftUuid || !item.milkTypeUuid) {
        setError('Edit requires farmer, shift, and milk type fields from collection list API response.')
        return
      }

      setEditingCollectionUuid(item.uuid)
      const resolvedMode = fromApiCollectionEntryMode(item.entryMode)
      setEditingCollectionEntryMode(
        resolvedMode !== 'unknown' ? resolvedMode : extractCollectionEntryModeFromRemarks(item.remarks),
      )
      setError('')
      setCollectionForm((prev) => ({
        ...prev,
        collectionNo: item.collectionNo || prev.collectionNo,
        farmerUuid: item.farmerUuid || prev.farmerUuid,
        shiftUuid: item.shiftUuid || prev.shiftUuid,
        milkTypeUuid: item.milkTypeUuid || prev.milkTypeUuid,
        collectionDate: item.collectionDate || prev.collectionDate,
        collectionTime: item.collectionTime || prev.collectionTime,
        quantity: Number(item.quantity || 0),
        fat: Number(item.fat || 0),
        snf: item.snf == null ? null : Number(item.snf),
        mava: Number(item.mava || 0),
        loan: Number(item.loan || 0),
        advance: Number(item.advance || 0),
        remarks: stripCollectionEntryModeTag(item.remarks),
      }))
    },
    [setCollectionForm, setError],
  )

  const onCancelCollectionEdit = useCallback(() => {
    setEditingCollectionUuid('')
    setEditingCollectionEntryMode('single')
    setError('')
    setCollectionForm((prev) => ({
      ...prev,
      collectionNo: '',
      farmerUuid: '',
      shiftUuid: '',
      milkTypeUuid: '',
      collectionDate: toInputDate(new Date()),
      collectionTime: toInputTime(new Date()),
      quantity: 0,
      rate: 0,
      fat: 0,
      snf: null,
      mava: 0,
      loan: 0,
      advance: 0,
      remarks: '',
    }))
  }, [setCollectionForm, setError])

  const onDeleteCollection = useCallback(
    async (item: CollectionListItem) => {
      if (!token) return
      const deleted = await runAction(
        () => api.deleteMilkCollection(token, item.uuid),
        'Milk collection deleted successfully.',
      )
      if (deleted === null) return

      setCollections((prev) => prev.filter((row) => row.uuid !== item.uuid))
      if (editingCollectionUuid === item.uuid) {
        setEditingCollectionUuid('')
        setEditingCollectionEntryMode('single')
      }

      try {
        await removeAutoLoanRecordForCollection(item)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Milk collection deleted, but linked loan cleanup failed.')
      }
    },
    [editingCollectionUuid, removeAutoLoanRecordForCollection, runAction, setCollections, setError, token],
  )

  return {
    editingCollectionUuid,
    onCreateCollection,
    onCreateMultipleCollections,
    onEditCollection,
    onCancelCollectionEdit,
    onDeleteCollection,
  }
}
