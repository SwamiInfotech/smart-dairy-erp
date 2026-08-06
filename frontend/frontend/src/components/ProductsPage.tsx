import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { buildNextProductCode } from '../lib/codeGenerators'
import type { ProductResponse } from '../types/api'

type ProductFormState = {
  productCode: string
  productName: string
  productType: 'RAW_MILK' | 'FINISHED_PRODUCT'
  unitType: 'LITER' | 'KILOGRAM' | 'GRAM' | 'PIECE'
  description: string
  purchasePrice: number
  sellingPrice: number
  minimumStock: number
}

type ProductsPageProps = {
  busy: boolean
  products: ProductResponse[]
  productForm: ProductFormState
  setProductForm: Dispatch<SetStateAction<ProductFormState>>
  averageProductSellingPrice: number
  nextProductCode: string
  loadProducts: () => void | Promise<void>
  editingProductUuid: string
  onCreateProduct: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onEditProduct: (item: ProductResponse) => void
  onCancelProductEdit: () => void
  onDeleteProduct: (item: ProductResponse) => void | Promise<void>
}

const NON_DELETABLE_PRODUCT_CODES = new Set(['PRD001', 'PRD002'])

function isNonDeletableCoreProduct(productCode: string) {
  return NON_DELETABLE_PRODUCT_CODES.has((productCode || '').trim().toUpperCase())
}

export function ProductsPage({
  busy,
  products,
  productForm,
  setProductForm,
  averageProductSellingPrice,
  nextProductCode,
  loadProducts,
  editingProductUuid,
  onCreateProduct,
  onEditProduct,
  onCancelProductEdit,
  onDeleteProduct,
}: ProductsPageProps) {
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<ProductResponse | null>(null)
  const [confirmBusy, setConfirmBusy] = useState(false)
  const activeProducts = products.filter((item) => item.active)
  const strictNextProductCode = buildNextProductCode(products.map((item) => item.productCode))

  useEffect(() => {
    if (!confirmDeleteProduct) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [confirmDeleteProduct])

  useEffect(() => {
    if (!confirmDeleteProduct) return

    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !confirmBusy) {
        setConfirmDeleteProduct(null)
      }
    }

    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [confirmBusy, confirmDeleteProduct])

  useEffect(() => {
    if (editingProductUuid) return

    setProductForm((prev) => {
      if (prev.productCode === strictNextProductCode) return prev
      return {
        ...prev,
        productCode: strictNextProductCode,
      }
    })
  }, [editingProductUuid, setProductForm, strictNextProductCode])

  const closeDeleteConfirm = () => {
    if (confirmBusy) return
    setConfirmDeleteProduct(null)
  }

  const handleDeleteProduct = async () => {
    if (!confirmDeleteProduct || confirmBusy) return

    setConfirmBusy(true)
    try {
      await onDeleteProduct(confirmDeleteProduct)
      await loadProducts()
    } finally {
      setConfirmBusy(false)
      setConfirmDeleteProduct(null)
    }
  }

  return (
    <section className="panel panel-product">
      <div className="panel-head">
        <h2>Products</h2>
        <button type="button" onClick={loadProducts} disabled={busy}>
          Reload
        </button>
      </div>

      <div className="product-layout">
        <form className="form two-col product-form" onSubmit={onCreateProduct}>
          <div className="product-form-head">
            <p className="eyebrow">Product Master</p>
            <h3>{editingProductUuid ? 'Edit Product' : 'Create Product'}</h3>
            <p className="subtle">Product code is generated automatically and increments by 1.</p>
          </div>

          <label>
            Product code
            <input required value={productForm.productCode} readOnly />
          </label>
          <label>
            Product name
            <input
              required
              value={productForm.productName}
              onChange={(event) => setProductForm((prev) => ({ ...prev, productName: event.target.value }))}
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
              onChange={(event) => setProductForm((prev) => ({ ...prev, purchasePrice: Number(event.target.value) }))}
            />
          </label>
          <label>
            Selling price
            <input
              type="number"
              step="0.01"
              value={productForm.sellingPrice}
              onChange={(event) => setProductForm((prev) => ({ ...prev, sellingPrice: Number(event.target.value) }))}
            />
          </label>
          <label>
            Minimum stock
            <input
              type="number"
              step="0.001"
              value={productForm.minimumStock}
              onChange={(event) => setProductForm((prev) => ({ ...prev, minimumStock: Number(event.target.value) }))}
            />
          </label>
          <label className="product-field-wide">
            Description
            <input
              value={productForm.description}
              onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </label>
          <div className="collection-form-actions">
            <button type="submit" disabled={busy} className="product-submit">
              {busy ? 'Saving...' : editingProductUuid ? 'Update Product' : 'Create Product'}
            </button>
            {editingProductUuid && (
              <button
                type="button"
                className="collection-cancel-edit-btn"
                onClick={() => {
                  onCancelProductEdit()
                  window.location.reload()
                }}
                disabled={busy}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <aside className="product-summary" aria-label="Product quick summary">
          <h3>Inventory Snapshot</h3>
          <div className="product-summary-grid">
            <article>
              <p>Total products</p>
              <strong>{activeProducts.length}</strong>
            </article>
            <article>
              <p>Average selling</p>
              <strong>{averageProductSellingPrice.toFixed(2)}</strong>
            </article>
            <article>
              <p>Next code</p>
              <strong>{strictNextProductCode || nextProductCode}</strong>
            </article>
          </div>
        </aside>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Selling</th>
              <th>Stock min</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeProducts.map((item) => (
              <tr key={item.uuid}>
                <td>{item.productCode}</td>
                <td>{item.productName}</td>
                <td>{item.productType}</td>
                <td>{item.sellingPrice}</td>
                <td>{item.minimumStock}</td>
                <td>
                  <div className="collection-list-actions">
                    {(() => {
                      const isCoreProduct = isNonDeletableCoreProduct(item.productCode)
                      return (
                        <>
                    <button
                      type="button"
                      onClick={() => onEditProduct(item)}
                      disabled={busy}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="collection-list-delete-btn"
                      title={isCoreProduct ? 'PRD001 and PRD002 are core products and cannot be deleted.' : 'Delete product'}
                      onClick={() => {
                        if (isCoreProduct) return
                        setConfirmDeleteProduct(item)
                      }}
                      disabled={busy || isCoreProduct}
                    >
                      Delete
                    </button>
                        </>
                      )
                    })()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDeleteProduct && (
        <div className="collection-confirm-overlay" role="presentation" onClick={closeDeleteConfirm}>
          <div
            className="collection-confirm-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-delete-confirm-title"
            aria-describedby="product-delete-confirm-message"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="product-delete-confirm-title">Delete Product</h3>
            <p id="product-delete-confirm-message">
              Do you really want to delete product <strong>{confirmDeleteProduct.productName}</strong>?
              This action cannot be undone.
            </p>
            <div className="collection-confirm-actions">
              <button
                type="button"
                className="collection-confirm-cancel"
                onClick={closeDeleteConfirm}
                disabled={busy || confirmBusy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="collection-confirm-primary"
                onClick={() => {
                  void handleDeleteProduct()
                }}
                disabled={busy || confirmBusy}
              >
                {confirmBusy ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
