import type { CreateMilkRateChartRequest, CreateShiftRequest } from '../types/api'

type NamedMasterPayload = {
  code: string
  name: string
  description: string
  displayOrder?: number | null
}

export function buildShiftPayload(payload: CreateShiftRequest) {
  return {
    code: payload.code.trim(),
    name: payload.name.trim(),
    description: payload.description.trim() || null,
    displayOrder: payload.displayOrder,
  }
}

export function buildNamedMasterPayload(payload: NamedMasterPayload) {
  return {
    code: payload.code.trim(),
    name: payload.name.trim(),
    description: payload.description.trim() || null,
    displayOrder: typeof payload.displayOrder === 'number' ? payload.displayOrder : null,
  }
}

export function buildMilkRateChartPayload(payload: CreateMilkRateChartRequest) {
  return {
    ...payload,
    chartName: payload.chartName.trim(),
    effectiveTo: payload.effectiveTo.trim() ? payload.effectiveTo : null,
    remarks: payload.remarks.trim(),
    details: payload.details.map((detail) => ({
      fatFrom: detail.fatFrom,
      fatTo: detail.fatTo,
      snfFrom: detail.snfFrom,
      snfTo: detail.snfTo,
      mavaFrom: detail.mavaFrom,
      mavaTo: detail.mavaTo,
      rate: detail.rate,
    })),
  }
}
