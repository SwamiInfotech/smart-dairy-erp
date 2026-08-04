type ToastItem = {
  id: number
  kind: 'error' | 'success'
  text: string
}

type ToastStackProps = {
  toasts: ToastItem[]
  onDismissToast: (id: number) => void
}

export function ToastStack({ toasts, onDismissToast }: ToastStackProps) {
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={toast.kind === 'error' ? 'toast toast-error' : 'toast toast-success'}>
          <span>{toast.text}</span>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => onDismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            x
          </button>
        </div>
      ))}
    </div>
  )
}
