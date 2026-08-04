import { useMemo } from 'react'
import { getSavedAuth } from '../lib/api'
import { resolveQualityFieldVisibility } from '../lib/uiHelpers'
import { useAppDerivedState } from './useAppDerivedState'
import { useAppEntityState } from './useAppEntityState'
import { useAppFormState } from './useAppFormState'
import { useAppSessionState } from './useAppSessionState'
import { useCollectionComputation } from './useCollectionComputation'
import { useMilkRateDetails } from './useMilkRateDetails'
import { useRunAction } from './useRunAction'

export function useAppShellState() {
  const initialAuth = useMemo(getSavedAuth, [])

  const session = useAppSessionState(initialAuth)
  const entities = useAppEntityState()

  const {
    nextProductCode,
    nextFarmerCode,
    nextCollectionNo,
    averageProductSellingPrice,
  } = useAppDerivedState({
    products: entities.products,
    farmers: entities.farmers,
    collections: entities.collections,
  })

  const forms = useAppFormState(initialAuth.branchUuid, nextCollectionNo)

  const collectionComputation = useCollectionComputation({
    farmers: entities.farmers,
    milkRateCharts: entities.milkRateCharts,
    selectedCollectionMethod: forms.selectedCollectionMethod,
    collectionForm: forms.collectionForm,
    setCollectionForm: forms.setCollectionForm,
  })

  const selectedMilkRateMethod = useMemo(() => {
    const methodUuid = forms.milkRateForm.collectionMethodUuid || ''
    if (!methodUuid) return null
    return entities.collectionMethods.find((item) => item.uuid === methodUuid) || null
  }, [entities.collectionMethods, forms.milkRateForm.collectionMethodUuid])

  const milkRateQualityVisibility = useMemo(
    () => resolveQualityFieldVisibility(selectedMilkRateMethod),
    [selectedMilkRateMethod],
  )

  const milkRateDetails = useMilkRateDetails({
    milkRateForm: forms.milkRateForm,
    milkRateQualityVisibility,
    setMilkRateForm: forms.setMilkRateForm,
  })

  const runAction = useRunAction(session.setBusy, session.setError, session.setSuccess)

  return {
    initialAuth,
    session,
    entities,
    forms,
    runAction,
    nextProductCode,
    nextFarmerCode,
    nextCollectionNo,
    averageProductSellingPrice,
    collectionComputation,
    milkRateQualityVisibility,
    milkRateDetails,
  }
}

export type AppShellState = ReturnType<typeof useAppShellState>
