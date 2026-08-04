import { useCallback } from 'react'

export function useRunAction(
  setBusy: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string>>,
  setSuccess: React.Dispatch<React.SetStateAction<string>>,
) {
  return useCallback(async <T,>(action: () => Promise<T>, successMessage?: string) => {
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const result = await action()
      if (successMessage) {
        setSuccess(successMessage)
      }
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error occurred.')
      return null
    } finally {
      setBusy(false)
    }
  }, [setBusy, setError, setSuccess])
}
