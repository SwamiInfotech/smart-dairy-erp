import type {
  CollectionMethodResponse,
  PaymentCycleResponse,
  RateCategoryResponse,
  ShiftResponse,
} from '../types/api'
import {
  COLLECTION_METHOD_LIST_KEYS,
  PAYMENT_CYCLE_LIST_KEYS,
  RATE_CATEGORY_LIST_KEYS,
  SHIFT_LIST_KEYS,
} from './apiNormalizerKeys'
import { ApiError } from './apiResponseParsers'
import { normalizeListItems, resolveArraySource } from './apiNormalizerUtils'
import {
  normalizeCollectionMethodResponse,
  normalizePaymentCycleResponse,
  normalizeRateCategoryResponse,
  normalizeShiftItem,
} from './apiMasterEntityItemNormalizers'

export function normalizeShiftsResponse(payload: unknown): ShiftResponse[] {
  const source = resolveArraySource(payload, SHIFT_LIST_KEYS)
  if (!source) {
    throw new ApiError('Shift response format is invalid.', 500)
  }

  const normalized = source
    .map((item) => normalizeShiftItem(item))
    .filter((item): item is ShiftResponse => Boolean(item))

  if (normalized.length === 0) {
    throw new ApiError('No shifts are configured in master data.', 404)
  }

  return normalized
}

export function normalizeCollectionMethodListResponse(payload: unknown): CollectionMethodResponse[] {
  const source = resolveArraySource(payload, COLLECTION_METHOD_LIST_KEYS)
  if (!source) {
    throw new ApiError('Collection methods response format is invalid.', 500)
  }

  const normalized = normalizeListItems(source, normalizeCollectionMethodResponse)

  if (normalized.length === 0) {
    throw new ApiError('No collection methods are configured in master data.', 404)
  }

  return normalized
}

export function normalizePaymentCycleListResponse(payload: unknown): PaymentCycleResponse[] {
  const source = resolveArraySource(payload, PAYMENT_CYCLE_LIST_KEYS)
  if (!source) {
    throw new ApiError('Payment cycles response format is invalid.', 500)
  }

  const normalized = normalizeListItems(source, normalizePaymentCycleResponse)

  if (normalized.length === 0) {
    throw new ApiError('No payment cycles are configured in master data.', 404)
  }

  return normalized
}

export function normalizeRateCategoryListResponse(payload: unknown): RateCategoryResponse[] {
  const source = resolveArraySource(payload, RATE_CATEGORY_LIST_KEYS)
  if (!source) {
    throw new ApiError('Rate categories response format is invalid.', 500)
  }

  const normalized = normalizeListItems(source, normalizeRateCategoryResponse)

  if (normalized.length === 0) {
    throw new ApiError('No rate categories are configured in master data.', 404)
  }

  return normalized
}
