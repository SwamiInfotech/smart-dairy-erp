import { useState } from 'react'
import { toInputDate, toInputTime } from '../lib/appCoreUtils'
import { createEmptyMilkRateDetail } from '../lib/uiHelpers'
import type {
  CreateMilkRateChartRequest,
  CreateSalesInvoiceItemRequest,
  CreateTenantRequest,
  MasterLookupResponse,
  PaymentMode,
} from '../types/api'

export function useAppFormState(initialBranchUuid: string, nextCollectionNo: string) {
  const [productForm, setProductForm] = useState<{
    productCode: string
    productName: string
    productType: 'RAW_MILK' | 'FINISHED_PRODUCT'
    unitType: 'LITER' | 'KILOGRAM' | 'GRAM' | 'PIECE'
    description: string
    purchasePrice: number
    sellingPrice: number
    minimumStock: number
  }>({
    productCode: '',
    productName: '',
    productType: 'FINISHED_PRODUCT',
    unitType: 'LITER',
    description: '',
    purchasePrice: 0,
    sellingPrice: 0,
    minimumStock: 0,
  })

  const [customerForm, setCustomerForm] = useState({
    branchUuid: initialBranchUuid,
    customerName: '',
    mobileNo: '',
    alternateMobileNo: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNo: '',
    creditLimit: 0,
    openingBalance: 0,
  })

  const [tenantForm, setTenantForm] = useState<CreateTenantRequest>({
    code: '',
    name: '',
  })
  const [editingTenantUuid, setEditingTenantUuid] = useState('')

  const [collectionForm, setCollectionForm] = useState({
    collectionNo: nextCollectionNo,
    farmerUuid: '',
    shiftUuid: '',
    milkTypeUuid: '',
    collectionDate: toInputDate(new Date()),
    collectionTime: toInputTime(new Date()),
    quantity: 0,
    rate: 0,
    fat: 0,
    snf: null as number | null,
    mava: 0,
    remarks: '',
  })
  const [selectedCollectionMethod, setSelectedCollectionMethod] = useState<MasterLookupResponse | null>(null)

  const [salesForm, setSalesForm] = useState({
    branchUuid: initialBranchUuid,
    invoiceDate: toInputDate(new Date()),
    customerUuid: '',
    paymentMode: 'CASH' as PaymentMode,
    discountAmount: 0,
    remarks: '',
    items: [{ productUuid: '', quantity: 1, unitPrice: 0 }] as CreateSalesInvoiceItemRequest[],
  })

  const [milkRateForm, setMilkRateForm] = useState<CreateMilkRateChartRequest>({
    branchUuid: initialBranchUuid,
    rateCategoryUuid: '',
    collectionMethodUuid: '',
    chartName: '',
    effectiveFrom: toInputDate(new Date()),
    effectiveTo: '',
    remarks: '',
    details: [createEmptyMilkRateDetail()],
  })

  return {
    productForm,
    setProductForm,
    customerForm,
    setCustomerForm,
    tenantForm,
    setTenantForm,
    editingTenantUuid,
    setEditingTenantUuid,
    collectionForm,
    setCollectionForm,
    selectedCollectionMethod,
    setSelectedCollectionMethod,
    salesForm,
    setSalesForm,
    milkRateForm,
    setMilkRateForm,
  }
}
