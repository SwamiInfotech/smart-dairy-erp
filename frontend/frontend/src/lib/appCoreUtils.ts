const TENANT_DIRECTORY_KEY = 'smart_dairy_tenant_directory'

export type TenantDirectoryEntry = {
  companyName: string
  tenantUuid: string
}

export function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function toInputTime(date: Date) {
  return date.toTimeString().slice(0, 5)
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

export function findLookupByLabel<T extends { code: string; name: string }>(items: T[], label: string) {
  const normalizedLabel = label.trim().toLowerCase()
  return items.find((item) => {
    const code = item.code.trim().toLowerCase()
    const name = item.name.trim().toLowerCase()
    return code === normalizedLabel || name === normalizedLabel
  })
}

export function isTenDigitMobile(value: string) {
  return /^[6-9]\d{9}$/.test(value)
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isValidPincode(value: string) {
  return /^\d{6}$/.test(value)
}

export function isValidAadhar(value: string) {
  return /^\d{12}$/.test(value)
}

export function isValidPan(value: string) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value)
}

export function normalizeCompanyName(value: string) {
  return value.trim().toLowerCase()
}

export function loadTenantDirectory() {
  try {
    const raw = localStorage.getItem(TENANT_DIRECTORY_KEY)
    if (!raw) return [] as TenantDirectoryEntry[]

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return [] as TenantDirectoryEntry[]

    return parsed
      .filter(
        (item): item is TenantDirectoryEntry =>
          Boolean(
            item &&
              typeof item === 'object' &&
              'companyName' in item &&
              'tenantUuid' in item &&
              typeof (item as { companyName: unknown }).companyName === 'string' &&
              typeof (item as { tenantUuid: unknown }).tenantUuid === 'string',
          ),
      )
      .map((item) => ({
        companyName: item.companyName.trim(),
        tenantUuid: item.tenantUuid.trim(),
      }))
      .filter((item) => item.companyName && isUuid(item.tenantUuid))
  } catch {
    return [] as TenantDirectoryEntry[]
  }
}

export function saveTenantDirectory(entries: TenantDirectoryEntry[]) {
  localStorage.setItem(TENANT_DIRECTORY_KEY, JSON.stringify(entries))
}

export function upsertTenantDirectory(
  entries: TenantDirectoryEntry[],
  companyName: string,
  tenantUuid: string,
) {
  const normalized = normalizeCompanyName(companyName)
  if (!normalized || !isUuid(tenantUuid)) {
    return entries
  }

  const next = entries.filter((entry) => normalizeCompanyName(entry.companyName) !== normalized)
  next.unshift({ companyName: companyName.trim(), tenantUuid: tenantUuid.trim() })
  return next
}

export function findTenantUuidByCompany(entries: TenantDirectoryEntry[], companyName: string) {
  const normalized = normalizeCompanyName(companyName)
  if (!normalized) return ''

  const matched = entries.find((entry) => normalizeCompanyName(entry.companyName) === normalized)
  return matched?.tenantUuid || ''
}
