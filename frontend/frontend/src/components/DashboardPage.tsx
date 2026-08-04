import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type {
  CustomerResponse,
  FarmerResponse,
  ProductResponse,
  SalesDashboardResponse,
  SalesInvoiceResponse,
} from '../types/api'

type PrimarySection =
  | 'dashboard'
  | 'products'
  | 'customers'
  | 'milkCollections'
  | 'sales'
  | 'farmers'
  | 'tenants'

type CollectionListItem = {
  uuid: string
  collectionNo: string
  farmerName: string
  collectionDate: string
  quantity: number
  grossAmount: number
}

type DashboardRangeState = {
  fromDate: string
  toDate: string
}

type DashboardPageProps = {
  busy: boolean
  dashboard: SalesDashboardResponse | null
  dashboardRange: DashboardRangeState
  setDashboardRange: Dispatch<SetStateAction<DashboardRangeState>>
  collections: CollectionListItem[]
  farmers: FarmerResponse[]
  products: ProductResponse[]
  customers: CustomerResponse[]
  sales: SalesInvoiceResponse[]
  loadDashboard: () => void | Promise<void>
  onOpenSection: (section: PrimarySection) => void
}

export function DashboardPage({
  busy,
  dashboard,
  dashboardRange,
  setDashboardRange,
  collections,
  farmers,
  products,
  customers,
  sales,
  loadDashboard,
  onOpenSection,
}: DashboardPageProps) {
  return (
    <section className="panel panel-dashboard-home">
      <div className="panel-head">
        <h2>Executive Dashboard</h2>
        <button type="button" onClick={loadDashboard} disabled={busy}>
          Refresh
        </button>
      </div>

      <div className="dashboard-home-shell">
        <section className="dashboard-hero" aria-label="Dashboard highlights">
          <div className="dashboard-hero-copy">
            <p className="dashboard-hero-badge">SMART DAIRY OPERATIONS</p>
            <h3>Collections, Sales, and Farmer Activity in One View</h3>
            <p>
              Run daily operations with real-time visibility across procurement, invoicing,
              and field-level farmer performance.
            </p>
          </div>
          <button type="button" className="dashboard-hero-cta" onClick={() => onOpenSection('sales')}>
            Explore Sales Directory
          </button>
        </section>

        <form
          className="form inline dashboard-filter"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            void loadDashboard()
          }}
        >
          <label>
            From
            <input
              type="date"
              value={dashboardRange.fromDate}
              onChange={(event) => setDashboardRange((prev) => ({ ...prev, fromDate: event.target.value }))}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={dashboardRange.toDate}
              onChange={(event) => setDashboardRange((prev) => ({ ...prev, toDate: event.target.value }))}
            />
          </label>
          <button type="submit" disabled={busy}>
            Apply
          </button>
        </form>

        <div className="kpi-grid dashboard-kpis">
          <article className="dashboard-kpi tone-blue">
            <p>Total invoices</p>
            <strong>{dashboard?.totalInvoices ?? 0}</strong>
          </article>
          <article className="dashboard-kpi tone-cyan">
            <p>Total sales</p>
            <strong>{dashboard?.totalSales ?? 0}</strong>
          </article>
          <article className="dashboard-kpi tone-violet">
            <p>Net sales</p>
            <strong>{dashboard?.netSales ?? 0}</strong>
          </article>
          <article className="dashboard-kpi tone-amber">
            <p>Avg invoice</p>
            <strong>{dashboard?.averageInvoiceValue ?? 0}</strong>
          </article>
          <article className="dashboard-kpi tone-green">
            <p>Collections</p>
            <strong>{collections.length}</strong>
          </article>
          <article className="dashboard-kpi tone-rose">
            <p>Farmers</p>
            <strong>{farmers.length}</strong>
          </article>
          <article className="dashboard-kpi tone-indigo">
            <p>Products</p>
            <strong>{products.length}</strong>
          </article>
          <article className="dashboard-kpi tone-lilac">
            <p>Customers</p>
            <strong>{customers.length}</strong>
          </article>
        </div>

        <section className="dashboard-quick-actions" aria-label="Quick actions">
          <h3>Quick Actions</h3>
          <div className="dashboard-quick-grid">
            <button type="button" onClick={() => onOpenSection('milkCollections')}>
              Open Milk Collections
            </button>
            <button type="button" onClick={() => onOpenSection('farmers')}>
              Open Farmers
            </button>
            <button type="button" onClick={() => onOpenSection('sales')}>
              Open Sales
            </button>
            <button type="button" onClick={() => onOpenSection('products')}>
              Open Products
            </button>
          </div>
        </section>

        <div className="dashboard-activity-grid">
          <section className="dashboard-activity-card">
            <h3>Recent Milk Collections</h3>
            <ul>
              {collections.slice(0, 5).map((item) => (
                <li key={item.uuid}>
                  <span>{item.collectionNo}</span>
                  <span>{item.farmerName}</span>
                  <span>{item.quantity} L</span>
                </li>
              ))}
              {collections.length === 0 && <li className="empty">No recent collections</li>}
            </ul>
          </section>

          <section className="dashboard-activity-card">
            <h3>Recent Sales Invoices</h3>
            <ul>
              {sales.slice(0, 5).map((item) => (
                <li key={item.uuid}>
                  <span>{item.invoiceNo}</span>
                  <span>{item.customerName}</span>
                  <span>{item.netAmount}</span>
                </li>
              ))}
              {sales.length === 0 && <li className="empty">No recent sales</li>}
            </ul>
          </section>
        </div>
      </div>
    </section>
  )
}
