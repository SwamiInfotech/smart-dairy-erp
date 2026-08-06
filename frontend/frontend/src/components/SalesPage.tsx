import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type {
  CreateSalesInvoiceItemRequest,
  CustomerResponse,
  PaymentMode,
  ProductResponse,
  SalesInvoiceResponse,
} from '../types/api'
import { buildCustomerLookupLabel } from '../lib/uiHelpers'

type SalesFormState = {
  branchUuid: string
  invoiceDate: string
  customerUuid: string
  paymentMode: PaymentMode
  discountAmount: number
  remarks: string
  items: CreateSalesInvoiceItemRequest[]
}

type SalesPageProps = {
  busy: boolean
  branchDisplay: string
  salesForm: SalesFormState
  setSalesForm: Dispatch<SetStateAction<SalesFormState>>
  salesCustomerInput: string
  onSalesCustomerInputChange: (value: string) => void
  customers: CustomerResponse[]
  products: ProductResponse[]
  paymentModes: PaymentMode[]
  sales: SalesInvoiceResponse[]
  loadSales: () => void | Promise<void>
  onCreateSales: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  addSalesItemRow: () => void
  updateSalesItem: (index: number, field: keyof CreateSalesInvoiceItemRequest, value: string) => void
}

export function SalesPage({
  busy,
  branchDisplay,
  salesForm,
  setSalesForm,
  salesCustomerInput,
  onSalesCustomerInputChange,
  customers,
  products,
  paymentModes,
  sales,
  loadSales,
  onCreateSales,
  addSalesItemRow,
  updateSalesItem,
}: SalesPageProps) {
  const activeProducts = products.filter((product) => product.active)

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Sales Invoices</h2>
        <button type="button" onClick={loadSales} disabled={busy}>
          Reload
        </button>
      </div>

      <form className="form two-col sales-form" onSubmit={onCreateSales}>
        <label>
          Branch
          <input required value={branchDisplay} readOnly />
        </label>
        <label>
          Invoice date
          <input
            type="date"
            value={salesForm.invoiceDate}
            onChange={(event) => setSalesForm((prev) => ({ ...prev, invoiceDate: event.target.value }))}
          />
        </label>
        <label>
          Customer
          <input
            value={salesCustomerInput}
            onChange={(event) => onSalesCustomerInputChange(event.target.value)}
            onBlur={(event) => onSalesCustomerInputChange(event.target.value)}
            placeholder="Search by customer name or code"
            list="sales-customers"
          />
          <datalist id="sales-customers">
            {customers.map((customer) => (
              <option key={customer.uuid} value={buildCustomerLookupLabel(customer)} />
            ))}
          </datalist>
        </label>

        <label>
          Payment mode
          <select
            value={salesForm.paymentMode}
            onChange={(event) =>
              setSalesForm((prev) => ({ ...prev, paymentMode: event.target.value as PaymentMode }))
            }
          >
            {paymentModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </label>

        <label>
          Discount
          <input
            type="number"
            step="0.01"
            value={salesForm.discountAmount}
            onChange={(event) =>
              setSalesForm((prev) => ({ ...prev, discountAmount: Number(event.target.value) }))
            }
          />
        </label>
        <label>
          Remarks
          <input
            value={salesForm.remarks}
            onChange={(event) => setSalesForm((prev) => ({ ...prev, remarks: event.target.value }))}
          />
        </label>

        <div className="items-box">
          <div className="items-head">
            <h3>Invoice Items</h3>
            <button type="button" onClick={addSalesItemRow}>
              Add row
            </button>
          </div>
          {salesForm.items.map((item, index) => (
            <div key={`${item.productUuid}-${index}`} className="item-row">
              <select
                value={item.productUuid}
                onChange={(event) => updateSalesItem(index, 'productUuid', event.target.value)}
              >
                <option value="">Select product</option>
                {activeProducts.map((product) => (
                  <option key={product.uuid} value={product.uuid}>
                    {product.productName}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.001"
                value={item.quantity}
                onChange={(event) => updateSalesItem(index, 'quantity', event.target.value)}
                placeholder="Qty"
              />
              <input
                type="number"
                step="0.01"
                value={item.unitPrice}
                onChange={(event) => updateSalesItem(index, 'unitPrice', event.target.value)}
                placeholder="Unit price"
              />
            </div>
          ))}
        </div>

        <button type="submit" disabled={busy}>
          Create invoice
        </button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Net Amount</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((item) => (
              <tr key={item.uuid}>
                <td>{item.invoiceNo}</td>
                <td>{item.invoiceDate}</td>
                <td>{item.customerName}</td>
                <td>{item.status}</td>
                <td>{item.netAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
