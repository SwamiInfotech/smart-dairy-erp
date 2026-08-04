import { Shift } from './Shift'
import type { CreateShiftRequest, ShiftResponse } from '../types/api'

type ShiftsPanelProps = {
  busy: boolean
  shifts: ShiftResponse[]
  form: CreateShiftRequest
  onFormChange: (next: CreateShiftRequest) => void
  onSubmit: () => void
  loadShiftsView: () => void | Promise<void>
}

export function ShiftsPanel({
  busy,
  shifts,
  form,
  onFormChange,
  onSubmit,
  loadShiftsView,
}: ShiftsPanelProps) {
  return (
    <section className="panel panel-shifts">
      <div className="panel-head">
        <h2>Shifts</h2>
        <button type="button" onClick={loadShiftsView} disabled={busy}>
          Reload
        </button>
      </div>

      <Shift shifts={shifts} form={form} busy={busy} onFormChange={onFormChange} onSubmit={onSubmit} />
    </section>
  )
}
