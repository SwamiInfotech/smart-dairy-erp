import type { CreateShiftRequest, ShiftResponse } from '../types/api'

type ShiftProps = {
  shifts: ShiftResponse[]
  form: CreateShiftRequest
  busy: boolean
  onFormChange: (next: CreateShiftRequest) => void
  onSubmit: () => void
}

export function Shift({ shifts, form, busy, onFormChange, onSubmit }: ShiftProps) {
  return (
    <div className="collection-methods-layout">
      <section className="collection-methods-card">
        <div className="collection-methods-head">
          <p className="eyebrow">Shift Master</p>
          <h3>Create Shift</h3>
          <p className="subtle">Contract: /api/v1/master/shifts</p>
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
              placeholder="Example: MORNING"
            />
          </label>

          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(event) => onFormChange({ ...form, name: event.target.value })}
              placeholder="Example: Morning Shift"
            />
          </label>

          <label>
            Display Order
            <input
              required
              type="number"
              min="0"
              step="1"
              value={form.displayOrder}
              onChange={(event) => onFormChange({ ...form, displayOrder: Number(event.target.value) })}
              placeholder="1"
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
              {busy ? 'Creating...' : 'Create shift'}
            </button>
          </div>
        </form>
      </section>

      <section className="collection-methods-card">
        <div className="collection-methods-head">
          <p className="eyebrow">Configured Shifts</p>
          <h3>Shift List</h3>
          <p className="subtle">Fetched from /api/v1/master/shifts</p>
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
              </tr>
            </thead>
            <tbody>
              {shifts.length === 0 && (
                <tr>
                  <td colSpan={5}>No shifts found.</td>
                </tr>
              )}
              {shifts.map((item) => (
                <tr key={item.uuid}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td>{item.displayOrder ?? '-'}</td>
                  <td>{item.active ? 'Yes' : 'No'}</td>
                  <td>{item.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}