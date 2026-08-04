import type { CreateMilkRateChartRequest, MilkRateChartResponse } from '../types/api'
import { MILK_RATE_CHART_LIST_KEYS } from './apiNormalizerKeys'
import { ApiError, asRecord, readString } from './apiResponseParsers'
import {
  assertRequiredStrings,
  normalizeBooleanFlag,
  requireRecord,
  resolveArraySource,
} from './apiNormalizerUtils'
import {
  normalizeMilkRateChartDetails,
  resolveMilkRateChartDetailsPayload,
} from './apiMilkRateDetailsNormalizers'

export function normalizeMilkRateChartResponse(payload: unknown): MilkRateChartResponse {
  const record = requireRecord(payload, 'Milk rate chart response format is invalid.')
  const uuid = readString(record, 'uuid', 'id')
  const branchUuid = readString(record, 'branchUuid')
  const rateCategoryUuid = readString(record, 'rateCategoryUuid')
  const collectionMethodUuid = readString(record, 'collectionMethodUuid')
  const chartName = readString(record, 'chartName', 'name')
  const effectiveFrom = readString(record, 'effectiveFrom')
  const effectiveTo = readString(record, 'effectiveTo') || null

  assertRequiredStrings(
    [uuid, branchUuid, rateCategoryUuid, collectionMethodUuid, chartName, effectiveFrom],
    'Milk rate chart response format is invalid.',
  )

  const details = normalizeMilkRateChartDetails(resolveMilkRateChartDetailsPayload(record), uuid)

  return {
    uuid,
    branchUuid,
    rateCategoryUuid,
    collectionMethodUuid,
    chartName,
    effectiveFrom,
    effectiveTo,
    remarks: readString(record, 'remarks') || null,
    active: normalizeBooleanFlag(record, ['active']),
    details,
  }
}

export function normalizeMilkRateChartListResponse(payload: unknown): MilkRateChartResponse[] {
  const source = resolveArraySource(payload, MILK_RATE_CHART_LIST_KEYS)

  if (!source) {
    throw new ApiError('Milk rate charts list response format is invalid.', 500)
  }

  const normalized: MilkRateChartResponse[] = []

  for (const item of source) {
    const record = asRecord(item)
    const rateCategoryRecord = asRecord(record?.rateCategory)
    const collectionMethodRecord = asRecord(record?.collectionMethod)
    const branchRecord = asRecord(record?.branch)

    const uuid = readString(record, 'uuid', 'id', 'rateChartUuid')
    const branchUuid =
      readString(record, 'branchUuid') || readString(branchRecord, 'uuid', 'id', 'branchUuid')
    const rateCategoryUuid =
      readString(record, 'rateCategoryUuid') ||
      readString(rateCategoryRecord, 'uuid', 'id', 'rateCategoryUuid')
    const collectionMethodUuid =
      readString(record, 'collectionMethodUuid', 'methodUuid') ||
      readString(collectionMethodRecord, 'uuid', 'id', 'collectionMethodUuid')
    const chartName = readString(record, 'chartName', 'name', 'title')
    const effectiveFrom = readString(record, 'effectiveFrom', 'fromDate', 'startDate')
    const effectiveTo = readString(record, 'effectiveTo', 'toDate', 'endDate') || null

    if (!uuid || !rateCategoryUuid || !collectionMethodUuid || !chartName || !effectiveFrom) {
      continue
    }

    normalized.push({
      uuid,
      branchUuid: branchUuid || '',
      rateCategoryUuid,
      collectionMethodUuid,
      chartName,
      effectiveFrom,
      effectiveTo,
      remarks: readString(record, 'remarks', 'note') || null,
      active: normalizeBooleanFlag(record, ['active']),
      details: normalizeMilkRateChartDetails(resolveMilkRateChartDetailsPayload(record), uuid),
    })
  }

  return normalized
}

export function validateMilkRateChartPayload(payload: CreateMilkRateChartRequest) {
  if (!payload.branchUuid.trim()) {
    throw new ApiError('Branch is required for milk rate chart.', 400)
  }

  if (!payload.collectionMethodUuid.trim()) {
    throw new ApiError('Collection method is required for milk rate chart.', 400)
  }

  if (!payload.chartName.trim()) {
    throw new ApiError('Chart name is required for milk rate chart.', 400)
  }

  if (!payload.effectiveFrom.trim()) {
    throw new ApiError('Effective from date is required for milk rate chart.', 400)
  }

  if (payload.effectiveTo.trim() && payload.effectiveTo < payload.effectiveFrom) {
    throw new ApiError('Effective to date cannot be before effective from date.', 400)
  }

  if (!Array.isArray(payload.details) || payload.details.length === 0) {
    throw new ApiError('At least one rate detail is required for milk rate chart.', 400)
  }

  for (const detail of payload.details) {
    if (!Number.isFinite(detail.rate) || detail.rate <= 0) {
      throw new ApiError('Rate detail must have rate greater than 0.', 400)
    }

    const numericFields = [
      ['FAT from', detail.fatFrom],
      ['FAT to', detail.fatTo],
      ['SNF from', detail.snfFrom],
      ['SNF to', detail.snfTo],
      ['Mava from', detail.mavaFrom],
      ['Mava to', detail.mavaTo],
    ] as const

    for (const [fieldName, value] of numericFields) {
      if (value !== null && (!Number.isFinite(value) || value < 0)) {
        throw new ApiError(`${fieldName} in rate detail must be a non-negative number.`, 400)
      }
    }
  }
}
