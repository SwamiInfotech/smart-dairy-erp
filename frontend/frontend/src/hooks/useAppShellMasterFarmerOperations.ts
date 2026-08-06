import type { AppShellState } from './useAppShellState'
import { useAppFormSync } from './useAppFormSync'
import { useCollectionFarmerSelection } from './useCollectionFarmerSelection'
import { useFarmerCrud } from './useFarmerCrud'
import { useMasterDataCrud } from './useMasterDataCrud'

export function useAppShellMasterFarmerOperations(
  state: AppShellState,
) {
  const { session, entities, forms, runAction, nextProductCode, nextFarmerCode, nextCollectionNo } = state

  const masterDataCrud = useMasterDataCrud({
    token: session.token,
    runAction,
    setError: session.setError,
    setCollectionMethods: entities.setCollectionMethods,
    setPaymentCycles: entities.setPaymentCycles,
    setShifts: entities.setShifts,
    setRateCategories: entities.setRateCategories,
  })

  const farmerCrud = useFarmerCrud({
    token: session.token,
    branchUuid: session.branchUuid,
    nextFarmerCode,
    milkTypes: entities.milkTypes,
    paymentCycles: entities.paymentCycles,
    farmerRateCharts: entities.farmerRateCharts,
    runAction,
    setError: session.setError,
    setFarmers: entities.setFarmers,
    setMilkRateCharts: entities.setMilkRateCharts,
    setCollectionMethods: entities.setCollectionMethods,
    setSelectedCollectionMethod: forms.setSelectedCollectionMethod,
    setCollectionForm: forms.setCollectionForm,
  })

  const collectionFarmerSelection = useCollectionFarmerSelection({
    token: session.token,
    farmers: entities.farmers,
    collectionMethods: entities.collectionMethods,
    milkRateCharts: entities.milkRateCharts,
    collectionFarmerUuid: forms.collectionForm.farmerUuid,
    setCollectionForm: forms.setCollectionForm,
    setSelectedCollectionMethod: forms.setSelectedCollectionMethod,
    setMilkRateCharts: entities.setMilkRateCharts,
    setCollectionMethods: entities.setCollectionMethods,
  })

  useAppFormSync({
    branchUuid: session.branchUuid,
    nextProductCode,
    nextFarmerCode,
    nextCollectionNo,
    collectionForm: forms.collectionForm,
    milkTypes: entities.milkTypes,
    shifts: entities.shifts,
    setProductForm: forms.setProductForm,
    setFarmerForm: farmerCrud.setFarmerForm,
    setCollectionForm: forms.setCollectionForm,
    setCustomerForm: forms.setCustomerForm,
    setSalesForm: forms.setSalesForm,
    setMilkRateForm: forms.setMilkRateForm,
  })

  return {
    masterDataCrud,
    farmerCrud,
    collectionFarmerSelection,
  }
}
