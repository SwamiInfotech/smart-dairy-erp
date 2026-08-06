import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type {
  CreateInventoryTransactionRequest,
  InventoryCurrentStockResponse,
  InventoryTransactionDirection,
  InventoryTransactionResponse,
  ProductResponse,
} from '../types/api'

type InventoryTransactionsPageProps = {
  busy: boolean
  products: ProductResponse[]
  transactions: InventoryTransactionResponse[]
  currentStockRows: InventoryCurrentStockResponse[]
  loadInventoryTransactions: () => void | Promise<void>
  loadInventoryCurrentStock: () => void | Promise<void>
  onCreateInventoryTransaction: (
    payload: CreateInventoryTransactionRequest,
  ) => void | Promise<void>
}

type InventoryTransactionFormState = {
  transactionDate: string
  direction: InventoryTransactionDirection
  productUuid: string
  quantity: number
  unitRate: number
  referenceNo: string
  remarks: string
}

const EMPTY_FORM: InventoryTransactionFormState = {
  transactionDate: new Date().toISOString().slice(0, 10),
  direction: 'IN',
  productUuid: '',
  quantity: 0,
  unitRate: 0,
  referenceNo: '',
  remarks: '',
}

export function InventoryTransactionsPage({
  busy,
  products,
  transactions,
  currentStockRows,
  loadInventoryTransactions,
  loadInventoryCurrentStock,
  onCreateInventoryTransaction,
}: InventoryTransactionsPageProps) {
  const [form, setForm] = useState<InventoryTransactionFormState>(EMPTY_FORM)
  const activeProducts = useMemo(
    () => products.filter((product) => product.active),
    [products],
  )

  useEffect(() => {
    void loadInventoryTransactions()
    void loadInventoryCurrentStock()
  }, [loadInventoryCurrentStock, loadInventoryTransactions])

  const calculatedAmount = useMemo(() => {
    const quantity = Number(form.quantity) || 0
    const rate = Number(form.unitRate) || 0
    return Math.round(quantity * rate * 100) / 100
  }, [form.quantity, form.unitRate])

  const activeProductUuidSet = useMemo(() => {
    return new Set(products.filter((product) => product.active).map((product) => product.uuid))
  }, [products])

  const derivedStockRows = useMemo(() => {
    const stockByProduct = new Map<string, { productName: string; productCode: string; stock: number }>()
    const shouldFilterByActive = activeProductUuidSet.size > 0

    for (const product of products) {
      stockByProduct.set(product.uuid, {
        productName: product.productName,
        productCode: product.productCode,
        stock: 0,
      })
    }

    for (const item of transactions) {
      if (shouldFilterByActive && !activeProductUuidSet.has(item.productUuid)) {
        continue
      }

      const existing = stockByProduct.get(item.productUuid) || {
        productName: item.productName || item.productCode || item.productUuid,
        productCode: item.productCode,
        stock: 0,
      }

      if (item.direction === 'IN') {
        existing.stock += item.quantity
      } else if (item.direction === 'OUT') {
        existing.stock -= item.quantity
      } else {
        existing.stock += item.quantity
      }

      stockByProduct.set(item.productUuid, existing)
    }

    return Array.from(stockByProduct.entries())
      .map(([productUuid, value]) => ({
        productUuid,
        productName: value.productName,
        productCode: value.productCode,
        stock: Math.round(value.stock * 100) / 100,
      }))
      .sort((a, b) => a.productName.localeCompare(b.productName))
  }, [activeProductUuidSet, products, transactions])

  const productStockRows = useMemo(() => {
    const shouldFilterByActive = activeProductUuidSet.size > 0

    if (currentStockRows.length === 0) {
      return derivedStockRows
    }

    return currentStockRows
      .filter((row) => !shouldFilterByActive || activeProductUuidSet.has(row.productUuid))
      .map((row) => {
        const matchedProduct = products.find((item) => item.uuid === row.productUuid)
        return {
          productUuid: row.productUuid,
          productName: row.productName || matchedProduct?.productName || row.productCode || row.productUuid,
          productCode: row.productCode || matchedProduct?.productCode || '',
          stock: row.currentStock,
        }
      })
      .sort((a, b) => a.productName.localeCompare(b.productName))
  }, [activeProductUuidSet, currentStockRows, derivedStockRows, products])

  const totalStock = useMemo(
    () => productStockRows.reduce((sum, row) => sum + row.stock, 0),
    [productStockRows],
  )

  const inStockCount = useMemo(
    () => productStockRows.filter((row) => row.stock > 0).length,
    [productStockRows],
  )

  const outOfStockCount = useMemo(
    () => productStockRows.filter((row) => row.stock <= 0).length,
    [productStockRows],
  )

  const stockRowsForDisplay = useMemo(
    () => productStockRows.filter((row) => row.stock > 0),
    [productStockRows],
  )

  const onSubmitTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const selectedProduct = products.find((product) => product.uuid === form.productUuid)
    if (!selectedProduct) {
      return
    }

    const quantity = Number(form.quantity) || 0
    const unitRate = Number(form.unitRate) || 0

    if (quantity <= 0 || unitRate < 0) {
      return
    }

    await onCreateInventoryTransaction({
      transactionDate: form.transactionDate,
      direction: form.direction,
      productUuid: selectedProduct.uuid,
      quantity,
      unitRate,
      referenceNo: form.referenceNo.trim(),
      remarks: form.remarks.trim(),
    })

    await loadInventoryCurrentStock()

    setForm((prev) => ({
      ...EMPTY_FORM,
      transactionDate: prev.transactionDate,
      direction: prev.direction,
    }))
  }

  return (
    <section className="panel panel-inventory-transactions">
      <div className="panel-head">
        <h2>Inventory Transactions</h2>
      </div>

      <div className="inventory-transactions-layout">
        <form className="inventory-transaction-form" onSubmit={onSubmitTransaction}>
          <div className="inventory-form-head">
            <p className="eyebrow">Inventory Posting</p>
            <h3>Create Inventory Transaction</h3>
            <p className="subtle">Record stock IN, OUT, or ADJUSTMENT with quantity and valuation.</p>
          </div>

          <div className="inventory-form-grid">
            <label>
              Transaction Date
              <input
                required
                type="date"
                value={form.transactionDate}
                onChange={(event) => setForm((prev) => ({ ...prev, transactionDate: event.target.value }))}
              />
            </label>

            <label>
              Direction
              <select
                value={form.direction}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    direction: event.target.value as InventoryTransactionDirection,
                  }))
                }
              >
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
                <option value="ADJUSTMENT">ADJUSTMENT</option>
              </select>
            </label>

            <label>
              Reference No
              <input
                value={form.referenceNo}
                onChange={(event) => setForm((prev) => ({ ...prev, referenceNo: event.target.value }))}
                placeholder="Voucher / challan / note"
              />
            </label>

            <label className="inventory-field-wide">
              Product
              <select
                required
                value={form.productUuid}
                onChange={(event) => setForm((prev) => ({ ...prev, productUuid: event.target.value }))}
              >
                <option value="">Select product</option>
                {activeProducts.map((product) => (
                  <option key={product.uuid} value={product.uuid}>
                    {product.productName} ({product.productCode || product.unitType})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Quantity
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.quantity}
                onChange={(event) => setForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))}
              />
            </label>

            <label>
              Unit Rate
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.unitRate}
                onChange={(event) => setForm((prev) => ({ ...prev, unitRate: Number(event.target.value) }))}
              />
            </label>

            <label>
              Amount
              <input value={calculatedAmount.toFixed(2)} readOnly disabled />
            </label>

            <label className="inventory-field-wide">
              Remarks
              <input
                value={form.remarks}
                onChange={(event) => setForm((prev) => ({ ...prev, remarks: event.target.value }))}
                placeholder="Optional reason"
              />
            </label>
          </div>

          <button type="submit" className="inventory-submit" disabled={busy}>
            Add Transaction
          </button>
        </form>

        <aside className="inventory-stock-panel">
          <div className="inventory-stock-panel-head">
            <h3>Current Stock</h3>
            <p className="subtle">Live stock position by product</p>
          </div>

          <div className="inventory-stock-kpi-grid">
            <article>
              <p>Products Tracked</p>
              <strong>{stockRowsForDisplay.length}</strong>
            </article>
            <article>
              <p>Total Stock Qty</p>
              <strong>{totalStock.toFixed(2)}</strong>
            </article>
            <article>
              <p>In Stock</p>
              <strong>{inStockCount}</strong>
            </article>
            <article>
              <p>Out Of Stock</p>
              <strong>{outOfStockCount}</strong>
            </article>
          </div>

          <div className="inventory-stock-grid-wrap">
            <table className="inventory-stock-grid">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Code</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {stockRowsForDisplay.length === 0 && (
                  <tr>
                    <td colSpan={3}>No products with available stock.</td>
                  </tr>
                )}
                {stockRowsForDisplay.map((row) => (
                  <tr key={row.productUuid}>
                    <td>{row.productName}</td>
                    <td>{row.productCode || '-'}</td>
                    <td>{row.stock.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </aside>
      </div>

      <div className="table-wrap inventory-transactions-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Direction</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Reference</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={8}>No inventory transactions yet.</td>
              </tr>
            )}
            {transactions.map((item) => (
              <tr key={item.uuid}>
                <td>{item.transactionDate}</td>
                <td>{item.direction}</td>
                <td>{item.productName || item.productCode || item.productUuid}</td>
                <td>{item.quantity.toFixed(2)}</td>
                <td>{item.unitRate.toFixed(2)}</td>
                <td>{item.amount.toFixed(2)}</td>
                <td>{item.referenceNo || '-'}</td>
                <td>{item.remarks || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
