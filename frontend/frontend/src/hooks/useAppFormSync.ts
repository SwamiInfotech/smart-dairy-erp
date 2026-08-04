import { useEffect } from 'react'
import { findLookupByLabel } from '../lib/appCoreUtils'
import type { MilkTypeResponse, ShiftResponse } from '../types/api'

type ProductFormState = {
  productCode: string
}

type FarmerFormState = {
  farmerCode: string
  branchUuid: string
}

type CollectionFormState = {
  collectionNo: string
  milkTypeUuid: string
  shiftUuid: string
}

type CustomerFormState = {
  branchUuid: string
}

type SalesFormState = {
  branchUuid: string
}

type MilkRateFormState = {
  branchUuid: string
}

type UseAppFormSyncParams = {
  branchUuid: string
  nextProductCode: string
  nextFarmerCode: string
  nextCollectionNo: string
  collectionForm: CollectionFormState
  milkTypes: MilkTypeResponse[]
  shifts: ShiftResponse[]
  setProductForm: React.Dispatch<React.SetStateAction<ProductFormState>>
  setFarmerForm: React.Dispatch<React.SetStateAction<FarmerFormState>>
  setCollectionForm: React.Dispatch<React.SetStateAction<CollectionFormState>>
  setCustomerForm: React.Dispatch<React.SetStateAction<CustomerFormState>>
  setSalesForm: React.Dispatch<React.SetStateAction<SalesFormState>>
  setMilkRateForm: React.Dispatch<React.SetStateAction<MilkRateFormState>>
}

type UseAppFormSyncGenericParams<
  TProductForm extends ProductFormState,
  TFarmerForm extends FarmerFormState,
  TCollectionForm extends CollectionFormState,
  TCustomerForm extends CustomerFormState,
  TSalesForm extends SalesFormState,
  TMilkRateForm extends MilkRateFormState,
> = Omit<UseAppFormSyncParams, 'collectionForm' | 'setProductForm' | 'setFarmerForm' | 'setCollectionForm' | 'setCustomerForm' | 'setSalesForm' | 'setMilkRateForm'> & {
  collectionForm: TCollectionForm
  setProductForm: React.Dispatch<React.SetStateAction<TProductForm>>
  setFarmerForm: React.Dispatch<React.SetStateAction<TFarmerForm>>
  setCollectionForm: React.Dispatch<React.SetStateAction<TCollectionForm>>
  setCustomerForm: React.Dispatch<React.SetStateAction<TCustomerForm>>
  setSalesForm: React.Dispatch<React.SetStateAction<TSalesForm>>
  setMilkRateForm: React.Dispatch<React.SetStateAction<TMilkRateForm>>
}

export function useAppFormSync<
  TProductForm extends ProductFormState,
  TFarmerForm extends FarmerFormState,
  TCollectionForm extends CollectionFormState,
  TCustomerForm extends CustomerFormState,
  TSalesForm extends SalesFormState,
  TMilkRateForm extends MilkRateFormState,
>({
  branchUuid,
  nextProductCode,
  nextFarmerCode,
  nextCollectionNo,
  collectionForm,
  milkTypes,
  shifts,
  setProductForm,
  setFarmerForm,
  setCollectionForm,
  setCustomerForm,
  setSalesForm,
  setMilkRateForm,
}: UseAppFormSyncGenericParams<
  TProductForm,
  TFarmerForm,
  TCollectionForm,
  TCustomerForm,
  TSalesForm,
  TMilkRateForm
>) {
  useEffect(() => {
    if (collectionForm.milkTypeUuid) return
    if (!Array.isArray(milkTypes) || milkTypes.length === 0) return

    const buffaloMilk = findLookupByLabel(milkTypes, 'buffalo milk')
    const targetMilkTypeUuid = buffaloMilk?.uuid || milkTypes[0]?.uuid || ''

    if (!targetMilkTypeUuid) return

    setCollectionForm((prev) => {
      if (prev.milkTypeUuid) return prev
      return {
        ...prev,
        milkTypeUuid: targetMilkTypeUuid,
      }
    })
  }, [collectionForm.milkTypeUuid, milkTypes, setCollectionForm])

  useEffect(() => {
    if (collectionForm.shiftUuid) return
    if (!Array.isArray(shifts) || shifts.length === 0) return

    const morningShift = findLookupByLabel(shifts, 'morning')
    const targetShiftUuid = morningShift?.uuid || shifts[0]?.uuid || ''

    if (!targetShiftUuid) return

    setCollectionForm((prev) => {
      if (prev.shiftUuid) return prev
      return {
        ...prev,
        shiftUuid: targetShiftUuid,
      }
    })
  }, [collectionForm.shiftUuid, setCollectionForm, shifts])

  useEffect(() => {
    setProductForm((prev) => {
      if (prev.productCode === nextProductCode) return prev
      return {
        ...prev,
        productCode: nextProductCode,
      }
    })
  }, [nextProductCode, setProductForm])

  useEffect(() => {
    setFarmerForm((prev) => {
      if (prev.farmerCode === nextFarmerCode) return prev
      return {
        ...prev,
        farmerCode: nextFarmerCode,
      }
    })
  }, [nextFarmerCode, setFarmerForm])

  useEffect(() => {
    setCollectionForm((prev) => {
      if (prev.collectionNo === nextCollectionNo) return prev
      return {
        ...prev,
        collectionNo: nextCollectionNo,
      }
    })
  }, [nextCollectionNo, setCollectionForm])

  useEffect(() => {
    setCustomerForm((prev) => {
      if (prev.branchUuid === branchUuid) return prev
      return {
        ...prev,
        branchUuid,
      }
    })

    setFarmerForm((prev) => {
      if (prev.branchUuid === branchUuid) return prev
      return {
        ...prev,
        branchUuid,
      }
    })

    setSalesForm((prev) => {
      if (prev.branchUuid === branchUuid) return prev
      return {
        ...prev,
        branchUuid,
      }
    })

    setMilkRateForm((prev) => {
      if (prev.branchUuid === branchUuid) return prev
      return {
        ...prev,
        branchUuid,
      }
    })
  }, [branchUuid, setCustomerForm, setFarmerForm, setMilkRateForm, setSalesForm])
}
