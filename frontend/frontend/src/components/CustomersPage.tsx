import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { CustomerResponse } from '../types/api'

type CustomerFormState = {
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

type CustomersPageProps = {
  busy: boolean
  customers: CustomerResponse[]
  branchDisplay: string
  customerForm: CustomerFormState
  setCustomerForm: Dispatch<SetStateAction<CustomerFormState>>
  loadCustomers: () => void | Promise<void>
  onCreateCustomer: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
}

export function CustomersPage({
  busy,
  customers,
  branchDisplay,
  customerForm,
  setCustomerForm,
  loadCustomers,
  onCreateCustomer,
}: CustomersPageProps) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Customers</h2>
        <button type="button" onClick={loadCustomers} disabled={busy}>
          Reload
        </button>
      </div>

      <form className="form two-col customer-form" onSubmit={onCreateCustomer}>
        <label>
          Branch
          <input required value={branchDisplay} readOnly />
        </label>
        <label>
          Customer name
          <input
            required
            value={customerForm.customerName}
            onChange={(event) => setCustomerForm((prev) => ({ ...prev, customerName: event.target.value }))}
          />
        </label>
        <label>
          Mobile
          <input
            required
            value={customerForm.mobileNo}
            onChange={(event) => setCustomerForm((prev) => ({ ...prev, mobileNo: event.target.value }))}
          />
        </label>
        <label>
          City
          <input
            value={customerForm.city}
            onChange={(event) => setCustomerForm((prev) => ({ ...prev, city: event.target.value }))}
          />
        </label>
        <label>
          Credit limit
          <input
            type="number"
            step="0.01"
            value={customerForm.creditLimit}
            onChange={(event) => setCustomerForm((prev) => ({ ...prev, creditLimit: Number(event.target.value) }))}
          />
        </label>
        <label>
          Opening balance
          <input
            type="number"
            step="0.01"
            value={customerForm.openingBalance}
            onChange={(event) =>
              setCustomerForm((prev) => ({ ...prev, openingBalance: Number(event.target.value) }))
            }
          />
        </label>
        <button type="submit" disabled={busy}>
          Create customer
        </button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>City</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((item) => (
              <tr key={item.uuid}>
                <td>{item.customerCode}</td>
                <td>{item.customerName}</td>
                <td>{item.mobileNo}</td>
                <td>{item.city ?? '-'}</td>
                <td>{item.currentBalance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
