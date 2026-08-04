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
  farmers: FarmerResponse[]
  collections: CollectionListItem[]
}

export function useAppDerivedState({
  products,
  farmers,
  collections,
}: UseAppDerivedStateParams) {
  const nextProductCode = useMemo(
    () => buildNextProductCode(products.map((item) => item.productCode)),
    [products],
  )

  const nextFarmerCode = useMemo(
    () => buildNextFarmerCode((Array.isArray(farmers) ? farmers : []).map((item) => item.farmerCode)),
    [farmers],
  )

  const nextCollectionNo = useMemo(
    () => buildNextCollectionNo((Array.isArray(collections) ? collections : []).map((item) => item.collectionNo)),
    [collections],
  )

  const averageProductSellingPrice = useMemo(() => {
    if (!products.length) return 0
    return products.reduce((sum, item) => sum + item.sellingPrice, 0) / products.length
  }, [products])

  return {
    nextProductCode,
    nextFarmerCode,
    nextCollectionNo,
    averageProductSellingPrice,
  }
}
