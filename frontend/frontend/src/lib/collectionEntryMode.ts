export type CollectionEntryMode = 'single' | 'multi' | 'unknown'
export type ApiCollectionEntryMode = 'SINGLE' | 'MULTI'

const ENTRY_MODE_TAG_PATTERN = /\[ENTRY:(SINGLE|MULTI)\]/i

export function extractCollectionEntryModeFromRemarks(remarks: string | null | undefined): CollectionEntryMode {
  const text = (remarks || '').trim()
  const match = ENTRY_MODE_TAG_PATTERN.exec(text)
  if (!match) return 'unknown'

  const raw = match[1]?.toUpperCase()
  if (raw === 'SINGLE') return 'single'
  if (raw === 'MULTI') return 'multi'
  return 'unknown'
}

export function stripCollectionEntryModeTag(remarks: string | null | undefined): string {
  const text = (remarks || '').trim()
  if (!text) return ''

  return text.replace(ENTRY_MODE_TAG_PATTERN, '').replace(/\s{2,}/g, ' ').trim()
}

export function fromApiCollectionEntryMode(
  entryMode: unknown,
): CollectionEntryMode {
  const value = typeof entryMode === 'string' ? entryMode.trim().toUpperCase() : ''
  if (value === 'SINGLE') return 'single'
  if (value === 'MULTI') return 'multi'
  return 'unknown'
}

export function toApiCollectionEntryMode(
  entryMode: Exclude<CollectionEntryMode, 'unknown'>,
): ApiCollectionEntryMode {
  return entryMode === 'multi' ? 'MULTI' : 'SINGLE'
}
