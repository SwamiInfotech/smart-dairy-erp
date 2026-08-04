import type { FormEvent } from 'react'
import { useCallback } from 'react'
import { api } from '../lib/api'
import { resolveCustomerSelection } from '../lib/uiHelpers'
import type {
  CreateSalesInvoiceItemRequest,
  CustomerResponse,
  ProductResponse,
  SalesInvoiceResponse,
  TenantResponse,
  CreateTenantRequest,
} from '../types/api'

type ProductForm = {
  productCode: string
  productName: string
  productType: 'RAW_MILK' | 'FINISHED_PRODUCT'
  unitType: 'LITER' | 'KILOGRAM' | 'GRAM' | 'PIECE'
  description: string
  purchasePrice: number
  sellingPrice: number
  minimumStock: number
}

type CustomerForm = {
  branchUuid: string
  customerName: string
  mobileNo: string
  alternateMobileNo: string
  email: string
  address: string
  city: string
  state: string
  pincode: string
  gstNo: string
  creditLimit: number
  openingBalance: number
}

type SalesForm = {
  branchUuid: string
  invoiceDate: string
  customerUuid: string
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT'
  discountAmount: number
  remarks: string
  items: CreateSalesInvoiceItemRequest[]
}

type UseCommercialCrudParams = {
  token: string
  branchUuid: string
  productForm: ProductForm
  customerForm: CustomerForm
  tenantForm: CreateTenantRequest
  editingTenantUuid: string
  salesForm: SalesForm
  salesCustomerInput: string
  customers: CustomerResponse[]
  runAction: <T>(action: () => Promise<T>, successMessage?: string) => Promise<T | null>
  setError: React.Dispatch<React.SetStateAction<string>>
  setProducts: React.Dispatch<React.SetStateAction<ProductResponse[]>>
  setProductForm: React.Dispatch<React.SetStateAction<ProductForm>>
  setCustomers: React.Dispatch<React.SetStateAction<CustomerResponse[]>>
  setTenants: React.Dispatch<React.SetStateAction<TenantResponse[]>>
  setTenantForm: React.Dispatch<React.SetStateAction<CreateTenantRequest>>
  setEditingTenantUuid: React.Dispatch<React.SetStateAction<string>>
  setSales: React.Dispatch<React.SetStateAction<SalesInvoiceResponse[]>>
  setSalesForm: React.Dispatch<React.SetStateAction<SalesForm>>
}

export function useCommercialCrud({
  token,
  branchUuid,
  productForm,
  customerForm,
  tenantForm,
  editingTenantUuid,
  salesForm,
  salesCustomerInput,
  customers,
  runAction,
  setError,
  setProducts,
  setProductForm,
  setCustomers,
  setTenants,
  setTenantForm,
  setEditingTenantUuid,
  setSales,
  setSalesForm,
}: UseCommercialCrudParams) {
  const onCreateProduct = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!token) return
      const created = await runAction(
        () => api.createProduct(token, productForm),
        'Product created successfully.',
      )
      if (!created) return
      setProducts((prev) => [created, ...prev])
      setProductForm({
        productCode: '',
        productName: '',
        productType: 'FINISHED_PRODUCT',
        unitType: 'LITER',
        description: '',
        purchasePrice: 0,
        sellingPrice: 0,
        minimumStock: 0,
      })
    },
    [productForm, runAction, setProductForm, setProducts, token],
  )

  const onCreateCustomer = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!token) return
      const created = await runAction(
        () =>
          api.createCustomer(token, {
            ...customerForm,
            branchUuid: branchUuid || customerForm.branchUuid,
          }),
        'Customer created successfully.',
      )
      if (!created) return
      setCustomers((prev) => [created, ...prev])
    },
    [branchUuid, customerForm, runAction, setCustomers, token],
  )

  const onSubmitTenant = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!token) return

      const payload: CreateTenantRequest = {
        code: tenantForm.code.trim(),
        name: tenantForm.name.trim(),
      }

      if (!payload.code || !payload.name) {
        setError('Tenant code and name are required.')
        return
      }

      if (editingTenantUuid) {
        const updated = await runAction(
          () => api.updateTenant(token, editingTenantUuid, payload),
          'Tenant updated successfully.',
        )

        if (!updated) {
          setError('Tenant update endpoint is not available yet on backend (Phase 2).')
          return
        }

        setTenants((prev) => prev.map((item) => (item.uuid === updated.uuid ? updated : item)))
        setEditingTenantUuid('')
        setTenantForm({ code: '', name: '' })
        return
      }

      const created = await runAction(() => api.createTenant(token, payload), 'Tenant created successfully.')
      if (!created) return
      setTenants((prev) => [created, ...prev])
      setTenantForm({ code: '', name: '' })
    },
    [editingTenantUuid, runAction, setEditingTenantUuid, setError, setTenantForm, setTenants, tenantForm, token],
  )

  const onEditTenant = useCallback(
    (tenant: TenantResponse) => {
      setEditingTenantUuid(tenant.uuid)
      setTenantForm({
        code: tenant.code,
        name: tenant.name,
      })
    },
    [setEditingTenantUuid, setTenantForm],
  )

  const onCancelTenantEdit = useCallback(() => {
    setEditingTenantUuid('')
    setTenantForm({ code: '', name: '' })
    setError('')
  }, [setEditingTenantUuid, setError, setTenantForm])

  const onCreateSales = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!token) return

      const selectedCustomer = resolveCustomerSelection(salesCustomerInput, customers)
      if (!selectedCustomer) {
        setError('Select a valid customer from the list before creating the invoice.')
        return
      }

      const created = await runAction(
        () =>
          api.createSalesInvoice(token, {
            ...salesForm,
            customerUuid: selectedCustomer.uuid,
            branchUuid: branchUuid || salesForm.branchUuid,
            items: salesForm.items.filter((item) => item.productUuid.trim().length > 0),
          }),
        'Sales invoice created successfully.',
      )
      if (!created) return
      setSales((prev) => [created, ...prev])
    },
    [branchUuid, customers, runAction, salesCustomerInput, salesForm, setError, setSales, token],
  )

  const updateSalesItem = useCallback(
    (index: number, field: keyof CreateSalesInvoiceItemRequest, value: string) => {
      setSalesForm((prev) => {
        const items = [...prev.items]
        items[index] = {
          ...items[index],
          [field]: field === 'productUuid' ? value : Number(value),
        }
        return {
          ...prev,
          items,
        }
      })
    },
    [setSalesForm],
  )

  const addSalesItemRow = useCallback(() => {
    setSalesForm((prev) => ({
      ...prev,
      items: [...prev.items, { productUuid: '', quantity: 1, unitPrice: 0 }],
    }))
  }, [setSalesForm])

  return {
    onCreateProduct,
    onCreateCustomer,
    onSubmitTenant,
    onEditTenant,
    onCancelTenantEdit,
    onCreateSales,
    updateSalesItem,
    addSalesItemRow,
  }
}
