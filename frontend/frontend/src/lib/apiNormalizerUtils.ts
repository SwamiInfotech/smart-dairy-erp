import { ApiError, asRecord } from './apiResponseParsers'

export function requireRecord(payload: unknown, invalidMessage: string): Record<string, unknown> {
  const record = asRecord(payload)
  if (!record) {
    throw new ApiError(invalidMessage, 500)
  }
  return record
}

export function assertRequiredStrings(
  values: Array<string | null | undefined>,
  invalidMessage: string,
): void {
  if (values.some((value) => !value)) {
    throw new ApiError(invalidMessage, 500)
  }
}

export function resolveArraySource(
  payload: unknown,
  keys: readonly string[],
): unknown[] | null {
  if (Array.isArray(payload)) {
    return payload
  }

  const root = asRecord(payload)
  if (!root) {
    return null
  }

  for (const key of keys) {
    const value = root[key]
    if (Array.isArray(value)) {
      return value
    }
  }

  return null
}

export function readFiniteNumber(record: Record<string, unknown> | null, ...keys: string[]) {
  if (!record) {
    return null
  }

  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
      return Number(value)
    }
  }

  return null
}

export function normalizeListItems<T>(
  source: unknown[],
  normalizeItem: (item: unknown) => T,
): T[] {
  const normalized: T[] = []

  for (const item of source) {
    try {
      normalized.push(normalizeItem(item))
    } catch {
      // Skip malformed entries and let callers enforce empty-list semantics.
    }
  }

  return normalized
}

export function normalizeBooleanFlag(
  record: Record<string, unknown> | null,
  keys: readonly string[],
  options?: {
    defaultValue?: boolean
    acceptString?: boolean
  },
): boolean {
  const defaultValue = options?.defaultValue ?? true
  const acceptString = options?.acceptString ?? false

  if (!record) {
    return defaultValue
  }

  for (const key of keys) {
    const value = record[key]

    if (typeof value === 'boolean') {
      return value
    }

    if (acceptString && typeof value === 'string') {
      return value.trim().toLowerCase() === 'true'
    }
  }

  return defaultValue
}
