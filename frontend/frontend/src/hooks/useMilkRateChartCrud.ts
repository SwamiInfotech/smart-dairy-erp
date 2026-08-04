import type { FormEvent } from 'react'
import { useCallback, useRef } from 'react'
import { api } from '../lib/api'
import { isUuid, toInputDate } from '../lib/appCoreUtils'
import { createEmptyMilkRateDetail, resolveQualityFieldVisibility } from '../lib/uiHelpers'
import type {
  CollectionMethodResponse,
  CreateMilkRateChartRequest,
  MilkRateChartResponse,
  RateCategoryResponse,
} from '../types/api'

type UseMilkRateChartCrudParams = {
  token: string
  branchUuid: string
  initialBranchUuid: string
  branchName: string
  currentShopName: string
  milkRateForm: CreateMilkRateChartRequest
  editingMilkRateChartUuid: string
  rateCategories: RateCategoryResponse[]
  collectionMethods: CollectionMethodResponse[]
  runAction: <T>(action: () => Promise<T>, successMessage?: string) => Promise<T | null>
  setError: React.Dispatch<React.SetStateAction<string>>
  setMilkRateCharts: React.Dispatch<React.SetStateAction<MilkRateChartResponse[]>>
  setFarmerRateCharts: React.Dispatch<React.SetStateAction<MilkRateChartResponse[]>>
  setEditingMilkRateChartUuid: React.Dispatch<React.SetStateAction<string>>
  setMilkRateForm: React.Dispatch<React.SetStateAction<CreateMilkRateChartRequest>>
}

