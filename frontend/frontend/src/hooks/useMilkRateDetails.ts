import { useCallback, useEffect, useMemo } from 'react'
import { createEmptyMilkRateDetail, type QualityVisibility } from '../lib/uiHelpers'
import type { CreateMilkRateChartRequest } from '../types/api'

type MilkRateDetailInput = CreateMilkRateChartRequest['details'][number]

type UseMilkRateDetailsParams = {
  milkRateForm: CreateMilkRateChartRequest
  milkRateQualityVisibility: QualityVisibility
  setMilkRateForm: React.Dispatch<React.SetStateAction<CreateMilkRateChartRequest>>
}

export function useMilkRateDetails({
  milkRateForm,
  milkRateQualityVisibility,
  setMilkRateForm,
}: UseMilkRateDetailsParams) {
  const milkRateRowConflictState = useMemo(() => {
    const conflictingRows = new Set<number>()
    const messages = new Set<string>()

    const rows = Array.isArray(milkRateForm.details) ? milkRateForm.details : []
    if (rows.length === 0) {
      return {
        conflictingRows: [] as number[],
        messages: [] as string[],
      }
    }

    const activeMetricKeys = [
      milkRateQualityVisibility.showFat ? (['fatFrom', 'fatTo'] as const) : null,
      milkRateQualityVisibility.showSnf ? (['snfFrom', 'snfTo'] as const) : null,
      milkRateQualityVisibility.showMava ? (['mavaFrom', 'mavaTo'] as const) : null,
    ].filter(Boolean) as Array<readonly ['fatFrom' | 'snfFrom' | 'mavaFrom', 'fatTo' | 'snfTo' | 'mavaTo']>

    const rangesOverlap = (fromA: number, toA: number, fromB: number, toB: number) => {
      return Math.max(fromA, fromB) <= Math.min(toA, toB)
    }

    const rowHasCompleteRanges = (row: MilkRateDetailInput) => {
      for (const [fromKey, toKey] of activeMetricKeys) {
        if (row[fromKey] === null || row[toKey] === null) {
          return false
        }
      }
      return true
    }

    rows.forEach((row, rowIndex) => {
      const rowNumber = rowIndex + 1

      if (milkRateQualityVisibility.showFat && row.fatFrom !== null && row.fatTo !== null && row.fatFrom > row.fatTo) {
        conflictingRows.add(rowIndex)
        messages.add(`Row ${rowNumber}: FAT From cannot be greater than FAT To.`)
      }

      if (milkRateQualityVisibility.showSnf && row.snfFrom !== null && row.snfTo !== null && row.snfFrom > row.snfTo) {
        conflictingRows.add(rowIndex)
        messages.add(`Row ${rowNumber}: SNF From cannot be greater than SNF To.`)
      }

      if (
        milkRateQualityVisibility.showMava &&
        row.mavaFrom !== null &&
        row.mavaTo !== null &&
        row.mavaFrom > row.mavaTo
      ) {
        conflictingRows.add(rowIndex)
        messages.add(`Row ${rowNumber}: Mava From cannot be greater than Mava To.`)
      }
    })

    if (milkRateQualityVisibility.showMava) {
      rows.forEach((sourceRow, sourceIndex) => {
        if (sourceRow.mavaFrom === null || !Number.isFinite(Number(sourceRow.mavaFrom))) {
          return
        }

        const sourceMavaFrom = Number(sourceRow.mavaFrom)

        rows.forEach((targetRow, targetIndex) => {
          if (sourceIndex === targetIndex) return
          if (targetRow.mavaFrom === null || targetRow.mavaTo === null) return

          const targetMavaFrom = Number(targetRow.mavaFrom)
          const targetMavaTo = Number(targetRow.mavaTo)

          if (sourceMavaFrom >= targetMavaFrom && sourceMavaFrom <= targetMavaTo) {
            conflictingRows.add(sourceIndex)
            conflictingRows.add(targetIndex)
            messages.add(
              `Row ${sourceIndex + 1}: Mava From value already exists in row ${targetIndex + 1} range.`,
            )
          }
        })
      })
    }

    for (let leftIndex = 0; leftIndex < rows.length; leftIndex += 1) {
      const leftRow = rows[leftIndex]
      if (!rowHasCompleteRanges(leftRow)) continue

      for (let rightIndex = leftIndex + 1; rightIndex < rows.length; rightIndex += 1) {
        const rightRow = rows[rightIndex]
        if (!rowHasCompleteRanges(rightRow)) continue

        const overlapsAcrossVisibleMetrics = activeMetricKeys.every(([fromKey, toKey]) =>
          rangesOverlap(
            Number(leftRow[fromKey]),
            Number(leftRow[toKey]),
            Number(rightRow[fromKey]),
            Number(rightRow[toKey]),
          ),
        )

        if (overlapsAcrossVisibleMetrics) {
          conflictingRows.add(leftIndex)
          conflictingRows.add(rightIndex)
          messages.add(`Rows ${leftIndex + 1} and ${rightIndex + 1} overlap. Use unique, non-overlapping ranges.`)
        }
      }
    }

    return {
      conflictingRows: Array.from(conflictingRows).sort((a, b) => a - b),
      messages: Array.from(messages),
    }
  }, [milkRateForm.details, milkRateQualityVisibility])

  const updateMilkRateDetail = useCallback(
    (index: number, field: keyof MilkRateDetailInput, value: number | null) => {
      setMilkRateForm((prev) => {
        const details = prev.details.length > 0 ? [...prev.details] : [createEmptyMilkRateDetail()]
        const existing = details[index] || createEmptyMilkRateDetail()
        details[index] = {
          ...existing,
          [field]: field === 'rate' ? Number(value ?? 0) : value,
        }

        return {
          ...prev,
          details,
        }
      })
    },
    [setMilkRateForm],
  )

  const addMilkRateDetailRow = useCallback(() => {
    setMilkRateForm((prev) => ({
      ...prev,
      details: [...prev.details, createEmptyMilkRateDetail()],
    }))
  }, [setMilkRateForm])

  const removeMilkRateDetailRow = useCallback(
    (index: number) => {
      setMilkRateForm((prev) => {
        if (prev.details.length <= 1) {
          return {
            ...prev,
            details: [createEmptyMilkRateDetail()],
          }
        }

        return {
          ...prev,
          details: prev.details.filter((_, rowIndex) => rowIndex !== index),
        }
      })
    },
    [setMilkRateForm],
  )

  useEffect(() => {
    setMilkRateForm((prev) => {
      if (!Array.isArray(prev.details) || prev.details.length === 0) {
        return {
          ...prev,
          details: [createEmptyMilkRateDetail()],
        }
      }

      let changed = false
      const nextDetails = prev.details.map((detail) => {
        let nextDetail = detail

        if (!milkRateQualityVisibility.showFat && (detail.fatFrom !== null || detail.fatTo !== null)) {
          nextDetail = {
            ...nextDetail,
            fatFrom: null,
            fatTo: null,
          }
          changed = true
        }

        if (!milkRateQualityVisibility.showSnf && (detail.snfFrom !== null || detail.snfTo !== null)) {
          nextDetail = {
            ...nextDetail,
            snfFrom: null,
            snfTo: null,
          }
          changed = true
        }

        if (!milkRateQualityVisibility.showMava && (detail.mavaFrom !== null || detail.mavaTo !== null)) {
          nextDetail = {
            ...nextDetail,
            mavaFrom: null,
            mavaTo: null,
          }
          changed = true
        }

        return nextDetail
      })

      if (!changed) return prev

      return {
        ...prev,
        details: nextDetails,
      }
    })
  }, [milkRateQualityVisibility, setMilkRateForm])

  return {
    milkRateRowConflictState,
    updateMilkRateDetail,
    addMilkRateDetailRow,
    removeMilkRateDetailRow,
  }
}
