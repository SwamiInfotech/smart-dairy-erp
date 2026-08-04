import { useCallback, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { api } from '../lib/api'
import { explainQualityFieldVisibility } from '../lib/uiHelpers'
import type {
  CollectionMethodResponse,
  FarmerResponse,
  MasterLookupResponse,
  MilkRateChartResponse,
} from '../types/api'

type CollectionFormShape = {
  farmerUuid: string
  rate: number
}

type UseCollectionFarmerSelectionParams<TCollectionForm extends CollectionFormShape> = {
  token: string
  farmers: FarmerResponse[]
  collectionMethods: CollectionMethodResponse[]
  milkRateCharts: MilkRateChartResponse[]
  collectionFarmerUuid: string
  setCollectionForm: React.Dispatch<React.SetStateAction<TCollectionForm>>
  setSelectedCollectionMethod: React.Dispatch<React.SetStateAction<MasterLookupResponse | null>>
  setMilkRateCharts: React.Dispatch<React.SetStateAction<MilkRateChartResponse[]>>
  setCollectionMethods: React.Dispatch<React.SetStateAction<CollectionMethodResponse[]>>
}

export function useCollectionFarmerSelection<TCollectionForm extends CollectionFormShape>({
  token,
  farmers,
  collectionMethods,
  milkRateCharts,
  collectionFarmerUuid,
  setCollectionForm,
  setSelectedCollectionMethod,
  setMilkRateCharts,
  setCollectionMethods,
}: UseCollectionFarmerSelectionParams<TCollectionForm>) {
  const applyCollectionFarmerSelection = useCallback(
    async (farmerUuid: string) => {
      setCollectionForm((prev) => ({ ...prev, farmerUuid, rate: 0 }))
      setSelectedCollectionMethod(null)

      const selectedFarmer = farmers.find((item) => item.uuid === farmerUuid) || null

      let chartSource = milkRateCharts
      let methodSource = collectionMethods

      if (token && selectedFarmer?.milkRateChartUuid) {
        try {
          const [latestChartList, latestMethodList] = await Promise.all([
            api.getMilkRateCharts(token),
            api.getCollectionMethods(token),
          ])
          setMilkRateCharts(latestChartList)
          setCollectionMethods(latestMethodList)
          chartSource = latestChartList
          methodSource = latestMethodList
        } catch {
        }
      }

      const selectedMilkRateChart = selectedFarmer?.milkRateChartUuid
        ? chartSource.find((item) => item.uuid === selectedFarmer.milkRateChartUuid) || null
        : null
      const selectedMethodFromChart = selectedMilkRateChart?.collectionMethodUuid
        ? methodSource.find((item) => item.uuid === selectedMilkRateChart.collectionMethodUuid) || null
        : null
      explainQualityFieldVisibility(selectedMethodFromChart)

      setSelectedCollectionMethod(selectedMethodFromChart)

      setCollectionForm((prev) => ({
        ...prev,
        farmerUuid,
        rate: 0,
      }))
    },
    [
      collectionMethods,
      farmers,
      milkRateCharts,
      setCollectionForm,
      setCollectionMethods,
      setMilkRateCharts,
      setSelectedCollectionMethod,
      token,
    ],
  )

  useEffect(() => {
    if (!Array.isArray(farmers) || farmers.length === 0) {
      setCollectionForm((prev) => (prev.farmerUuid === '' ? prev : { ...prev, farmerUuid: '' }))
      return
    }

    const hasSelectedFarmer = farmers.some((item) => item.uuid === collectionFarmerUuid)
    if (collectionFarmerUuid && hasSelectedFarmer) {
      return
    }

    void applyCollectionFarmerSelection(farmers[0].uuid)
  }, [applyCollectionFarmerSelection, collectionFarmerUuid, farmers, setCollectionForm])

  const onCollectionFarmerChange = useCallback(
    async (event: ChangeEvent<HTMLSelectElement>) => {
      await applyCollectionFarmerSelection(event.target.value)
    },
    [applyCollectionFarmerSelection],
  )

  return {
    onCollectionFarmerChange,
  }
}
