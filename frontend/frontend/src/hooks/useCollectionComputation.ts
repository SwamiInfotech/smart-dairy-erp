import { useEffect, useMemo } from 'react'
import {
  explainQualityFieldVisibility,
  findCollectionRateMatch,
  isCollectionDateWithinRateChartRange,
  normalizeCollectionQualityValues,
  resolveActiveCollectionQuality,
  resolveQualityFieldVisibility,
  roundToTwo,
} from '../lib/uiHelpers'
import type { FarmerResponse, MasterLookupResponse, MilkRateChartResponse } from '../types/api'

type CollectionFormShape = {
  farmerUuid: string
  collectionDate: string
  quantity: number
  rate: number
  fat: number
  snf: number | null
  mava: number
}

type UseCollectionComputationParams<TCollectionForm extends CollectionFormShape> = {
  farmers: FarmerResponse[]
  milkRateCharts: MilkRateChartResponse[]
  selectedCollectionMethod: MasterLookupResponse | null
  collectionForm: TCollectionForm
  setCollectionForm: React.Dispatch<React.SetStateAction<TCollectionForm>>
}

export function useCollectionComputation<TCollectionForm extends CollectionFormShape>({
  farmers,
  milkRateCharts,
  selectedCollectionMethod,
  collectionForm,
  setCollectionForm,
}: UseCollectionComputationParams<TCollectionForm>) {
  const selectedCollectionFarmer = useMemo(
    () => farmers.find((item) => item.uuid === collectionForm.farmerUuid) || null,
    [collectionForm.farmerUuid, farmers],
  )

  const selectedCollectionMilkRateChart = useMemo(() => {
    const chartUuid = selectedCollectionFarmer?.milkRateChartUuid || ''
    if (!chartUuid) return null
    return milkRateCharts.find((item) => item.uuid === chartUuid) || null
  }, [milkRateCharts, selectedCollectionFarmer])

  const collectionQualityVisibility = useMemo(
    () => resolveQualityFieldVisibility(selectedCollectionMethod),
    [selectedCollectionMethod],
  )

  useEffect(() => {
    explainQualityFieldVisibility(selectedCollectionMethod)
  }, [collectionQualityVisibility, selectedCollectionMethod])

  const activeCollectionQuality = useMemo(
    () =>
      resolveActiveCollectionQuality(
        {
          fat: collectionForm.fat,
          snf: collectionForm.snf,
          mava: collectionForm.mava,
        },
        collectionQualityVisibility,
      ),
    [collectionForm.fat, collectionForm.mava, collectionForm.snf, collectionQualityVisibility],
  )

  const calculatedCollectionRate = useMemo(
    () => roundToTwo(Number(collectionForm.rate) || 0),
    [collectionForm.rate],
  )

  const isCollectionDateWithinRateChart = useMemo(
    () => isCollectionDateWithinRateChartRange(collectionForm.collectionDate, selectedCollectionMilkRateChart),
    [collectionForm.collectionDate, selectedCollectionMilkRateChart],
  )

  const calculatedCollectionAmount = useMemo(() => {
    const quantity = Number(collectionForm.quantity) || 0
    const qualityValue = activeCollectionQuality.value

    if (quantity <= 0 || qualityValue <= 0 || calculatedCollectionRate <= 0) {
      return 0
    }

    return roundToTwo(quantity * qualityValue * calculatedCollectionRate)
  }, [activeCollectionQuality.value, calculatedCollectionRate, collectionForm.quantity])

  useEffect(() => {
    setCollectionForm((prev) => {
      const normalized = normalizeCollectionQualityValues(
        {
          fat: prev.fat,
          snf: prev.snf,
          mava: prev.mava,
        },
        collectionQualityVisibility,
      )

      if (!normalized.changed) return prev

      return {
        ...prev,
        fat: normalized.values.fat,
        snf: normalized.values.snf,
        mava: normalized.values.mava,
      }
    })
  }, [collectionQualityVisibility, setCollectionForm])

  const collectionRateMatchDebug = useMemo(
    () =>
      findCollectionRateMatch({
        qualityInput: {
          fat: collectionForm.fat,
          snf: collectionForm.snf,
          mava: collectionForm.mava,
        },
        visibility: collectionQualityVisibility,
        details: selectedCollectionMilkRateChart?.details || [],
        isDateWithinRateChart: isCollectionDateWithinRateChart,
        activeQuality: activeCollectionQuality,
      }),
    [
      activeCollectionQuality,
      collectionForm.fat,
      collectionForm.mava,
      collectionForm.snf,
      collectionQualityVisibility,
      isCollectionDateWithinRateChart,
      selectedCollectionMilkRateChart?.details,
    ],
  )

  useEffect(() => {
    const nextRate = roundToTwo(Number(collectionRateMatchDebug.matchedDetail?.rate) || 0)

    setCollectionForm((prev) => {
      const currentRate = roundToTwo(Number(prev.rate) || 0)
      if (currentRate === nextRate) return prev
      return { ...prev, rate: nextRate }
    })
  }, [collectionRateMatchDebug.matchedDetail, setCollectionForm])

  return {
    selectedCollectionFarmer,
    selectedCollectionMilkRateChart,
    collectionQualityVisibility,
    calculatedCollectionRate,
    isCollectionDateWithinRateChart,
    calculatedCollectionAmount,
  }
}
