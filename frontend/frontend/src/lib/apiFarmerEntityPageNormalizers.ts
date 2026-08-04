import type { FarmerResponse, PageResult } from '../types/api'
import { asRecord, readNumber } from './apiResponseParsers'
import { resolveArraySource } from './apiNormalizerUtils'
import { normalizeFarmerItem } from './apiFarmerEntityItemNormalizers'

export function normalizeFarmerPageResponse(payload: unknown): PageResult<FarmerResponse> {
  const rawList = resolveArraySource(payload, ['content', 'items', 'data']) || []

  const content = rawList
    .map((item) => normalizeFarmerItem(item))
    .filter((item): item is FarmerResponse => Boolean(item))

  const root = asRecord(payload)
  const totalElements = readNumber(root, 'totalElements', 'total_elements', 'count', 'total') || content.length
  const size = readNumber(root, 'size') || content.length || 10
  const number = readNumber(root, 'number', 'page', 'pageNumber')
  const totalPages =
    readNumber(root, 'totalPages', 'total_pages') || (size > 0 ? Math.ceil(totalElements / size) : 1)
  const numberOfElements = readNumber(root, 'numberOfElements', 'number_of_elements') || content.length
  const empty = content.length === 0

  return {
    content,
    totalElements,
    totalPages,
    size,
    number,
    numberOfElements,
    first: number <= 0,
    last: totalPages <= 1 || number >= totalPages - 1,
    empty,
  }
}
