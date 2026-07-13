import { FormEvent, useEffect, useMemo, useState } from 'react'
import { api, clearAuth, getLastLoginAttemptDebug, getSavedAuth, saveAuth } from './lib/api'
import type {
  CreateSalesInvoiceItemRequest,
  CustomerResponse,
  MilkTypeResponse,
  PaymentMode,
  ProductResponse,
  SalesDashboardResponse,
  SalesInvoiceResponse,
} from './types/api'
import './App.css'

type TabKey = 'dashboard' | 'products' | 'customers' | 'milkCollections' | 'sales' | 'farmers'

const PAYMENT_MODES: PaymentMode[] = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CREDIT']

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function App() {
  const initialAuth = useMemo(getSavedAuth, [])

  const [token, setToken] = useState(initialAuth.token)
  const [username, setUsername] = useState(initialAuth.username)
  const [role, setRole] = useState(initialAuth.role)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [loginDebug, setLoginDebug] = useState('')

  const [loginUsername, setLoginUsername] = useState('admin')
  const [loginPassword, setLoginPassword] = useState('admin123')

  const [dashboardRange, setDashboardRange] = useState({
    fromDate: toInputDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)),
    toDate: toInputDate(new Date()),
  })
  const [dashboard, setDashboard] = useState<SalesDashboardResponse | null>(null)

  const [products, setProducts] = useState<ProductResponse[]>([])
  const [customers, setCustomers] = useState<CustomerResponse[]>([])
  const [sales, setSales] = useState<SalesInvoiceResponse[]>([])
  const [collections, setCollections] = useState<
    {
      uuid: string
      collectionNo: string
      farmerName: string
      collectionDate: string
      quantity: number
      grossAmount: number
    }[]
  >([])
  const [milkTypes, setMilkTypes] = useState<MilkTypeResponse[]>([])

  const [productForm, setProductForm] = useState({
    productCode: '',
    productName: '',
    productType: 'FINISHED_PRODUCT' as const,
    unitType: 'LITER' as const,
    description: '',
    purchasePrice: 0,
    sellingPrice: 0,
    minimumStock: 0,
  })

  const [customerForm, setCustomerForm] = useState({
    branchUuid: '',
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

  const [farmerForm, setFarmerForm] = useState({
    branchUuid: '',
    farmerCode: '',
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
  })

  const [collectionForm, setCollectionForm] = useState({
    farmerUuid: '',
    shiftUuid: '',
    milkTypeUuid: '',
    collectionDate: toInputDate(new Date()),
    collectionTime: '07:00',
    quantity: 0,
    fat: 0,
    snf: 0,
    mava: 0,
    remarks: '',
  })

  const [salesForm, setSalesForm] = useState({
    branchUuid: '',
    invoiceDate: toInputDate(new Date()),
    customerUuid: '',
    paymentMode: 'CASH' as PaymentMode,
    discountAmount: 0,
    remarks: '',
    items: [{ productUuid: '', quantity: 1, unitPrice: 0 }] as CreateSalesInvoiceItemRequest[],
  })

  async function runAction<T>(action: () => Promise<T>, successMessage?: string) {
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const result = await action()
      if (successMessage) {
        setSuccess(successMessage)
      }
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error occurred.')
      return null
    } finally {
      setBusy(false)
    }
  }

  async function loadDashboard() {
    if (!token) return
    const result = await runAction(
      () => api.getSalesDashboard(token, dashboardRange.fromDate, dashboardRange.toDate),
      'Dashboard refreshed.',
    )
    if (result) {
      setDashboard(result)
    }
  }

  async function loadProducts() {
    if (!token) return
    const result = await runAction(() => api.searchProducts(token))
    if (result) {
      setProducts(result.content)
    }
  }

  async function loadCustomers() {
    if (!token) return
    const result = await runAction(() => api.searchCustomers(token))
    if (result) {
      setCustomers(result.content)
    }
  }

  async function loadCollections() {
    if (!token) return
    const [collectionPage, types] = await Promise.all([
      runAction(() => api.searchMilkCollections(token)),
      runAction(() => api.getMilkTypes(token)),
    ])

    if (collectionPage) {
      setCollections(collectionPage.content)
    }
    if (types) {
      setMilkTypes(types)
    }
  }

  async function loadSales() {
    if (!token) return
    const result = await runAction(() => api.searchSales(token))
    if (result) {
      setSales(result.content)
    }
  }

  useEffect(() => {
    if (!token) return
    void loadDashboard()
    void loadProducts()
    void loadCustomers()
    void loadCollections()
    void loadSales()
  }, [token])

  async function onLogin(event: FormEvent) {
    event.preventDefault()
    setLoginDebug('')
    const response = await runAction(
      () => api.login(loginUsername.trim(), loginPassword),
      'Login successful.',
    )

    const debug = getLastLoginAttemptDebug()
    if (debug) {
      const statusPart = debug.status ? ` [${debug.status}]` : ''
      const messagePart = debug.message ? ` - ${debug.message}` : ''
      setLoginDebug(
        `Auth attempt: ${debug.endpoint} (${debug.bodyMode.toUpperCase()}) ${
          debug.succeeded ? 'succeeded' : 'failed'
        }${statusPart}${messagePart}`,
      )
    }

    if (!response) return

    saveAuth(response)
    setToken(response.accessToken)
    setUsername(response.username)
    setRole(response.role)
  }

  function onLogout() {
    clearAuth()
    setToken('')
    setUsername('')
    setRole('')
    setDashboard(null)
    setProducts([])
    setCustomers([])
    setCollections([])
    setSales([])
    setError('')
    setSuccess('')
  }

  async function onCreateProduct(event: FormEvent) {
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
  }

  async function onCreateCustomer(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    const created = await runAction(
      () => api.createCustomer(token, customerForm),
      'Customer created successfully.',
    )
    if (!created) return
    setCustomers((prev) => [created, ...prev])
  }

  async function onCreateFarmer(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    const created = await runAction(
      () => api.createFarmer(token, farmerForm),
      'Farmer created successfully.',
    )
    if (!created) return
    setFarmerForm({
      branchUuid: '',
      farmerCode: '',
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
    })
  }

  async function onCreateCollection(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    const created = await runAction(
      () =>
        api.createMilkCollection(token, {
          ...collectionForm,
          fat: collectionForm.fat || null,
          snf: collectionForm.snf || null,
          mava: collectionForm.mava || null,
        }),
      'Milk collection saved successfully.',
    )
    if (!created) return
    setCollections((prev) => [created, ...prev])
  }

  async function onCreateSales(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    const created = await runAction(
      () =>
        api.createSalesInvoice(token, {
          ...salesForm,
          items: salesForm.items.filter((item) => item.productUuid.trim().length > 0),
        }),
      'Sales invoice created successfully.',
    )
    if (!created) return
    setSales((prev) => [created, ...prev])
  }

  function updateSalesItem(index: number, field: keyof CreateSalesInvoiceItemRequest, value: string) {
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
  }

  function addSalesItemRow() {
    setSalesForm((prev) => ({
      ...prev,
      items: [...prev.items, { productUuid: '', quantity: 1, unitPrice: 0 }],
    }))
  }

  return (
    <div className="app-shell">
      {!token ? (
        <div className="login-page">
          <div className="login-card">
            <p className="eyebrow">Smart Dairy ERP</p>
            <h1>Frontend for Backend APIs</h1>
            <p className="subtle">Uses /api/v1/auth/login and JWT bearer token for protected modules.</p>

            <form className="form two-col" onSubmit={onLogin}>
              <label>
                Username
                <input
                  value={loginUsername}
                  onChange={(event) => setLoginUsername(event.target.value)}
                  placeholder="Enter username"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Enter password"
                  required
                />
              </label>

              <button type="submit" disabled={busy}>
                {busy ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            {error && <p className="message error">{error}</p>}
            {loginDebug && <p className="subtle">{loginDebug}</p>}
          </div>
        </div>
      ) : (
        <>
          <header className="topbar">
            <div>
              <p className="eyebrow">Smart Dairy ERP</p>
              <h1>Web Console</h1>
            </div>
            <div className="user-box">
              <p>
                {username} · {role}
              </p>
              <button type="button" onClick={onLogout}>
                Logout
              </button>
            </div>
          </header>

          <nav className="tablist">
            {[
              ['dashboard', 'Dashboard'],
              ['products', 'Products'],
              ['customers', 'Customers'],
              ['milkCollections', 'Milk Collections'],
              ['sales', 'Sales'],
              ['farmers', 'Farmers'],
            ].map(([key, label]) => (
              <button
                type="button"
                key={key}
                className={activeTab === key ? 'tab active' : 'tab'}
                onClick={() => setActiveTab(key as TabKey)}
              >
                {label}
              </button>
            ))}
          </nav>

          {error && <p className="message error">{error}</p>}
          {success && <p className="message success">{success}</p>}

          <main className="panel-grid">
            {activeTab === 'dashboard' && (
              <section className="panel">
                <div className="panel-head">
                  <h2>Sales Dashboard</h2>
                  <button type="button" onClick={loadDashboard} disabled={busy}>
                    Refresh
                  </button>
                </div>

                <form
                  className="form inline"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void loadDashboard()
                  }}
                >
                  <label>
                    From
                    <input
                      type="date"
                      value={dashboardRange.fromDate}
                      onChange={(event) =>
                        setDashboardRange((prev) => ({ ...prev, fromDate: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    To
                    <input
                      type="date"
                      value={dashboardRange.toDate}
                      onChange={(event) =>
                        setDashboardRange((prev) => ({ ...prev, toDate: event.target.value }))
                      }
                    />
                  </label>
                  <button type="submit" disabled={busy}>
                    Apply
                  </button>
                </form>

                <div className="kpi-grid">
                  <article>
                    <p>Total invoices</p>
                    <strong>{dashboard?.totalInvoices ?? 0}</strong>
                  </article>
                  <article>
                    <p>Total sales</p>
                    <strong>{dashboard?.totalSales ?? 0}</strong>
                  </article>
                  <article>
                    <p>Net sales</p>
                    <strong>{dashboard?.netSales ?? 0}</strong>
                  </article>
                  <article>
                    <p>Avg invoice</p>
                    <strong>{dashboard?.averageInvoiceValue ?? 0}</strong>
                  </article>
                </div>
              </section>
            )}

            {activeTab === 'products' && (
              <section className="panel">
                <div className="panel-head">
                  <h2>Products</h2>
                  <button type="button" onClick={loadProducts} disabled={busy}>
                    Reload
                  </button>
                </div>

                <form className="form two-col" onSubmit={onCreateProduct}>
                  <label>
                    Product code
                    <input
                      required
                      value={productForm.productCode}
                      onChange={(event) =>
                        setProductForm((prev) => ({ ...prev, productCode: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Product name
                    <input
                      required
                      value={productForm.productName}
                      onChange={(event) =>
                        setProductForm((prev) => ({ ...prev, productName: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Product type
                    <select
                      value={productForm.productType}
                      onChange={(event) =>
                        setProductForm((prev) => ({
                          ...prev,
                          productType: event.target.value as 'RAW_MILK' | 'FINISHED_PRODUCT',
                        }))
                      }
                    >
                      <option value="RAW_MILK">RAW_MILK</option>
                      <option value="FINISHED_PRODUCT">FINISHED_PRODUCT</option>
                    </select>
                  </label>
                  <label>
                    Unit type
                    <select
                      value={productForm.unitType}
                      onChange={(event) =>
                        setProductForm((prev) => ({
                          ...prev,
                          unitType: event.target.value as 'LITER' | 'KILOGRAM' | 'GRAM' | 'PIECE',
                        }))
                      }
                    >
                      <option value="LITER">LITER</option>
                      <option value="KILOGRAM">KILOGRAM</option>
                      <option value="GRAM">GRAM</option>
                      <option value="PIECE">PIECE</option>
                    </select>
                  </label>
                  <label>
                    Purchase price
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.purchasePrice}
                      onChange={(event) =>
                        setProductForm((prev) => ({ ...prev, purchasePrice: Number(event.target.value) }))
                      }
                    />
                  </label>
                  <label>
                    Selling price
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.sellingPrice}
                      onChange={(event) =>
                        setProductForm((prev) => ({ ...prev, sellingPrice: Number(event.target.value) }))
                      }
                    />
                  </label>
                  <label>
                    Minimum stock
                    <input
                      type="number"
                      step="0.001"
                      value={productForm.minimumStock}
                      onChange={(event) =>
                        setProductForm((prev) => ({ ...prev, minimumStock: Number(event.target.value) }))
                      }
                    />
                  </label>
                  <label>
                    Description
                    <input
                      value={productForm.description}
                      onChange={(event) =>
                        setProductForm((prev) => ({ ...prev, description: event.target.value }))
                      }
                    />
                  </label>
                  <button type="submit" disabled={busy}>
                    Create product
                  </button>
                </form>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Selling</th>
                        <th>Stock min</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((item) => (
                        <tr key={item.uuid}>
                          <td>{item.productCode}</td>
                          <td>{item.productName}</td>
                          <td>{item.productType}</td>
                          <td>{item.sellingPrice}</td>
                          <td>{item.minimumStock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'customers' && (
              <section className="panel">
                <div className="panel-head">
                  <h2>Customers</h2>
                  <button type="button" onClick={loadCustomers} disabled={busy}>
                    Reload
                  </button>
                </div>

                <form className="form two-col" onSubmit={onCreateCustomer}>
                  <label>
                    Branch UUID
                    <input
                      required
                      value={customerForm.branchUuid}
                      onChange={(event) =>
                        setCustomerForm((prev) => ({ ...prev, branchUuid: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Customer name
                    <input
                      required
                      value={customerForm.customerName}
                      onChange={(event) =>
                        setCustomerForm((prev) => ({ ...prev, customerName: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Mobile
                    <input
                      required
                      value={customerForm.mobileNo}
                      onChange={(event) =>
                        setCustomerForm((prev) => ({ ...prev, mobileNo: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    City
                    <input
                      value={customerForm.city}
                      onChange={(event) =>
                        setCustomerForm((prev) => ({ ...prev, city: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Credit limit
                    <input
                      type="number"
                      step="0.01"
                      value={customerForm.creditLimit}
                      onChange={(event) =>
                        setCustomerForm((prev) => ({ ...prev, creditLimit: Number(event.target.value) }))
                      }
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
            )}

            {activeTab === 'milkCollections' && (
              <section className="panel">
                <div className="panel-head">
                  <h2>Milk Collections</h2>
                  <button type="button" onClick={loadCollections} disabled={busy}>
                    Reload
                  </button>
                </div>
                <form className="form two-col" onSubmit={onCreateCollection}>
                  <label>
                    Farmer UUID
                    <input
                      required
                      value={collectionForm.farmerUuid}
                      onChange={(event) =>
                        setCollectionForm((prev) => ({ ...prev, farmerUuid: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Shift UUID
                    <input
                      required
                      value={collectionForm.shiftUuid}
                      onChange={(event) =>
                        setCollectionForm((prev) => ({ ...prev, shiftUuid: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Milk type
                    <select
                      value={collectionForm.milkTypeUuid}
                      onChange={(event) =>
                        setCollectionForm((prev) => ({ ...prev, milkTypeUuid: event.target.value }))
                      }
                    >
                      <option value="">Select milk type</option>
                      {milkTypes.map((item) => (
                        <option key={item.uuid} value={item.uuid}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Collection date
                    <input
                      type="date"
                      value={collectionForm.collectionDate}
                      onChange={(event) =>
                        setCollectionForm((prev) => ({ ...prev, collectionDate: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Collection time
                    <input
                      type="time"
                      value={collectionForm.collectionTime}
                      onChange={(event) =>
                        setCollectionForm((prev) => ({ ...prev, collectionTime: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Quantity
                    <input
                      type="number"
                      step="0.01"
                      value={collectionForm.quantity}
                      onChange={(event) =>
                        setCollectionForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))
                      }
                    />
                  </label>
                  <button type="submit" disabled={busy}>
                    Save collection
                  </button>
                </form>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Collection No</th>
                        <th>Farmer</th>
                        <th>Date</th>
                        <th>Qty</th>
                        <th>Gross</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collections.map((item) => (
                        <tr key={item.uuid}>
                          <td>{item.collectionNo}</td>
                          <td>{item.farmerName}</td>
                          <td>{item.collectionDate}</td>
                          <td>{item.quantity}</td>
                          <td>{item.grossAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'sales' && (
              <section className="panel">
                <div className="panel-head">
                  <h2>Sales Invoices</h2>
                  <button type="button" onClick={loadSales} disabled={busy}>
                    Reload
                  </button>
                </div>

                <form className="form two-col" onSubmit={onCreateSales}>
                  <label>
                    Branch UUID
                    <input
                      required
                      value={salesForm.branchUuid}
                      onChange={(event) =>
                        setSalesForm((prev) => ({ ...prev, branchUuid: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Invoice date
                    <input
                      type="date"
                      value={salesForm.invoiceDate}
                      onChange={(event) =>
                        setSalesForm((prev) => ({ ...prev, invoiceDate: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Customer
                    <select
                      value={salesForm.customerUuid}
                      onChange={(event) =>
                        setSalesForm((prev) => ({ ...prev, customerUuid: event.target.value }))
                      }
                    >
                      <option value="">Select customer</option>
                      {customers.map((item) => (
                        <option key={item.uuid} value={item.uuid}>
                          {item.customerName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Payment mode
                    <select
                      value={salesForm.paymentMode}
                      onChange={(event) =>
                        setSalesForm((prev) => ({ ...prev, paymentMode: event.target.value as PaymentMode }))
                      }
                    >
                      {PAYMENT_MODES.map((mode) => (
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
                      onChange={(event) =>
                        setSalesForm((prev) => ({ ...prev, remarks: event.target.value }))
                      }
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
                          {products.map((product) => (
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
            )}

            {activeTab === 'farmers' && (
              <section className="panel">
                <div className="panel-head">
                  <h2>Create Farmer</h2>
                </div>
                <form className="form two-col" onSubmit={onCreateFarmer}>
                  <label>
                    Branch UUID
                    <input
                      required
                      value={farmerForm.branchUuid}
                      onChange={(event) =>
                        setFarmerForm((prev) => ({ ...prev, branchUuid: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Farmer code
                    <input
                      required
                      value={farmerForm.farmerCode}
                      onChange={(event) =>
                        setFarmerForm((prev) => ({ ...prev, farmerCode: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Farmer name
                    <input
                      required
                      value={farmerForm.farmerName}
                      onChange={(event) =>
                        setFarmerForm((prev) => ({ ...prev, farmerName: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Village
                    <input
                      required
                      value={farmerForm.village}
                      onChange={(event) =>
                        setFarmerForm((prev) => ({ ...prev, village: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Mobile
                    <input
                      value={farmerForm.mobileNo}
                      onChange={(event) =>
                        setFarmerForm((prev) => ({ ...prev, mobileNo: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Address
                    <input
                      value={farmerForm.address}
                      onChange={(event) =>
                        setFarmerForm((prev) => ({ ...prev, address: event.target.value }))
                      }
                    />
                  </label>
                  <button type="submit" disabled={busy}>
                    Create farmer
                  </button>
                </form>
              </section>
            )}
          </main>

          <footer className="footer-note">
            API base URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}
          </footer>
        </>
      )}
    </div>
  )
}

export default App
