import { useCallback, useEffect } from 'react'
import { buildCustomerLookupLabel, resolveCustomerSelection } from '../lib/uiHelpers'
import type { CustomerResponse, PaymentMode } from '../types/api'

type SalesFormState = {
  branchUuid: string
  invoiceDate: string
  customerUuid: string
  paymentMode: PaymentMode
  discountAmount: number
  remarks: string
  items: Array<{ productUuid: string; quantity: number; unitPrice: number }>
}

type UseSalesCustomerSelectionParams = {
  customers: CustomerResponse[]
  salesForm: SalesFormState
  setSalesForm: React.Dispatch<React.SetStateAction<SalesFormState>>
  setSalesCustomerInput: React.Dispatch<React.SetStateAction<string>>
}

export function useSalesCustomerSelection({
  customers,
  salesForm,
  setSalesForm,
  setSalesCustomerInput,
}: UseSalesCustomerSelectionParams) {
  useEffect(() => {
    const selectedCustomer = customers.find((item) => item.uuid === salesForm.customerUuid)
    if (selectedCustomer) {
      const label = buildCustomerLookupLabel(selectedCustomer)
      setSalesCustomerInput((prev) => (prev === label ? prev : label))
      return
    }

    if (!salesForm.customerUuid) {
      setSalesCustomerInput((prev) => (prev ? '' : prev))
    }
  }, [customers, salesForm.customerUuid, setSalesCustomerInput])

  const onSalesCustomerInputChange = useCallback(
    (value: string) => {
      setSalesCustomerInput(value)
      const selectedCustomer = resolveCustomerSelection(value, customers)
      setSalesForm((prev) => ({
        ...prev,
        customerUuid: selectedCustomer?.uuid || '',
      }))
    },
    [customers, setSalesCustomerInput, setSalesForm],
  )

  return {
    onSalesCustomerInputChange,
  }
}
