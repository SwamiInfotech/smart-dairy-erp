import { useCallback, useState } from 'react'
import { api } from '../lib/api'
import type {
  CollectionMethodResponse,
  CreateCollectionMethodRequest,
  CreatePaymentCycleRequest,
  CreateRateCategoryRequest,
  CreateShiftRequest,
  PaymentCycleResponse,
  RateCategoryResponse,
  ShiftResponse,
} from '../types/api'

type UseMasterDataCrudParams = {
  token: string
  runAction: <T>(action: () => Promise<T>, successMessage?: string) => Promise<T | null>
  setError: React.Dispatch<React.SetStateAction<string>>
  setCollectionMethods: React.Dispatch<React.SetStateAction<CollectionMethodResponse[]>>
  setPaymentCycles: React.Dispatch<React.SetStateAction<PaymentCycleResponse[]>>
  setShifts: React.Dispatch<React.SetStateAction<ShiftResponse[]>>
  setRateCategories: React.Dispatch<React.SetStateAction<RateCategoryResponse[]>>
}

export function useMasterDataCrud({
  token,
  runAction,
  setError,
  setCollectionMethods,
  setPaymentCycles,
  setShifts,
  setRateCategories,
}: UseMasterDataCrudParams) {
  const [shiftForm, setShiftForm] = useState<CreateShiftRequest>({
    code: '',
    name: '',
    description: '',
    displayOrder: 0,
  })

  const [rateCategoryForm, setRateCategoryForm] = useState<CreateRateCategoryRequest>({
    code: '',
    name: '',
    description: '',
  })
  const [editingRateCategoryUuid, setEditingRateCategoryUuid] = useState('')

  const [collectionMethodForm, setCollectionMethodForm] = useState<CreateCollectionMethodRequest>({
    code: '',
    name: '',
    description: '',
  })
  const [editingCollectionMethodUuid, setEditingCollectionMethodUuid] = useState('')

  const [paymentCycleForm, setPaymentCycleForm] = useState<CreatePaymentCycleRequest>({
    code: '',
    name: '',
    description: '',
  })
  const [editingPaymentCycleUuid, setEditingPaymentCycleUuid] = useState('')

  const resetCollectionMethodForm = useCallback(() => {
    setCollectionMethodForm({
      code: '',
      name: '',
      description: '',
    })
    setEditingCollectionMethodUuid('')
  }, [])

  const onEditCollectionMethod = useCallback((method: CollectionMethodResponse) => {
    setEditingCollectionMethodUuid(method.uuid)
    setCollectionMethodForm({
      code: method.code,
      name: method.name,
      description: method.description || '',
      displayOrder: typeof method.displayOrder === 'number' ? method.displayOrder : undefined,
    })
  }, [])

  const onCancelCollectionMethodEdit = useCallback(() => {
    resetCollectionMethodForm()
    setError('')
  }, [resetCollectionMethodForm, setError])

  const resetPaymentCycleForm = useCallback(() => {
    setPaymentCycleForm({
      code: '',
      name: '',
      description: '',
    })
    setEditingPaymentCycleUuid('')
  }, [])

  const onEditPaymentCycle = useCallback((cycle: PaymentCycleResponse) => {
    setEditingPaymentCycleUuid(cycle.uuid)
    setPaymentCycleForm({
      code: cycle.code,
      name: cycle.name,
      description: cycle.description || '',
      displayOrder: typeof cycle.displayOrder === 'number' ? cycle.displayOrder : undefined,
    })
  }, [])

  const onCancelPaymentCycleEdit = useCallback(() => {
    resetPaymentCycleForm()
    setError('')
  }, [resetPaymentCycleForm, setError])

  const onSubmitCollectionMethod = useCallback(async () => {
    if (!token) return

    const payload: CreateCollectionMethodRequest = {
      code: collectionMethodForm.code.trim(),
      name: collectionMethodForm.name.trim(),
      description: collectionMethodForm.description.trim(),
      displayOrder:
        typeof collectionMethodForm.displayOrder === 'number' && Number.isFinite(collectionMethodForm.displayOrder)
          ? collectionMethodForm.displayOrder
          : undefined,
    }

    if (!payload.code || !payload.name) {
      setError('Collection method code and name are required.')
      return
    }

    if (editingCollectionMethodUuid) {
      const updated = await runAction(
        () => api.updateCollectionMethod(token, editingCollectionMethodUuid, payload),
        'Collection method updated successfully.',
      )
      if (!updated) return

      setCollectionMethods((prev) => prev.map((item) => (item.uuid === editingCollectionMethodUuid ? updated : item)))
      resetCollectionMethodForm()
      return
    }

    const created = await runAction(
      () => api.createCollectionMethod(token, payload),
      'Collection method created successfully.',
    )
    if (!created) return

    setCollectionMethods((prev) => [created, ...prev])
    resetCollectionMethodForm()
  }, [
    collectionMethodForm.code,
    collectionMethodForm.description,
    collectionMethodForm.displayOrder,
    collectionMethodForm.name,
    editingCollectionMethodUuid,
    resetCollectionMethodForm,
    runAction,
    setCollectionMethods,
    setError,
    token,
  ])

  const onDeleteCollectionMethod = useCallback(
    async (method: CollectionMethodResponse) => {
      if (!token) return
      const confirmed = window.confirm(`Delete collection method "${method.name}"?`)
      if (!confirmed) return

      const result = await runAction(
        () => api.deleteCollectionMethod(token, method.uuid),
        'Collection method deleted successfully.',
      )
      if (result === null) return

      setCollectionMethods((prev) => prev.filter((item) => item.uuid !== method.uuid))

      if (editingCollectionMethodUuid === method.uuid) {
        resetCollectionMethodForm()
      }
    },
    [editingCollectionMethodUuid, resetCollectionMethodForm, runAction, setCollectionMethods, token],
  )

  const onSubmitPaymentCycle = useCallback(async () => {
    if (!token) return

    const payload: CreatePaymentCycleRequest = {
      code: paymentCycleForm.code.trim(),
      name: paymentCycleForm.name.trim(),
      description: paymentCycleForm.description.trim(),
      displayOrder:
        typeof paymentCycleForm.displayOrder === 'number' && Number.isFinite(paymentCycleForm.displayOrder)
          ? paymentCycleForm.displayOrder
          : undefined,
    }

    if (!payload.code || !payload.name) {
      setError('Farmer Billing/Payment Cycle code and name are required.')
      return
    }

    if (editingPaymentCycleUuid) {
      const updated = await runAction(
        () => api.updatePaymentCycle(token, editingPaymentCycleUuid, payload),
        'Farmer Billing/Payment Cycle updated successfully.',
      )
      if (!updated) return

      setPaymentCycles((prev) => prev.map((item) => (item.uuid === editingPaymentCycleUuid ? updated : item)))
      resetPaymentCycleForm()
      return
    }

    const created = await runAction(
      () => api.createPaymentCycle(token, payload),
      'Farmer Billing/Payment Cycle created successfully.',
    )
    if (!created) return

    setPaymentCycles((prev) => [created, ...prev])
    resetPaymentCycleForm()
  }, [
    editingPaymentCycleUuid,
    paymentCycleForm.code,
    paymentCycleForm.description,
    paymentCycleForm.displayOrder,
    paymentCycleForm.name,
    resetPaymentCycleForm,
    runAction,
    setError,
    setPaymentCycles,
    token,
  ])

  const onDeletePaymentCycle = useCallback(
    async (cycle: PaymentCycleResponse) => {
      if (!token) return
      const confirmed = window.confirm(`Delete Farmer Billing/Payment Cycle "${cycle.name}"?`)
      if (!confirmed) return

      const result = await runAction(
        () => api.deletePaymentCycle(token, cycle.uuid),
        'Farmer Billing/Payment Cycle deleted successfully.',
      )
      if (result === null) return

      setPaymentCycles((prev) => prev.filter((item) => item.uuid !== cycle.uuid))

      if (editingPaymentCycleUuid === cycle.uuid) {
        resetPaymentCycleForm()
      }
    },
    [editingPaymentCycleUuid, resetPaymentCycleForm, runAction, setPaymentCycles, token],
  )

  const onSubmitShift = useCallback(async () => {
    if (!token) return

    const payload: CreateShiftRequest = {
      code: shiftForm.code.trim(),
      name: shiftForm.name.trim(),
      description: shiftForm.description.trim(),
      displayOrder: Number(shiftForm.displayOrder),
    }

    if (!payload.code || !payload.name) {
      setError('Shift code and name are required.')
      return
    }

    if (!Number.isFinite(payload.displayOrder)) {
      setError('Display order is required for shift.')
      return
    }

    const created = await runAction(
      () => api.createShift(token, payload),
      'Shift created successfully.',
    )
    if (!created) return

    setShifts((prev) => [created, ...prev])
    setShiftForm({
      code: '',
      name: '',
      description: '',
      displayOrder: 0,
    })
  }, [runAction, setError, setShifts, shiftForm.code, shiftForm.description, shiftForm.displayOrder, shiftForm.name, token])

  const resetRateCategoryForm = useCallback(() => {
    setRateCategoryForm({
      code: '',
      name: '',
      description: '',
    })
    setEditingRateCategoryUuid('')
  }, [])

  const onEditRateCategory = useCallback((category: RateCategoryResponse) => {
    setEditingRateCategoryUuid(category.uuid)
    setRateCategoryForm({
      code: category.code,
      name: category.name,
      description: category.description || '',
      displayOrder: typeof category.displayOrder === 'number' ? category.displayOrder : undefined,
    })
  }, [])

  const onCancelRateCategoryEdit = useCallback(() => {
    resetRateCategoryForm()
    setError('')
  }, [resetRateCategoryForm, setError])

  const onSubmitRateCategory = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      if (!token) return

      const payload: CreateRateCategoryRequest = {
        code: rateCategoryForm.code.trim(),
        name: rateCategoryForm.name.trim(),
        description: rateCategoryForm.description.trim(),
        displayOrder:
          typeof rateCategoryForm.displayOrder === 'number' && Number.isFinite(rateCategoryForm.displayOrder)
            ? rateCategoryForm.displayOrder
            : undefined,
      }

      if (!payload.code || !payload.name) {
        setError('Rate category code and name are required.')
        return
      }

      if (editingRateCategoryUuid) {
        const updated = await runAction(
          () => api.updateRateCategory(token, editingRateCategoryUuid, payload),
          'Rate category updated successfully.',
        )
        if (!updated) return

        setRateCategories((prev) => prev.map((item) => (item.uuid === editingRateCategoryUuid ? updated : item)))
        resetRateCategoryForm()
        return
      }

      const created = await runAction(
        () => api.createRateCategory(token, payload),
        'Rate category created successfully.',
      )
      if (!created) return

      setRateCategories((prev) => [created, ...prev])
      resetRateCategoryForm()
    },
    [
      editingRateCategoryUuid,
      rateCategoryForm.code,
      rateCategoryForm.description,
      rateCategoryForm.displayOrder,
      rateCategoryForm.name,
      resetRateCategoryForm,
      runAction,
      setError,
      setRateCategories,
      token,
    ],
  )

  const onDeleteRateCategory = useCallback(
    async (category: RateCategoryResponse) => {
      if (!token) return
      const confirmed = window.confirm(`Delete rate category "${category.name}"?`)
      if (!confirmed) return

      const result = await runAction(
        () => api.deleteRateCategory(token, category.uuid),
        'Rate category deleted successfully.',
      )
      if (result === null) return

      setRateCategories((prev) => prev.filter((item) => item.uuid !== category.uuid))

      if (editingRateCategoryUuid === category.uuid) {
        resetRateCategoryForm()
      }
    },
    [editingRateCategoryUuid, resetRateCategoryForm, runAction, setRateCategories, token],
  )

  return {
    shiftForm,
    setShiftForm,
    rateCategoryForm,
    setRateCategoryForm,
    editingRateCategoryUuid,
    collectionMethodForm,
    setCollectionMethodForm,
    editingCollectionMethodUuid,
    paymentCycleForm,
    setPaymentCycleForm,
    editingPaymentCycleUuid,
    onEditCollectionMethod,
    onCancelCollectionMethodEdit,
    onSubmitCollectionMethod,
    onDeleteCollectionMethod,
    onEditPaymentCycle,
    onCancelPaymentCycleEdit,
    onSubmitPaymentCycle,
    onDeletePaymentCycle,
    onSubmitShift,
    onEditRateCategory,
    onCancelRateCategoryEdit,
    onSubmitRateCategory,
    onDeleteRateCategory,
  }
}
