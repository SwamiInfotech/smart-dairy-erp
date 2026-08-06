import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { CreateRateCategoryRequest, RateCategoryResponse } from '../types/api'

type RateProfilesPageProps = {
  busy: boolean
  rateCategories: RateCategoryResponse[]
  rateCategoryForm: CreateRateCategoryRequest
  setRateCategoryForm: Dispatch<SetStateAction<CreateRateCategoryRequest>>
  editingRateCategoryUuid: string
  loadMilkRateLookups: () => void | Promise<void>
  onSubmitRateCategory: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onCancelRateCategoryEdit: () => void
  onEditRateCategory: (category: RateCategoryResponse) => void
  onDeleteRateCategory: (category: RateCategoryResponse) => void | Promise<void>
}

export function RateProfilesPage({
  busy,
  rateCategories,
  rateCategoryForm,
  setRateCategoryForm,
  editingRateCategoryUuid,
  loadMilkRateLookups,
  onSubmitRateCategory,
  onCancelRateCategoryEdit,
  onEditRateCategory,
  onDeleteRateCategory,
}: RateProfilesPageProps) {
  return (
    <section className="panel panel-rate-profiles">
      <div className="panel-head">
        <h2>Rate Profiles</h2>
        <button type="button" onClick={loadMilkRateLookups} disabled={busy}>
          Reload
        </button>
      </div>

      <div className="milk-rate-layout">
        <section className="milk-rate-form">
          <div className="milk-rate-form-head">
            <p className="eyebrow">Rate Category Master</p>
            <h3>{editingRateCategoryUuid ? 'Edit Rate Category' : 'Create Rate Category'}</h3>
            <p className="subtle">Connected to /api/v1/master/rate-categories (GET, POST, PUT, DELETE).</p>
          </div>

          <form className="form two-col" onSubmit={onSubmitRateCategory}>
            <label>
              Code
              <input
                required
                value={rateCategoryForm.code}
                onChange={(event) =>
                  setRateCategoryForm((prev) => ({ ...prev, code: event.target.value }))
                }
                placeholder="Example: FAT_STD"
              />
            </label>

            <label>
              Name
              <input
                required
                value={rateCategoryForm.name}
                onChange={(event) =>
                  setRateCategoryForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Example: Standard Fat"
              />
            </label>

            <label>
              Display Order
              <input
                type="number"
                min="0"
                step="1"
                value={rateCategoryForm.displayOrder ?? ''}
                onChange={(event) =>
                  setRateCategoryForm((prev) => ({
                    ...prev,
                    displayOrder:
                      event.target.value.trim() === '' ? undefined : Number(event.target.value),
                  }))
                }
                placeholder="0"
              />
            </label>

            <label className="span-2">
              Description
              <textarea
                rows={3}
                value={rateCategoryForm.description}
                onChange={(event) =>
                  setRateCategoryForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Optional description"
              />
            </label>

            <div className="form-actions span-2">
              <button type="submit" disabled={busy}>
                {busy
                  ? editingRateCategoryUuid
                    ? 'Saving...'
                    : 'Creating...'
                  : editingRateCategoryUuid
                    ? 'Save category'
                    : 'Create category'}
              </button>
              {editingRateCategoryUuid && (
                <button
                  type="button"
                  onClick={() => {
                    onCancelRateCategoryEdit()
                    window.location.reload()
                  }}
                  disabled={busy}
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>

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
                {rateCategories.length === 0 && (
                  <tr>
                    <td colSpan={6}>No rate categories available.</td>
                  </tr>
                )}
                {rateCategories.map((item) => (
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
                          onClick={() => onEditRateCategory(item)}
                          disabled={busy}
                          title="Edit rate category"
                          aria-label="Edit rate category"
                        >
                          <span aria-hidden="true">✎</span>
                        </button>
                        <button
                          type="button"
                          className="farmer-action-icon icon-delete"
                          onClick={() => onDeleteRateCategory(item)}
                          disabled={busy}
                          title="Delete rate category"
                          aria-label="Delete rate category"
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
    </section>
  )
}
