import type {
  CreateMilkRateChartRequest,
  CustomerResponse,
  MasterLookupResponse,
  MilkRateChartResponse,
} from '../types/api'

export function buildCustomerLookupLabel(customer: CustomerResponse) {
  return `${customer.customerName} (${customer.customerCode || customer.mobileNo || 'Customer'})`
}

export function resolveCustomerSelection(input: string, customers: CustomerResponse[]) {
  const trimmed = input.trim().toLowerCase()
  if (!trimmed) return null

  return (
    customers.find((customer) => buildCustomerLookupLabel(customer).toLowerCase() === trimmed) ||
    customers.find((customer) => customer.customerName.trim().toLowerCase() === trimmed) ||
    customers.find((customer) => customer.customerCode.trim().toLowerCase() === trimmed) ||
    customers.find((customer) => customer.uuid.trim().toLowerCase() === trimmed) ||
    null
  )
}

export type QualityVisibility = {
  showFat: boolean
  showSnf: boolean
  showMava: boolean
}

export function resolveQualityFieldVisibility(collectionMethod: MasterLookupResponse | null): QualityVisibility {
  if (!collectionMethod) {
    return {
      showFat: true,
      showSnf: true,
      showMava: true,
    }
  }

  const code = collectionMethod.code.trim().toLowerCase()
  const name = collectionMethod.name.trim().toLowerCase()
  const codeToken = code.replace(/[^a-z]/g, '')
  const nameToken = name.replace(/[^a-z]/g, '')
  const words = `${code} ${name}`

  // Prefer exact code/name key first because master names can contain extra words.
  if (codeToken === 'fat' || nameToken === 'fat') {
    return {
      showFat: true,
      showSnf: false,
      showMava: false,
    }
  }

  if (codeToken === 'snf' || nameToken === 'snf') {
    return {
      showFat: false,
      showSnf: true,
      showMava: false,
    }
  }

  if (codeToken === 'mava' || nameToken === 'mava') {
    return {
      showFat: false,
      showSnf: false,
      showMava: true,
    }
  }

  // Fallback token checks when exact normalization is not available.
  const hasFat = /\bfat\b/.test(words)
  const hasSnf = /\bsnf\b/.test(words)
  const hasMava = /\bmava\b/.test(words)

  if (hasFat && !hasSnf && !hasMava) {
    return {
      showFat: true,
      showSnf: false,
      showMava: false,
    }
  }

  if (hasSnf && !hasFat && !hasMava) {
    return {
      showFat: false,
      showSnf: true,
      showMava: false,
    }
  }

  if (hasMava && !hasFat && !hasSnf) {
    return {
      showFat: false,
      showSnf: false,
      showMava: true,
    }
  }

  return {
    showFat: true,
    showSnf: true,
    showMava: true,
  }
}

export function explainQualityFieldVisibility(collectionMethod: MasterLookupResponse | null) {
  const visibility = resolveQualityFieldVisibility(collectionMethod)
  const summary = `${visibility.showFat ? 'FAT:show' : 'FAT:hide'}, ${visibility.showSnf ? 'SNF:show' : 'SNF:hide'}, ${visibility.showMava ? 'MAVA:show' : 'MAVA:hide'}`

  if (!collectionMethod) {
    return {
      visibility,
      reason: 'collection-method-missing -> fallback show all',
      summary,
    }
  }

  const code = collectionMethod.code.trim().toLowerCase()
  const name = collectionMethod.name.trim().toLowerCase()
  return {
    visibility,
    reason: `resolved from collection method code="${code}" name="${name}"`,
    summary,
  }
}

export function pickCollectionQualityMetric(visibility: QualityVisibility) {
  if (visibility.showFat && !visibility.showSnf && !visibility.showMava) {
    return 'fat' as const
  }

  if (!visibility.showFat && visibility.showSnf && !visibility.showMava) {
    return 'snf' as const
  }

  if (!visibility.showFat && !visibility.showSnf && visibility.showMava) {
    return 'mava' as const
  }

  return 'mixed' as const
}

export function roundToTwo(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 100) / 100
}

type MilkRateDetailInput = CreateMilkRateChartRequest['details'][number]

export function createEmptyMilkRateDetail(): MilkRateDetailInput {
  return {
    fatFrom: null,
    fatTo: null,
    snfFrom: null,
    snfTo: null,
    mavaFrom: null,
    mavaTo: null,
    rate: 0,
  }
}

type CollectionQualityInput = {
  fat: number
  snf: number | null
  mava: number
}

export type ActiveCollectionQuality = {
  metric: 'fat' | 'snf' | 'mava'
  value: number
}

