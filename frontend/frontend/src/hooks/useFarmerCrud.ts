import type { FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import {
  findLookupByLabel,
  isTenDigitMobile,
  isUuid,
  isValidAadhar,
  isValidEmail,
  isValidPan,
  isValidPincode,
  toInputDate,
} from '../lib/appCoreUtils'
import { roundToTwo } from '../lib/uiHelpers'
import type {
  CollectionMethodResponse,
  CreateFarmerRequest,
  FarmerResponse,
  MasterLookupResponse,
  MilkRateChartResponse,
  MilkTypeResponse,
  PaymentCycleResponse,
} from '../types/api'

type CollectionFormForFarmerSync = {
  farmerUuid: string
  quantity: number
  fat: number
  snf: number | null
  mava: number
  rate: number
}

type UseFarmerCrudParams<TCollectionForm extends CollectionFormForFarmerSync> = {
  token: string
  branchUuid: string
  nextFarmerCode: string
  milkTypes: MilkTypeResponse[]
  paymentCycles: PaymentCycleResponse[]
  farmerRateCharts: MilkRateChartResponse[]
  runAction: <T>(action: () => Promise<T>, successMessage?: string) => Promise<T | null>
  setError: React.Dispatch<React.SetStateAction<string>>
  setFarmers: React.Dispatch<React.SetStateAction<FarmerResponse[]>>
  setMilkRateCharts: React.Dispatch<React.SetStateAction<MilkRateChartResponse[]>>
  setCollectionMethods: React.Dispatch<React.SetStateAction<CollectionMethodResponse[]>>
  setSelectedCollectionMethod: React.Dispatch<React.SetStateAction<MasterLookupResponse | null>>
  setCollectionForm: React.Dispatch<React.SetStateAction<TCollectionForm>>
  onSwitchToMilkCollections: () => void
}

export function useFarmerCrud<TCollectionForm extends CollectionFormForFarmerSync>({
  token,
  branchUuid,
  nextFarmerCode,
  milkTypes,
  paymentCycles,
  farmerRateCharts,
  runAction,
  setError,
  setFarmers,
  setMilkRateCharts,
  setCollectionMethods,
  setSelectedCollectionMethod,
  setCollectionForm,
  onSwitchToMilkCollections,
}: UseFarmerCrudParams<TCollectionForm>) {
  const [editingFarmerUuid, setEditingFarmerUuid] = useState('')
  const [selectedFarmerRateChartUuid, setSelectedFarmerRateChartUuid] = useState('')
  const [farmerMappedFieldError, setFarmerMappedFieldError] = useState('')

  const [farmerForm, setFarmerForm] = useState<CreateFarmerRequest>({
    branchUuid,
    farmerCode: nextFarmerCode,
    farmerName: '',
    mobileNo: '',
    alternateMobileNo: '',
    email: '',
    address: '',
    village: '',
    taluka: '',
    district: '',
    state: '',
    pincode: '',
    aadharNo: '',
    panNo: '',
    photoUrl: '',
    remarks: '',
    milkTypeUuid: '',
    milkRateChartUuid: '',
    collectionMethodUuid: '',
    paymentCycleUuid: '',
    rateCategoryUuid: '',
    configEffectiveFrom: toInputDate(new Date()),
  })

  useEffect(() => {
    if (!selectedFarmerRateChartUuid) {
      setFarmerForm((prev) => ({
        ...prev,
        milkRateChartUuid: '',
        rateCategoryUuid: '',
        collectionMethodUuid: '',
      }))
      return
    }

    const selected = farmerRateCharts.find((item) => item.uuid === selectedFarmerRateChartUuid)
    if (!selected) {
      setFarmerForm((prev) => ({
        ...prev,
        milkRateChartUuid: '',
        rateCategoryUuid: '',
        collectionMethodUuid: '',
      }))
      return
    }

    setFarmerForm((prev) => ({
      ...prev,
      milkRateChartUuid: selected.uuid,
      rateCategoryUuid: selected.rateCategoryUuid,
      collectionMethodUuid: selected.collectionMethodUuid,
    }))
    setFarmerMappedFieldError('')
  }, [farmerRateCharts, selectedFarmerRateChartUuid])

  useEffect(() => {
    if (!Array.isArray(paymentCycles) || paymentCycles.length === 0) return

    const weeklyPaymentCycle = findLookupByLabel(paymentCycles, 'weekly')
    const targetPaymentCycleUuid = weeklyPaymentCycle?.uuid || paymentCycles[0]?.uuid || ''

    if (!targetPaymentCycleUuid) return

    setFarmerForm((prev) => {
      if (prev.paymentCycleUuid) return prev
      return {
        ...prev,
        paymentCycleUuid: targetPaymentCycleUuid,
      }
    })
  }, [paymentCycles])

  useEffect(() => {
    if (farmerForm.milkTypeUuid) return
    if (!Array.isArray(milkTypes) || milkTypes.length === 0) return

    const buffaloMilk = findLookupByLabel(milkTypes, 'buffalo milk')
    if (!buffaloMilk) return

    setFarmerForm((prev) => {
      if (prev.milkTypeUuid) return prev
      return {
        ...prev,
        milkTypeUuid: buffaloMilk.uuid,
      }
    })
  }, [farmerForm.milkTypeUuid, milkTypes])

  const resetFarmerForm = useCallback(() => {
    setFarmerForm({
      branchUuid,
      farmerCode: nextFarmerCode,
      farmerName: '',
      mobileNo: '',
      alternateMobileNo: '',
      email: '',
      address: '',
      village: '',
      taluka: '',
      district: '',
      state: '',
      pincode: '',
      aadharNo: '',
      panNo: '',
      photoUrl: '',
      remarks: '',
      milkTypeUuid: '',
      milkRateChartUuid: '',
      collectionMethodUuid: '',
      paymentCycleUuid: '',
      rateCategoryUuid: '',
      configEffectiveFrom: toInputDate(new Date()),
    })
  }, [branchUuid, nextFarmerCode])

  const onCreateFarmer = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!token) return
      setFarmerMappedFieldError('')

      const targetBranchUuid = (branchUuid || farmerForm.branchUuid || '').trim()
      const farmerName = farmerForm.farmerName.trim()
      const village = farmerForm.village.trim()
      const mobileNo = farmerForm.mobileNo.trim()
      const alternateMobileNo = farmerForm.alternateMobileNo.trim()
      const email = farmerForm.email.trim().toLowerCase()
      const pincode = farmerForm.pincode.trim()
      const aadharNo = farmerForm.aadharNo.trim()
      const panNo = farmerForm.panNo.trim().toUpperCase()
      const photoUrl = farmerForm.photoUrl.trim()

      if (!targetBranchUuid || !isUuid(targetBranchUuid)) {
        setError('Valid branch UUID is required for farmer creation.')
        return
      }

      if (!farmerName) {
        setError('Farmer name is required.')
        return
      }

      if (!farmerForm.milkTypeUuid || !isUuid(farmerForm.milkTypeUuid)) {
        setError('Select a valid Milk Type for farmer configuration.')
        return
      }

      if (!farmerForm.paymentCycleUuid.trim()) {
        setError('Select a Payment Cycle for farmer configuration.')
        return
      }

      if (
        !selectedFarmerRateChartUuid ||
        !isUuid(selectedFarmerRateChartUuid) ||
        !farmerForm.milkRateChartUuid ||
        !isUuid(farmerForm.milkRateChartUuid) ||
        !farmerForm.collectionMethodUuid ||
        !isUuid(farmerForm.collectionMethodUuid) ||
        !farmerForm.rateCategoryUuid ||
        !isUuid(farmerForm.rateCategoryUuid)
      ) {
        setFarmerMappedFieldError(
          'Select a valid Rate Category Source so Collection Method and Rate Category can be mapped.',
        )
        return
      }

      if (!farmerForm.configEffectiveFrom.trim()) {
        setError('Configuration effective from date is required.')
        return
      }

      if (!village) {
        setError('Village is required.')
        return
      }

      if (!isTenDigitMobile(mobileNo)) {
        setError('Mobile number must be a valid 10-digit Indian mobile number.')
        return
      }

      if (alternateMobileNo && !isTenDigitMobile(alternateMobileNo)) {
        setError('Alternate mobile number must be a valid 10-digit Indian mobile number.')
        return
      }

      if (alternateMobileNo && alternateMobileNo === mobileNo) {
        setError('Alternate mobile number cannot be same as mobile number.')
        return
      }

      if (email && !isValidEmail(email)) {
        setError('Enter a valid email address.')
        return
      }

      if (pincode && !isValidPincode(pincode)) {
        setError('Pincode must be exactly 6 digits.')
        return
      }

      if (aadharNo && !isValidAadhar(aadharNo)) {
        setError('Aadhar number must be exactly 12 digits.')
        return
      }

      if (panNo && !isValidPan(panNo)) {
        setError('PAN number must be in format AAAAA9999A.')
        return
      }

      if (photoUrl) {
        try {
          const parsed = new URL(photoUrl)
          if (!/^https?:$/.test(parsed.protocol)) {
            setError('Photo URL must start with http:// or https://.')
            return
          }
        } catch {
          setError('Photo URL is not valid.')
          return
        }
      }

      const saveAction = editingFarmerUuid
        ? () =>
            api.updateFarmer(token, editingFarmerUuid, {
              ...farmerForm,
              branchUuid: targetBranchUuid,
              farmerName,
              village,
              mobileNo,
              alternateMobileNo,
              email,
              pincode,
              aadharNo,
              panNo,
              photoUrl,
              address: farmerForm.address.trim(),
              taluka: farmerForm.taluka.trim(),
              district: farmerForm.district.trim(),
              state: farmerForm.state.trim(),
              remarks: farmerForm.remarks.trim(),
              milkTypeUuid: farmerForm.milkTypeUuid,
              milkRateChartUuid: farmerForm.milkRateChartUuid,
              collectionMethodUuid: farmerForm.collectionMethodUuid,
              paymentCycleUuid: farmerForm.paymentCycleUuid,
              rateCategoryUuid: farmerForm.rateCategoryUuid,
              configEffectiveFrom: farmerForm.configEffectiveFrom,
            })
        : () =>
            api.createFarmer(token, {
              ...farmerForm,
              branchUuid: targetBranchUuid,
              farmerName,
              village,
              mobileNo,
              alternateMobileNo,
              email,
              pincode,
              aadharNo,
              panNo,
              photoUrl,
              address: farmerForm.address.trim(),
              taluka: farmerForm.taluka.trim(),
              district: farmerForm.district.trim(),
              state: farmerForm.state.trim(),
              remarks: farmerForm.remarks.trim(),
              milkTypeUuid: farmerForm.milkTypeUuid,
              milkRateChartUuid: farmerForm.milkRateChartUuid,
              collectionMethodUuid: farmerForm.collectionMethodUuid,
              paymentCycleUuid: farmerForm.paymentCycleUuid,
              rateCategoryUuid: farmerForm.rateCategoryUuid,
              configEffectiveFrom: farmerForm.configEffectiveFrom,
            })

      const created = await runAction(
        saveAction,
        editingFarmerUuid ? 'Farmer updated successfully.' : 'Farmer created successfully.',
      )
      if (!created) return

      setFarmers((prev) => {
        if (editingFarmerUuid) {
          return prev.map((item) => (item.uuid === editingFarmerUuid ? created : item))
        }
        return [created, ...(Array.isArray(prev) ? prev : [])]
      })

      resetFarmerForm()
      setSelectedFarmerRateChartUuid('')
      setEditingFarmerUuid('')

      try {
        const [refreshedFarmers, refreshedCharts, refreshedMethods] = await Promise.all([
          api.searchFarmers(token),
          api.getMilkRateCharts(token),
          api.getCollectionMethods(token),
        ])

        const farmerList = Array.isArray(refreshedFarmers)
          ? refreshedFarmers
          : Array.isArray(refreshedFarmers.content)
            ? refreshedFarmers.content
            : []

        setFarmers(farmerList)
        setMilkRateCharts(refreshedCharts)
        setCollectionMethods(refreshedMethods)

        const createdFarmer = farmerList.find((item) => item.uuid === created.uuid) || created
        const selectedChart = createdFarmer.milkRateChartUuid
          ? refreshedCharts.find((chart) => chart.uuid === createdFarmer.milkRateChartUuid) || null
          : null
        const selectedMethod = selectedChart?.collectionMethodUuid
          ? refreshedMethods.find((method) => method.uuid === selectedChart.collectionMethodUuid) || null
          : null
        const selectedRateFromDetails = roundToTwo(selectedChart?.details[0]?.rate ?? 0)

        setSelectedCollectionMethod(selectedMethod)
        setCollectionForm((prev) => ({
          ...prev,
          farmerUuid: createdFarmer.uuid,
          quantity: 0,
          fat: 0,
          snf: 0,
          mava: 0,
          rate: selectedRateFromDetails,
        }))

        onSwitchToMilkCollections()
      } catch {
        onSwitchToMilkCollections()
        setCollectionForm((prev) => ({
          ...prev,
          farmerUuid: created.uuid,
        }))
      }
    },
    [
      branchUuid,
      editingFarmerUuid,
      farmerForm,
      onSwitchToMilkCollections,
      resetFarmerForm,
      runAction,
      selectedFarmerRateChartUuid,
      setCollectionForm,
      setCollectionMethods,
      setError,
      setFarmers,
      setMilkRateCharts,
      setSelectedCollectionMethod,
      token,
    ],
  )

  const onEditFarmer = useCallback(
    (farmer: FarmerResponse) => {
      setEditingFarmerUuid(farmer.uuid)
      setFarmerMappedFieldError('')

      const chartUuid = farmer.milkRateChartUuid || ''
      setSelectedFarmerRateChartUuid(chartUuid)

      setFarmerForm((prev) => ({
        ...prev,
        branchUuid: farmer.branchUuid || branchUuid || prev.branchUuid,
        farmerCode: farmer.farmerCode || prev.farmerCode,
        farmerName: farmer.farmerName || '',
        mobileNo: farmer.mobileNo || '',
        alternateMobileNo: farmer.alternateMobileNo || '',
        email: farmer.email || '',
        address: farmer.address || '',
        village: farmer.village || '',
        taluka: farmer.taluka || '',
        district: farmer.district || '',
        state: farmer.state || '',
        pincode: farmer.pincode || '',
        aadharNo: farmer.aadharNo || '',
        panNo: farmer.panNo || '',
        photoUrl: farmer.photoUrl || '',
        remarks: farmer.remarks || '',
        milkTypeUuid: farmer.milkTypeUuid || prev.milkTypeUuid,
        milkRateChartUuid: chartUuid,
        collectionMethodUuid: farmer.collectionMethodUuid || prev.collectionMethodUuid,
        paymentCycleUuid: farmer.paymentCycleUuid || prev.paymentCycleUuid,
        rateCategoryUuid: farmer.rateCategoryUuid || prev.rateCategoryUuid,
        configEffectiveFrom: farmer.configEffectiveFrom || prev.configEffectiveFrom,
      }))
    },
    [branchUuid],
  )

  const onCancelFarmerEdit = useCallback(() => {
    setEditingFarmerUuid('')
    setFarmerMappedFieldError('')
    setSelectedFarmerRateChartUuid('')
    resetFarmerForm()
  }, [resetFarmerForm])

  const onDeleteFarmer = useCallback(
    async (farmer: FarmerResponse) => {
      if (!token) return

      const confirmed = window.confirm(`Delete farmer ${farmer.farmerName} (${farmer.farmerCode})?`)
      if (!confirmed) return

      const deleted = await runAction(async () => {
        await api.deleteFarmer(token, farmer.uuid)
        return true
      }, 'Farmer deleted successfully.')

      if (!deleted) return

      setFarmers((prev) => prev.filter((item) => item.uuid !== farmer.uuid))

      if (editingFarmerUuid === farmer.uuid) {
        onCancelFarmerEdit()
      }
    },
    [editingFarmerUuid, onCancelFarmerEdit, runAction, setFarmers, token],
  )

  return {
    farmerForm,
    setFarmerForm,
    editingFarmerUuid,
    farmerMappedFieldError,
    setFarmerMappedFieldError,
    selectedFarmerRateChartUuid,
    setSelectedFarmerRateChartUuid,
    onCreateFarmer,
    onEditFarmer,
    onCancelFarmerEdit,
    onDeleteFarmer,
  }
}