export function useMilkRateChartCrud({
  token,
  branchUuid,
  initialBranchUuid,
  branchName,
  currentShopName,
  milkRateForm,
  editingMilkRateChartUuid,
  rateCategories,
  collectionMethods,
  runAction,
  setError,
  setMilkRateCharts,
  setFarmerRateCharts,
  setEditingMilkRateChartUuid,
  setMilkRateForm,
}: UseMilkRateChartCrudParams) {
  const milkRateMavaFromRefs = useRef<Array<HTMLInputElement | null>>([])

  const resetMilkRateChartForm = useCallback(() => {
    setEditingMilkRateChartUuid('')
    setMilkRateForm({
      branchUuid: branchUuid || initialBranchUuid,
      rateCategoryUuid: '',
      collectionMethodUuid: '',
      chartName: '',
      effectiveFrom: toInputDate(new Date()),
      effectiveTo: '',
      remarks: '',
      details: [createEmptyMilkRateDetail()],
    })
  }, [branchUuid, initialBranchUuid, setEditingMilkRateChartUuid, setMilkRateForm])

  const onCreateMilkRateChart = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!token) return

      const saved = await runAction(async () => {
        const selectedBranchContext = branchName || currentShopName || milkRateForm.branchUuid.trim()
        if (!selectedBranchContext) {
          throw new Error('Branch context is required for milk rate chart.')
        }

        if (!milkRateForm.branchUuid.trim()) {
          throw new Error('Branch UUID is required for milk rate chart.')
        }

        if (!isUuid(milkRateForm.branchUuid)) {
          throw new Error('Branch UUID format is invalid.')
        }

        if (!milkRateForm.rateCategoryUuid.trim()) {
          throw new Error('Rate category is required.')
        }

        const selectedRateCategory = rateCategories.find((item) => item.uuid === milkRateForm.rateCategoryUuid)
        if (!selectedRateCategory) {
          throw new Error('Select a valid rate category from the list.')
        }

        if (!isUuid(milkRateForm.rateCategoryUuid)) {
          throw new Error('Rate category selection is invalid.')
        }

        if (!milkRateForm.collectionMethodUuid.trim()) {
          throw new Error('Collection method is required.')
        }

        const selectedCollectionMethod = collectionMethods.find(
          (item) => item.uuid === milkRateForm.collectionMethodUuid,
        )
        if (!selectedCollectionMethod) {
          throw new Error('Select a valid collection method from the list.')
        }

        const qualityVisibility = resolveQualityFieldVisibility(selectedCollectionMethod)

        if (!isUuid(milkRateForm.collectionMethodUuid)) {
          throw new Error('Collection method selection is invalid.')
        }

        if (!milkRateForm.chartName.trim()) {
          throw new Error('Chart name is required.')
        }

        if (!milkRateForm.effectiveFrom.trim()) {
          throw new Error('Effective from date is required.')
        }

        if (!milkRateForm.effectiveTo.trim()) {
          throw new Error('Effective to date is required.')
        }

        if (milkRateForm.effectiveTo.trim() && milkRateForm.effectiveTo < milkRateForm.effectiveFrom) {
          throw new Error('Effective to date cannot be before effective from date.')
        }

        if (!Array.isArray(milkRateForm.details) || milkRateForm.details.length === 0) {
          throw new Error('At least one rate detail is required.')
        }

        const sanitizedDetails = milkRateForm.details.map((detail, index) => {
          const rowNumber = index + 1
          const rate = Number(detail.rate)
          if (!Number.isFinite(rate) || rate <= 0) {
            throw new Error(`Rate in row ${rowNumber} must be greater than 0.`)
          }

          if (qualityVisibility.showFat && (detail.fatFrom === null || detail.fatTo === null)) {
            throw new Error(`FAT From and FAT To are required in row ${rowNumber}.`)
          }

          if (qualityVisibility.showSnf && (detail.snfFrom === null || detail.snfTo === null)) {
            throw new Error(`SNF From and SNF To are required in row ${rowNumber}.`)
          }

          if (qualityVisibility.showMava && (detail.mavaFrom === null || detail.mavaTo === null)) {
            throw new Error(`Mava From and Mava To are required in row ${rowNumber}.`)
          }

          const detailFields = [
            ['FAT From', qualityVisibility.showFat ? detail.fatFrom : null],
            ['FAT To', qualityVisibility.showFat ? detail.fatTo : null],
            ['SNF From', qualityVisibility.showSnf ? detail.snfFrom : null],
            ['SNF To', qualityVisibility.showSnf ? detail.snfTo : null],
            ['Mava From', qualityVisibility.showMava ? detail.mavaFrom : null],
            ['Mava To', qualityVisibility.showMava ? detail.mavaTo : null],
          ] as const

          for (const [label, value] of detailFields) {
            if (value !== null && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
              throw new Error(`${label} in row ${rowNumber} must be a non-negative number when provided.`)
            }
          }

          return {
            fatFrom: qualityVisibility.showFat ? detail.fatFrom : null,
            fatTo: qualityVisibility.showFat ? detail.fatTo : null,
            snfFrom: qualityVisibility.showSnf ? detail.snfFrom : null,
            snfTo: qualityVisibility.showSnf ? detail.snfTo : null,
            mavaFrom: qualityVisibility.showMava ? detail.mavaFrom : null,
            mavaTo: qualityVisibility.showMava ? detail.mavaTo : null,
            rate,
          }
        })

        for (let index = 0; index < sanitizedDetails.length; index += 1) {
          const rowNumber = index + 1
          const detail = sanitizedDetails[index]

          if (qualityVisibility.showFat && Number(detail.fatFrom) > Number(detail.fatTo)) {
            throw new Error(`FAT From cannot be greater than FAT To in row ${rowNumber}.`)
          }

          if (qualityVisibility.showSnf && Number(detail.snfFrom) > Number(detail.snfTo)) {
            throw new Error(`SNF From cannot be greater than SNF To in row ${rowNumber}.`)
          }

          if (qualityVisibility.showMava && Number(detail.mavaFrom) > Number(detail.mavaTo)) {
            throw new Error(`Mava From cannot be greater than Mava To in row ${rowNumber}.`)
          }
        }

        if (qualityVisibility.showMava) {
          for (let sourceIndex = 0; sourceIndex < sanitizedDetails.length; sourceIndex += 1) {
            const sourceMavaFrom = Number(sanitizedDetails[sourceIndex].mavaFrom)

            for (let targetIndex = 0; targetIndex < sanitizedDetails.length; targetIndex += 1) {
              if (sourceIndex === targetIndex) continue

              const targetMavaFrom = Number(sanitizedDetails[targetIndex].mavaFrom)
              const targetMavaTo = Number(sanitizedDetails[targetIndex].mavaTo)

              if (sourceMavaFrom >= targetMavaFrom && sourceMavaFrom <= targetMavaTo) {
                milkRateMavaFromRefs.current[sourceIndex]?.focus()
                throw new Error(
                  `Mava From value in row ${sourceIndex + 1} already exists in row ${targetIndex + 1} range.`,
                )
              }
            }
          }
        }

        const rangesOverlap = (fromA: number, toA: number, fromB: number, toB: number) => {
          return Math.max(fromA, fromB) <= Math.min(toA, toB)
        }

        const rowsOverlap = (
          left: (typeof sanitizedDetails)[number],
          right: (typeof sanitizedDetails)[number],
        ) => {
          if (
            qualityVisibility.showFat &&
            !rangesOverlap(Number(left.fatFrom), Number(left.fatTo), Number(right.fatFrom), Number(right.fatTo))
          ) {
            return false
          }

          if (
            qualityVisibility.showSnf &&
            !rangesOverlap(Number(left.snfFrom), Number(left.snfTo), Number(right.snfFrom), Number(right.snfTo))
          ) {
            return false
          }

          if (
            qualityVisibility.showMava &&
            !rangesOverlap(Number(left.mavaFrom), Number(left.mavaTo), Number(right.mavaFrom), Number(right.mavaTo))
          ) {
            return false
          }

          return true
        }

        for (let leftIndex = 0; leftIndex < sanitizedDetails.length; leftIndex += 1) {
          for (let rightIndex = leftIndex + 1; rightIndex < sanitizedDetails.length; rightIndex += 1) {
            if (rowsOverlap(sanitizedDetails[leftIndex], sanitizedDetails[rightIndex])) {
              throw new Error(
                `Quality slab row ${leftIndex + 1} overlaps with row ${rightIndex + 1}. Use unique, non-overlapping ranges.`,
              )
            }
          }
        }

        const payload: CreateMilkRateChartRequest = {
          ...milkRateForm,
          chartName: milkRateForm.chartName.trim(),
          remarks: milkRateForm.remarks.trim(),
          details: sanitizedDetails,
        }

        if (editingMilkRateChartUuid) {
          return api.updateMilkRateChart(token, editingMilkRateChartUuid, payload)
        }

        return api.createMilkRateChart(token, payload)
      }, editingMilkRateChartUuid ? 'Milk rate chart updated successfully.' : 'Milk rate chart saved successfully.')

      if (!saved) return

      if (editingMilkRateChartUuid) {
        setMilkRateCharts((prev) => prev.map((item) => (item.uuid === editingMilkRateChartUuid ? saved : item)))
        setFarmerRateCharts((prev) => prev.map((item) => (item.uuid === editingMilkRateChartUuid ? saved : item)))
      } else {
        setMilkRateCharts((prev) => [saved, ...prev])
        setFarmerRateCharts((prev) => [saved, ...prev])
      }

      resetMilkRateChartForm()
    },
    [
      branchName,
      collectionMethods,
      currentShopName,
      editingMilkRateChartUuid,
      milkRateForm,
      rateCategories,
      resetMilkRateChartForm,
      runAction,
      setFarmerRateCharts,
      setMilkRateCharts,
      token,
    ],
  )

  const onEditMilkRateChart = useCallback(
    (chart: MilkRateChartResponse) => {
      const mappedDetails = Array.isArray(chart.details)
        ? chart.details.map((detail) => ({
            fatFrom: detail.fatFrom ?? null,
            fatTo: detail.fatTo ?? null,
            snfFrom: detail.snfFrom ?? null,
            snfTo: detail.snfTo ?? null,
            mavaFrom: detail.mavaFrom ?? null,
            mavaTo: detail.mavaTo ?? null,
            rate: Number(detail.rate ?? 0),
          }))
        : []

      setEditingMilkRateChartUuid(chart.uuid)
      setMilkRateForm({
        branchUuid: chart.branchUuid || branchUuid || initialBranchUuid,
        rateCategoryUuid: chart.rateCategoryUuid || '',
        collectionMethodUuid: chart.collectionMethodUuid || '',
        chartName: chart.chartName || '',
        effectiveFrom: chart.effectiveFrom || toInputDate(new Date()),
        effectiveTo: chart.effectiveTo || '',
        remarks: chart.remarks || '',
        details: mappedDetails.length > 0 ? mappedDetails : [createEmptyMilkRateDetail()],
      })
    },
    [branchUuid, initialBranchUuid, setEditingMilkRateChartUuid, setMilkRateForm],
  )

  const onCancelMilkRateChartEdit = useCallback(() => {
    resetMilkRateChartForm()
    setError('')
  }, [resetMilkRateChartForm, setError])

  const onDeleteMilkRateChart = useCallback(
    async (chart: MilkRateChartResponse) => {
      if (!token) return
      const confirmed = window.confirm(`Delete milk rate chart "${chart.chartName}"?`)
      if (!confirmed) return

      const result = await runAction(
        () => api.deleteMilkRateChart(token, chart.uuid),
        'Milk rate chart deleted successfully.',
      )
      if (result === null) return

      setMilkRateCharts((prev) => prev.filter((item) => item.uuid !== chart.uuid))
      setFarmerRateCharts((prev) => prev.filter((item) => item.uuid !== chart.uuid))

      if (editingMilkRateChartUuid === chart.uuid) {
        resetMilkRateChartForm()
      }
    },
    [editingMilkRateChartUuid, resetMilkRateChartForm, runAction, setFarmerRateCharts, setMilkRateCharts, token],
  )

  const setMavaFromRef = useCallback((index: number, element: HTMLInputElement | null) => {
    milkRateMavaFromRefs.current[index] = element
  }, [])

  return {
    onCreateMilkRateChart,
    onEditMilkRateChart,
    onCancelMilkRateChartEdit,
    onDeleteMilkRateChart,
    setMavaFromRef,
  }
}
