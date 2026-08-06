import { useMemo } from 'react'
import { buildNextCollectionNo, buildNextFarmerCode, buildNextProductCode } from '../lib/codeGenerators'
import type {
  FarmerResponse,
  ProductResponse,
} from '../types/api'

type CollectionListItem = {
  uuid: string
  collectionNo: string
  farmerName: string
  collectionDate: string
  quantity: number
  grossAmount: number
}

type UseAppDerivedStateParams = {
  products: ProductResponse[]
  backendNextProductCode: string
  farmers: FarmerResponse[]
  collections: CollectionListItem[]
}

function extractTrailingNumber(code: string) {
  const match = (code || '').trim().match(/(\d+)$/)
  if (!match) return -1
  return Number(match[1])
}

export function useAppDerivedState({
  products,
  backendNextProductCode,
  farmers,
  collections,
}: UseAppDerivedStateParams) {
  const activeProducts = useMemo(
    () => products.filter((item) => item.active),
    [products],
  )

  const nextProductCode = useMemo(() => {
    const localNextCode = buildNextProductCode(products.map((item) => item.productCode))
    if (!backendNextProductCode) return localNextCode

    return extractTrailingNumber(backendNextProductCode) >= extractTrailingNumber(localNextCode)
      ? backendNextProductCode
      : localNextCode
  }, [backendNextProductCode, products])

  const nextFarmerCode = useMemo(
    () => buildNextFarmerCode((Array.isArray(farmers) ? farmers : []).map((item) => item.farmerCode)),
    [farmers],
  )

  const nextCollectionNo = useMemo(
    () => buildNextCollectionNo((Array.isArray(collections) ? collections : []).map((item) => item.collectionNo)),
    [collections],
  )

  const averageProductSellingPrice = useMemo(() => {
    if (!activeProducts.length) return 0
    return activeProducts.reduce((sum, item) => sum + item.sellingPrice, 0) / activeProducts.length
  }, [activeProducts])

  return {
    nextProductCode,
    nextFarmerCode,
    nextCollectionNo,
    averageProductSellingPrice,
  }
}
