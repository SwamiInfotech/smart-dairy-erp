import type {
  CreateCollectionMethodRequest,
  CreatePaymentCycleRequest,
  CreateRateCategoryRequest,
  CreateShiftRequest,
  CreateMilkRateChartRequest,
  MilkTypeResponse,
  UpdateCollectionMethodRequest,
  UpdatePaymentCycleRequest,
  UpdateRateCategoryRequest,
} from '../types/api'
import {
  normalizeCollectionMethodListResponse,
  normalizeCollectionMethodResponse,
  normalizeMilkRateChartListResponse,
  normalizeMilkRateChartResponse,
  normalizePaymentCycleListResponse,
  normalizePaymentCycleResponse,
  normalizeRateCategoryListResponse,
  normalizeRateCategoryResponse,
  normalizeShiftsResponse,
  validateMilkRateChartPayload,
} from './apiEntityNormalizers'
import {
  buildMilkRateChartPayload,
  buildNamedMasterPayload,
  buildShiftPayload,
} from './apiPayloadBuilders'
import type { RequestFn } from './apiRequestCore'

type ApiMastersModuleDependencies = {
  request: RequestFn
}

export function createApiMastersModule({ request }: ApiMastersModuleDependencies) {
  return {
    getMilkTypes(token: string) {
      return request<MilkTypeResponse[]>('GET', '/api/v1/master/milk-types', token)
    },

    async getShifts(token: string) {
      const response = await request<unknown>('GET', '/api/v1/master/shifts', token)
      return normalizeShiftsResponse(response)
    },

    async createShift(token: string, payload: CreateShiftRequest) {
      const response = await request<unknown>(
        'POST',
        '/api/v1/master/shifts',
        token,
        buildShiftPayload(payload),
      )
      const normalized = normalizeShiftsResponse([response])
      return normalized[0]
    },

    async createMilkRateChart(token: string, payload: CreateMilkRateChartRequest) {
      validateMilkRateChartPayload(payload)
      const response = await request<unknown>(
        'POST',
        '/api/v1/milk-rate-charts',
        token,
        buildMilkRateChartPayload(payload),
      )
      return normalizeMilkRateChartResponse(response)
    },

    async updateMilkRateChart(token: string, uuid: string, payload: CreateMilkRateChartRequest) {
      validateMilkRateChartPayload(payload)
      const response = await request<unknown>(
        'PUT',
        `/api/v1/milk-rate-charts/${uuid}`,
        token,
        buildMilkRateChartPayload(payload),
      )
      return normalizeMilkRateChartResponse(response)
    },

    deleteMilkRateChart(token: string, uuid: string) {
      return request<void>('DELETE', `/api/v1/milk-rate-charts/${uuid}`, token)
    },

    async getMilkRateCharts(token: string) {
      const response = await request<unknown>('GET', '/api/v1/milk-rate-charts', token)
      const normalized = normalizeMilkRateChartListResponse(response)
      if (normalized.length > 0 && normalized.every((item) => item.details.length === 0)) {
        console.warn(
          '[api.getMilkRateCharts] All charts returned with empty details. Backend may be omitting detail rows in list response.',
          response,
        )
      }
      return normalized
    },

    async getRateCategories(token: string) {
      const response = await request<unknown>('GET', '/api/v1/master/rate-categories', token)
      return normalizeRateCategoryListResponse(response)
    },

    async createRateCategory(token: string, payload: CreateRateCategoryRequest) {
      const response = await request<unknown>(
        'POST',
        '/api/v1/master/rate-categories',
        token,
        buildNamedMasterPayload(payload),
      )
      return normalizeRateCategoryResponse(response)
    },

    async updateRateCategory(token: string, uuid: string, payload: UpdateRateCategoryRequest) {
      const response = await request<unknown>(
        'PUT',
        `/api/v1/master/rate-categories/${uuid}`,
        token,
        buildNamedMasterPayload(payload),
      )
      return normalizeRateCategoryResponse(response)
    },

    deleteRateCategory(token: string, uuid: string) {
      return request<void>('DELETE', `/api/v1/master/rate-categories/${uuid}`, token)
    },

    async getCollectionMethods(token: string) {
      const response = await request<unknown>('GET', '/api/v1/master/collection-methods', token)
      return normalizeCollectionMethodListResponse(response)
    },

    async createCollectionMethod(token: string, payload: CreateCollectionMethodRequest) {
      const response = await request<unknown>(
        'POST',
        '/api/v1/master/collection-methods',
        token,
        buildNamedMasterPayload(payload),
      )
      return normalizeCollectionMethodResponse(response)
    },

    async updateCollectionMethod(
      token: string,
      uuid: string,
      payload: UpdateCollectionMethodRequest,
    ) {
      const response = await request<unknown>(
        'PUT',
        `/api/v1/master/collection-methods/${uuid}`,
        token,
        buildNamedMasterPayload(payload),
      )
      return normalizeCollectionMethodResponse(response)
    },

    deleteCollectionMethod(token: string, uuid: string) {
      return request<void>('DELETE', `/api/v1/master/collection-methods/${uuid}`, token)
    },

    async getPaymentCycles(token: string) {
      const response = await request<unknown>('GET', '/api/v1/payment-cycles', token)
      return normalizePaymentCycleListResponse(response)
    },

    async createPaymentCycle(token: string, payload: CreatePaymentCycleRequest) {
      const response = await request<unknown>(
        'POST',
        '/api/v1/payment-cycles',
        token,
        buildNamedMasterPayload(payload),
      )
      return normalizePaymentCycleResponse(response)
    },

    async updatePaymentCycle(token: string, uuid: string, payload: UpdatePaymentCycleRequest) {
      const response = await request<unknown>(
        'PUT',
        `/api/v1/payment-cycles/${uuid}`,
        token,
        buildNamedMasterPayload(payload),
      )
      return normalizePaymentCycleResponse(response)
    },

    deletePaymentCycle(token: string, uuid: string) {
      return request<void>('DELETE', `/api/v1/payment-cycles/${uuid}`, token)
    },
  }
}
