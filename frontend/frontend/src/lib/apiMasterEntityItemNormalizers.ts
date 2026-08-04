import type {
  CollectionMethodResponse,
  PaymentCycleResponse,
  RateCategoryResponse,
  ShiftResponse,
} from '../types/api'
import { asRecord, readNumber, readString } from './apiResponseParsers'
import {
  assertRequiredStrings,
  normalizeBooleanFlag,
  readFiniteNumber,
  requireRecord,
} from './apiNormalizerUtils'

export function normalizeShiftItem(payload: unknown): ShiftResponse | null {
  const record = asRecord(payload)
  const uuid = readString(record, 'uuid', 'shiftUuid', 'id')
  const code = readString(record, 'code', 'shiftCode')
  const name = readString(record, 'name', 'shiftName')

  if (!uuid || !code || !name) {
    return null
  }

  const description = readString(record, 'description', 'desc') || null
  const displayOrderValue = readNumber(record, 'displayOrder', 'display_order', 'sortOrder', 'order')
  return {
    uuid,
    code,
    name,
    description,
    displayOrder: Number.isFinite(displayOrderValue) ? displayOrderValue : null,
    active: normalizeBooleanFlag(record, ['active', 'enabled'], { acceptString: true }),
  }
}

export function normalizeCollectionMethodResponse(payload: unknown): CollectionMethodResponse {
  const record = requireRecord(payload, 'Collection method response format is invalid.')

  const uuid = readString(record, 'uuid', 'id', 'collectionMethodUuid', 'methodUuid')
  const code = readString(record, 'code', 'methodCode', 'collectionMethodCode')
  const name = readString(record, 'name', 'methodName', 'collectionMethodName')

  assertRequiredStrings([uuid, code, name], 'Collection method response format is invalid.')

  return {
    uuid,
    code,
    name,
    description: readString(record, 'description', 'remarks', 'note') || null,
    displayOrder: readFiniteNumber(record, 'displayOrder', 'display_order', 'sortOrder', 'order'),
    active: normalizeBooleanFlag(record, ['active', 'enabled'], { acceptString: true }),
  }
}

export function normalizePaymentCycleResponse(payload: unknown): PaymentCycleResponse {
  const record = requireRecord(payload, 'Payment cycle response format is invalid.')

  const uuid = readString(record, 'uuid', 'id', 'paymentCycleUuid')
  const code = readString(record, 'code', 'cycleCode', 'paymentCycleCode')
  const name = readString(record, 'name', 'cycleName', 'paymentCycleName')

  assertRequiredStrings([uuid, code, name], 'Payment cycle response format is invalid.')

  return {
    uuid,
    code,
    name,
    description: readString(record, 'description', 'remarks', 'note') || null,
    displayOrder: readFiniteNumber(record, 'displayOrder', 'display_order', 'sortOrder', 'order'),
    active: normalizeBooleanFlag(record, ['active', 'enabled'], { acceptString: true }),
  }
}

export function normalizeRateCategoryResponse(payload: unknown): RateCategoryResponse {
  const record = requireRecord(payload, 'Rate category response format is invalid.')

  const uuid = readString(record, 'uuid', 'id', 'rateCategoryUuid')
  const code = readString(record, 'code', 'categoryCode', 'rateCategoryCode')
  const name = readString(record, 'name', 'categoryName', 'rateCategoryName')

  assertRequiredStrings([uuid, code, name], 'Rate category response format is invalid.')

  const displayOrderValue = readNumber(record, 'displayOrder', 'display_order', 'order', 'sortOrder')
  return {
    uuid,
    code,
    name,
    description: readString(record, 'description', 'remarks', 'note') || null,
    displayOrder:
      Number.isFinite(displayOrderValue) && displayOrderValue >= 0 ? displayOrderValue : null,
    active: normalizeBooleanFlag(record, ['active', 'enabled']),
  }
}