export function resolveActiveCollectionQuality(
  qualityInput: CollectionQualityInput,
  visibility: QualityVisibility,
): ActiveCollectionQuality {
  const metricType = pickCollectionQualityMetric(visibility)

  if (metricType === 'fat') {
    return { metric: 'fat', value: Number(qualityInput.fat) || 0 }
  }

  if (metricType === 'snf') {
    return { metric: 'snf', value: Number(qualityInput.snf) || 0 }
  }

  if (metricType === 'mava') {
    return { metric: 'mava', value: Number(qualityInput.mava) || 0 }
  }

  const fatValue = Number(qualityInput.fat) || 0
  if (fatValue > 0) {
    return { metric: 'fat', value: fatValue }
  }

  const snfValue = Number(qualityInput.snf) || 0
  if (snfValue > 0) {
    return { metric: 'snf', value: snfValue }
  }

  const mavaValue = Number(qualityInput.mava) || 0
  if (mavaValue > 0) {
    return { metric: 'mava', value: mavaValue }
  }

  return { metric: 'fat', value: 0 }
}

export function isCollectionDateWithinRateChartRange(
  collectionDate: string,
  rateChart: MilkRateChartResponse | null,
) {
  const inputDate = collectionDate.trim()
  const effectiveFrom = (rateChart?.effectiveFrom || '').trim()
  const effectiveTo = (rateChart?.effectiveTo || '').trim()

  if (!inputDate || !effectiveFrom) return false
  if (inputDate < effectiveFrom) return false
  if (effectiveTo && inputDate > effectiveTo) return false

  return true
}

type CollectionRateMatchInput = {
  qualityInput: CollectionQualityInput
  visibility: QualityVisibility
  details: MilkRateChartResponse['details']
  isDateWithinRateChart: boolean
  activeQuality: ActiveCollectionQuality
}

export function findCollectionRateMatch({
  qualityInput,
  visibility,
  details,
  isDateWithinRateChart,
  activeQuality,
}: CollectionRateMatchInput) {
  const fatVisible = visibility.showFat
  const snfVisible = visibility.showSnf
  const mavaVisible = visibility.showMava
  const eligibleDetails = isDateWithinRateChart ? details || [] : []
  const activeMetric = activeQuality.metric
  const activeMetricValue = Number(activeQuality.value) || 0

  if (!fatVisible && !snfVisible && !mavaVisible) {
    return {
      matchedDetail: null as (typeof eligibleDetails)[number] | null,
      matchedRowIndex: -1,
      totalRows: eligibleDetails.length,
      activeMetric,
      activeMetricValue,
    }
  }

  const fatValue = Number(qualityInput.fat) || 0
  const snfValue = Number(qualityInput.snf ?? 0)
  const mavaValue = Number(qualityInput.mava) || 0

  const isInRange = (value: number, from: number | null, to: number | null) => {
    if (from === null || to === null) return false
    return value >= from && value <= to
  }

  const metricInputValues = {
    fat: fatValue,
    snf: snfValue,
    mava: mavaValue,
  } as const

  const metricVisibility = {
    fat: fatVisible,
    snf: snfVisible,
    mava: mavaVisible,
  } as const

  const metricBounds = {
    fat: (detail: (typeof eligibleDetails)[number]) => ({ from: detail.fatFrom, to: detail.fatTo }),
    snf: (detail: (typeof eligibleDetails)[number]) => ({ from: detail.snfFrom, to: detail.snfTo }),
    mava: (detail: (typeof eligibleDetails)[number]) => ({ from: detail.mavaFrom, to: detail.mavaTo }),
  } as const

  const supportsMetric = (detail: (typeof eligibleDetails)[number], metric: keyof typeof metricBounds) => {
    const bounds = metricBounds[metric](detail)
    return bounds.from !== null && bounds.to !== null
  }

  const matchesMetric = (
    detail: (typeof eligibleDetails)[number],
    metric: keyof typeof metricBounds,
    value: number,
  ) => {
    const bounds = metricBounds[metric](detail)
    return isInRange(value, bounds.from, bounds.to)
  }

  let matchedRowIndex = -1
  const matchedDetail =
    eligibleDetails.find((detail, index) => {
      if (activeMetricValue > 0) {
        if (!supportsMetric(detail, activeMetric)) return false
        if (!matchesMetric(detail, activeMetric, activeMetricValue)) return false
      }

      const metrics: Array<keyof typeof metricBounds> = ['fat', 'snf', 'mava']
      for (const metric of metrics) {
        if (!metricVisibility[metric]) continue
        if (metric === activeMetric && activeMetricValue > 0) continue
        if (!supportsMetric(detail, metric)) continue

        const inputValue = metricInputValues[metric]
        if (inputValue <= 0) continue

        if (!matchesMetric(detail, metric, inputValue)) return false
      }

      matchedRowIndex = index
      return true
    }) || null

  return {
    matchedDetail,
    matchedRowIndex,
    totalRows: eligibleDetails.length,
    activeMetric,
    activeMetricValue,
  }
}

export function normalizeCollectionQualityValues(
  qualityInput: CollectionQualityInput,
  visibility: QualityVisibility,
) {
  let changed = false
  let fat = qualityInput.fat
  let snf = qualityInput.snf
  let mava = qualityInput.mava

  if (!visibility.showFat && fat !== 0) {
    fat = 0
    changed = true
  }

  if (!visibility.showSnf && snf !== null) {
    snf = null
    changed = true
  }

  if (!visibility.showMava && mava !== 0) {
    mava = 0
    changed = true
  }

  return {
    changed,
    values: {
      fat,
      snf,
      mava,
    },
  }
}
