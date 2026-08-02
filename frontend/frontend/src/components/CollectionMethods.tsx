import type { CollectionMethodResponse, CreateCollectionMethodRequest } from '../types/api'

type CollectionMethodsProps = {
	methods: CollectionMethodResponse[]
	form: CreateCollectionMethodRequest
	busy: boolean
	editingUuid: string
	onFormChange: (next: CreateCollectionMethodRequest) => void
	onSubmit: () => void
	onCancelEdit: () => void
	onEdit: (item: CollectionMethodResponse) => void
	onDelete: (item: CollectionMethodResponse) => void
}

export function CollectionMethods({
	methods,
	form,
	busy,
	editingUuid,
	onFormChange,
	onSubmit,
	onCancelEdit,
	onEdit,
	onDelete,
}: CollectionMethodsProps) {
	return (
		<div className="collection-methods-layout">
			<section className="collection-methods-card">
				<div className="collection-methods-head">
					<p className="eyebrow">Collection Method Master</p>
					<h3>{editingUuid ? 'Edit Collection Method' : 'Create Collection Method'}</h3>
					<p className="subtle">Contract: /api/v1/master/collection-methods</p>
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
							placeholder="Example: FAT"
						/>
					</label>

					<label>
						Name
						<input
							required
							value={form.name}
							onChange={(event) => onFormChange({ ...form, name: event.target.value })}
							placeholder="Example: FAT Based"
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
							{busy ? (editingUuid ? 'Saving...' : 'Creating...') : editingUuid ? 'Save method' : 'Create method'}
						</button>
						{editingUuid && (
							<button type="button" onClick={onCancelEdit} disabled={busy}>
								Cancel edit
							</button>
						)}
					</div>
				</form>
			</section>

			<section className="collection-methods-card">
				<div className="collection-methods-head">
					<p className="eyebrow">Configured Methods</p>
					<h3>Collection Method List</h3>
					<p className="subtle">Fetched from /api/v1/master/collection-methods</p>
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
							{methods.length === 0 && (
								<tr>
									<td colSpan={6}>No collection methods found.</td>
								</tr>
							)}
							{methods.map((item) => (
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
												title="Edit method"
												aria-label="Edit method"
											>
												<span aria-hidden="true">✎</span>
											</button>
											<button
												type="button"
												className="farmer-action-icon icon-delete"
												onClick={() => onDelete(item)}
												disabled={busy}
												title="Delete method"
												aria-label="Delete method"
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
