import { CollectionMethods } from './CollectionMethods'
import type { CollectionMethodResponse, CreateCollectionMethodRequest } from '../types/api'

type CollectionMethodsPanelProps = {
  busy: boolean
  methods: CollectionMethodResponse[]
  form: CreateCollectionMethodRequest
  editingUuid: string
  onFormChange: (next: CreateCollectionMethodRequest) => void
  onSubmit: () => void
  onCancelEdit: () => void
  onEdit: (item: CollectionMethodResponse) => void
  onDelete: (item: CollectionMethodResponse) => void
  loadCollectionMethodsView: () => void | Promise<void>
}

export function CollectionMethodsPanel({
  busy,
  methods,
  form,
  editingUuid,
  onFormChange,
  onSubmit,
  onCancelEdit,
  onEdit,
  onDelete,
  loadCollectionMethodsView,
}: CollectionMethodsPanelProps) {
  return (
    <section className="panel panel-collection-methods">
      <div className="panel-head">
        <h2>Collection Methods</h2>
        <button type="button" onClick={loadCollectionMethodsView} disabled={busy}>
          Reload
        </button>
      </div>

      <CollectionMethods
        methods={methods}
        form={form}
        busy={busy}
        editingUuid={editingUuid}
        onFormChange={onFormChange}
        onSubmit={onSubmit}
        onCancelEdit={onCancelEdit}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </section>
  )
}
