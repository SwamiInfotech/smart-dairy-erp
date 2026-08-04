import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { CreateTenantRequest, TenantResponse } from '../types/api'

type TenantsPageProps = {
  busy: boolean
  tenants: TenantResponse[]
  tenantForm: CreateTenantRequest
  setTenantForm: Dispatch<SetStateAction<CreateTenantRequest>>
  editingTenantUuid: string
  loadTenants: () => void | Promise<void>
  onSubmitTenant: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onEditTenant: (tenant: TenantResponse) => void
  onCancelTenantEdit: () => void
}

export function TenantsPage({
  busy,
  tenants,
  tenantForm,
  setTenantForm,
  editingTenantUuid,
  loadTenants,
  onSubmitTenant,
  onEditTenant,
  onCancelTenantEdit,
}: TenantsPageProps) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Tenants</h2>
        <button type="button" onClick={loadTenants} disabled={busy}>
          Reload
        </button>
      </div>

      <form className="form two-col tenant-form" onSubmit={onSubmitTenant}>
        <label>
          Tenant code
          <input
            required
            value={tenantForm.code}
            onChange={(event) => setTenantForm((prev) => ({ ...prev, code: event.target.value }))}
            placeholder="e.g. ABC-001"
          />
        </label>

        <label>
          Tenant name
          <input
            required
            value={tenantForm.name}
            onChange={(event) => setTenantForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="e.g. ABC Dairy Pvt Ltd"
          />
        </label>

        <button type="submit" disabled={busy}>
          {editingTenantUuid ? 'Save tenant' : 'Create tenant'}
        </button>

        {editingTenantUuid && (
          <button type="button" onClick={onCancelTenantEdit} disabled={busy}>
            Cancel edit
          </button>
        )}
      </form>

      {editingTenantUuid && (
        <p className="subtle">
          Backend edit endpoint is Phase 2. UI is ready and will activate once PUT endpoint is enabled.
        </p>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((item) => (
              <tr key={item.uuid}>
                <td>{item.code}</td>
                <td>{item.name}</td>
                <td>{item.active ? 'ACTIVE' : 'INACTIVE'}</td>
                <td>{item.createdAt?.slice(0, 10) || '-'}</td>
                <td>
                  <button type="button" onClick={() => onEditTenant(item)} disabled={busy}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
