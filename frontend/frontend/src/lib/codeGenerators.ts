function nextSequentialCode(
  existingCodes: string[],
  fallbackPrefix: string,
  fallbackWidth: number,
  minimumHighestNumber = 0,
) {
  let highestNumber = minimumHighestNumber
  let selectedPrefix = fallbackPrefix
  let selectedWidth = fallbackWidth

  for (const rawCode of existingCodes) {
    const code = rawCode.trim()
    if (!code) continue

    const match = code.match(/^(.*?)(\d+)$/)
    if (!match) continue

    const prefix = match[1] || fallbackPrefix
    const numberPart = match[2]
    const numberValue = Number(numberPart)

    if (Number.isNaN(numberValue)) continue

    if (numberValue > highestNumber) {
      highestNumber = numberValue
      selectedPrefix = prefix
      selectedWidth = numberPart.length
    }
  }

  const nextNumber = highestNumber + 1
  return `${selectedPrefix}${String(nextNumber).padStart(selectedWidth, '0')}`
}

export function buildNextCollectionNo(existingCollectionNos: string[]) {
  const normalizedCollectionNos = existingCollectionNos
    .map((item) => item?.trim() || '')
    .filter(Boolean)

  if (!normalizedCollectionNos.length) {
    return 'COL-001'
  }

  return nextSequentialCode(normalizedCollectionNos, 'COL', 3)
}

export function buildNextProductCode(existingCodes: string[]) {
  return nextSequentialCode(existingCodes, 'PRD', 3, 2)
}

export function buildNextFarmerCode(existingCodes: string[]) {
  return nextSequentialCode(existingCodes, 'FRM', 3)
}
