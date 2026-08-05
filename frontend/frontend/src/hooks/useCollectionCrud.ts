import type { FormEvent } from 'react'
import { useCallback, useState } from 'react'
import { api } from '../lib/api'
import { toInputTime } from '../lib/appCoreUtils'
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
  MasterLookupResponse,
  MilkTypeResponse,
  ShiftResponse,
} from '../types/api'

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
  remarks: string
}

type UseCollectionCrudParams = {
  token: string
  collectionForm: CollectionFormState
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

  const onCreateCollection = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!token) return

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
    },
    [
      collectionForm,
      editingCollectionEntryMode,
      editingCollectionUuid,
      farmers,
      milkTypes,
      normalizeCollectionListItem,
      runAction,
      selectedCollectionMethod,
      setCollectionForm,
      setCollections,
      shifts,
      token,
    ],
  )

  const onCreateMultipleCollections = useCallback(
    async (entries: MultiCollectionEntryInput[], shiftUuid: string) => {
      if (!token) return

      const createdItems = await runAction(async () => {
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
        const created: CollectionListItem[] = []

        for (const entry of entries) {
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

          const saved = await api.createMilkCollection(token, {
            farmerUuid: selectedFarmer.uuid,
            shiftUuid: selectedShift.uuid,
            milkTypeUuid: selectedMilkType.uuid,
            collectionDate: collectionForm.collectionDate,
            collectionTime: systemCollectionTime,
            quantity,
            fat: qualityVisibility.showFat ? entry.fat || null : null,
            snf: qualityVisibility.showSnf ? entry.snf || null : null,
            mava: qualityVisibility.showMava ? entry.mava || null : null,
            entryMode: 'MULTI',
            remarks: entry.remarks.trim(),
          })

          created.push(normalizeCollectionListItem(saved))
        }

        return created
      }, `Saved ${entries.length} milk collection entries.`)

      if (!createdItems || createdItems.length === 0) return

      setCollections((prev) => [...createdItems, ...prev])
      setCollectionForm((prev) => ({
        ...prev,
        collectionNo: createdItems[createdItems.length - 1]?.collectionNo || prev.collectionNo,
      }))
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
      shifts,
      token,
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
        remarks: stripCollectionEntryModeTag(item.remarks),
      }))
    },
    [setCollectionForm, setError],
  )

  const onCancelCollectionEdit = useCallback(() => {
    setEditingCollectionUuid('')
    setEditingCollectionEntryMode('single')
    setError('')
  }, [setError])

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
    },
    [editingCollectionUuid, runAction, setCollections, token],
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
