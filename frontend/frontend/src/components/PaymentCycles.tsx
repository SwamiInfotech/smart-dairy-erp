import type { CreatePaymentCycleRequest, PaymentCycleResponse } from '../types/api'

type PaymentCyclesProps = {
  cycles: PaymentCycleResponse[]
  form: CreatePaymentCycleRequest
  busy: boolean
  editingUuid: string
  onFormChange: (next: CreatePaymentCycleRequest) => void
  onSubmit: () => void
  onCancelEdit: () => void
  onEdit: (item: PaymentCycleResponse) => void
  onDelete: (item: PaymentCycleResponse) => void
}

export function PaymentCycles({
  cycles,
  form,
  busy,
  editingUuid,
  onFormChange,
  onSubmit,
  onCancelEdit,
  onEdit,
  onDelete,
}: PaymentCyclesProps) {
  return (
    <div className="collection-methods-layout">
      <section className="collection-methods-card">
        <div className="collection-methods-head">
          <p className="eyebrow">Payment Cycle Master</p>
          <h3>{editingUuid ? 'Edit Payment Cycle' : 'Create Payment Cycle'}</h3>
          <p className="subtle">Contract: /api/v1/payment-cycles</p>
        </div>

        <form
          className="form two-col"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <label>
            Code
            <input
              required
              value={form.code}
              onChange={(event) => onFormChange({ ...form, code: event.target.value })}
              placeholder="Example: WEEKLY"
            />
          </label>

          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(event) => onFormChange({ ...form, name: event.target.value })}
              placeholder="Example: Weekly"
            />
          </label>

          <label>
            Display Order
            <input
              type="number"
              min="0"
              step="1"
              value={form.displayOrder ?? ''}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  displayOrder: event.target.value.trim() === '' ? undefined : Number(event.target.value),
                })
              }
              placeholder="0"
            />
          </label>

          <label className="span-2">
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => onFormChange({ ...form, description: event.target.value })}
              placeholder="Optional description"
            />
          </label>

          <div className="form-actions span-2">
            <button type="submit" disabled={busy}>
              {busy
                ? editingUuid
                  ? 'Saving...'
                  : 'Creating...'
                : editingUuid
                  ? 'Save cycle'
                  : 'Create cycle'}
            </button>
            {editingUuid && (
              <button
                type="button"
                onClick={() => {
                  onCancelEdit()
                  window.location.reload()
                }}
                disabled={busy}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="collection-methods-card">
        <div className="collection-methods-head">
          <p className="eyebrow">Configured Cycles</p>
          <h3>Payment Cycle List</h3>
          <p className="subtle">Fetched from /api/v1/payment-cycles</p>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Display Order</th>
                <th>Active</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cycles.length === 0 && (
                <tr>
                  <td colSpan={6}>No payment cycles found.</td>
                </tr>
              )}
              {cycles.map((item) => (
                <tr key={item.uuid}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td>{item.displayOrder ?? '-'}</td>
                  <td>{item.active ? 'Yes' : 'No'}</td>
                  <td>{item.description || '-'}</td>
                  <td>
                    <div className="farmer-row-actions">
                      <button
                        type="button"
                        className="farmer-action-icon icon-edit"
                        onClick={() => onEdit(item)}
                        disabled={busy}
                        title="Edit cycle"
                        aria-label="Edit cycle"
                      >
                        <span aria-hidden="true">✎</span>
                      </button>
                      <button
                        type="button"
                        className="farmer-action-icon icon-delete"
                        onClick={() => onDelete(item)}
                        disabled={busy}
                        title="Delete cycle"
                        aria-label="Delete cycle"
                      >
                        <span aria-hidden="true">✕</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}