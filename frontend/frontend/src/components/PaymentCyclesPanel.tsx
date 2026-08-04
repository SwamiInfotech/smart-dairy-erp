import { PaymentCycles } from './PaymentCycles'
import type { CreatePaymentCycleRequest, PaymentCycleResponse } from '../types/api'

type PaymentCyclesPanelProps = {
  busy: boolean
  cycles: PaymentCycleResponse[]
  form: CreatePaymentCycleRequest
  editingUuid: string
  onFormChange: (next: CreatePaymentCycleRequest) => void
  onSubmit: () => void
  onCancelEdit: () => void
  onEdit: (item: PaymentCycleResponse) => void
  onDelete: (item: PaymentCycleResponse) => void
  loadPaymentCyclesView: () => void | Promise<void>
}

export function PaymentCyclesPanel({
  busy,
  cycles,
  form,
  editingUuid,
  onFormChange,
  onSubmit,
  onCancelEdit,
  onEdit,
  onDelete,
  loadPaymentCyclesView,
}: PaymentCyclesPanelProps) {
  return (
    <section className="panel panel-payment-cycles">
      <div className="panel-head">
        <h2>Payment Cycles</h2>
        <button type="button" onClick={loadPaymentCyclesView} disabled={busy}>
          Reload
        </button>
      </div>

      <PaymentCycles
        cycles={cycles}
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
