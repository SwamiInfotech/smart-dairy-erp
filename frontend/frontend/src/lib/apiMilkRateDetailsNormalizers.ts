import type { MilkRateChartResponse } from '../types/api'
import {
  MILK_RATE_CHART_DETAILS_KEYS,
  MILK_RATE_DETAIL_FAT_FROM_KEYS,
  MILK_RATE_DETAIL_FAT_TO_KEYS,
  MILK_RATE_DETAIL_MAVA_FROM_KEYS,
  MILK_RATE_DETAIL_MAVA_TO_KEYS,
  MILK_RATE_DETAIL_NESTED_RECORD_KEYS,
  MILK_RATE_DETAIL_SNF_FROM_KEYS,
  MILK_RATE_DETAIL_SNF_TO_KEYS,
} from './apiNormalizerKeys'
import { asRecord, readNumber, readString } from './apiResponseParsers'
import { readFiniteNumber } from './apiNormalizerUtils'

export function normalizeMilkRateChartDetails(
  detailsPayload: unknown,
  chartUuidFallback = '',
): MilkRateChartResponse['details'] {
  if (!Array.isArray(detailsPayload)) {
    return []
  }

  return detailsPayload
    .map((item, index) => {
      const detail = asRecord(item)
      if (!detail) {
        return null
      }

      const rate = readNumber(detail, 'rate')
      if (rate <= 0) {
        return null
      }

      const detailUuid =
        readString(detail, 'uuid', 'id') ||
        (chartUuidFallback ? `${chartUuidFallback}-detail-${index + 1}` : `detail-${index + 1}`)

      const fatFrom = readFiniteNumber(detail, ...MILK_RATE_DETAIL_FAT_FROM_KEYS)
      const fatTo = readFiniteNumber(detail, ...MILK_RATE_DETAIL_FAT_TO_KEYS)
      const snfFrom = readFiniteNumber(detail, ...MILK_RATE_DETAIL_SNF_FROM_KEYS)
      const snfTo = readFiniteNumber(detail, ...MILK_RATE_DETAIL_SNF_TO_KEYS)
      const mavaFrom = readFiniteNumber(detail, ...MILK_RATE_DETAIL_MAVA_FROM_KEYS)
      const mavaTo = readFiniteNumber(detail, ...MILK_RATE_DETAIL_MAVA_TO_KEYS)

      return {
        uuid: detailUuid,
        fatFrom,
        fatTo,
        snfFrom,
        snfTo,
        mavaFrom,
        mavaTo,
        rate,
      }
    })
    .filter((item): item is MilkRateChartResponse['details'][number] => Boolean(item))
}

export function resolveMilkRateChartDetailsPayload(record: Record<string, unknown> | null): unknown {
  if (!record) {
    return []
  }

  const direct = MILK_RATE_CHART_DETAILS_KEYS.map((key) => record[key])

  const firstDirectArray = direct.find((value) => Array.isArray(value))
  if (Array.isArray(firstDirectArray)) {
    return firstDirectArray
  }

  const nestedCandidates = MILK_RATE_DETAIL_NESTED_RECORD_KEYS.map((key) => asRecord(record[key]))

  for (const nested of nestedCandidates) {
    if (!nested) continue
    const nestedDirect = MILK_RATE_CHART_DETAILS_KEYS.map((key) => nested[key])
    const firstNestedArray = nestedDirect.find((value) => Array.isArray(value))
    if (Array.isArray(firstNestedArray)) {
      return firstNestedArray
    }
  }

  return []
}
