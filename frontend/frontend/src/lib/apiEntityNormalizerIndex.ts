import {
  normalizeCollectionMethodListResponse,
  normalizeCollectionMethodResponse,
  normalizePaymentCycleListResponse,
  normalizePaymentCycleResponse,
  normalizeRateCategoryListResponse,
  normalizeRateCategoryResponse,
  normalizeShiftsResponse,
} from './apiMasterEntityNormalizers'
import {
  normalizeMilkRateChartListResponse,
  normalizeMilkRateChartResponse,
  validateMilkRateChartPayload,
} from './apiMilkRateEntityNormalizers'
import { normalizeFarmerPageResponse } from './apiFarmerEntityNormalizers'

export const apiEntityNormalizerIndex = {
  normalizeShiftsResponse,
  normalizeCollectionMethodResponse,
  normalizeCollectionMethodListResponse,
  normalizePaymentCycleResponse,
  normalizePaymentCycleListResponse,
  normalizeRateCategoryResponse,
  normalizeRateCategoryListResponse,
  normalizeMilkRateChartResponse,
  normalizeMilkRateChartListResponse,
  validateMilkRateChartPayload,
  normalizeFarmerPageResponse,
}

export type ApiEntityNormalizerIndex = typeof apiEntityNormalizerIndex

export {
  normalizeShiftsResponse,
  normalizeCollectionMethodResponse,
  normalizeCollectionMethodListResponse,
  normalizePaymentCycleResponse,
  normalizePaymentCycleListResponse,
  normalizeRateCategoryResponse,
  normalizeRateCategoryListResponse,
  normalizeMilkRateChartResponse,
  normalizeMilkRateChartListResponse,
  validateMilkRateChartPayload,
  normalizeFarmerPageResponse,
}
