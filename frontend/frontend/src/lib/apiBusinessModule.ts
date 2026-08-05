import type {
  CreateInventoryTransactionRequest,
  ApiCollectionEntryMode,
  CreateCustomerRequest,
  CreateFarmerRequest,
  CreateMilkCollectionRequest,
  CreateProductRequest,
  CreateSalesInvoiceRequest,
  CustomerResponse,
  FarmerResponse,
  InventoryCurrentStockResponse,
  InventoryTransactionDirection,
  InventoryTransactionResponse,
  PageResult,
  ProductResponse,
  SalesDashboardResponse,
  SalesInvoiceResponse,
} from '../types/api'
import { asRecord, readNumber, readString } from './apiResponseParsers'
import { normalizeFarmerPageResponse } from './apiEntityNormalizers'
import type { RequestFn } from './apiRequestCore'

type ApiBusinessModuleDependencies = {
  request: RequestFn
}

export function createApiBusinessModule({ request }: ApiBusinessModuleDependencies) {
  return {
    getSalesDashboard(token: string, fromDate: string, toDate: string) {
      return request<SalesDashboardResponse>('GET', '/api/v1/sales/dashboard', token, undefined, {
        query: {
          fromDate,
          toDate,
        },
      })
    },

    searchProducts(token: string, page = 0, size = 10) {
      return request<PageResult<ProductResponse>>('GET', '/api/v1/products', token, undefined, {
        query: {
          page,
          size,
        },
      })
    },

    createProduct(token: string, payload: CreateProductRequest) {
      return request<ProductResponse>('POST', '/api/v1/products', token, payload)
    },

    updateProduct(token: string, productUuid: string, payload: CreateProductRequest) {
      return request<ProductResponse>('PUT', `/api/v1/products/${productUuid}`, token, payload)
    },

    deleteProduct(token: string, productUuid: string) {
      return request<void>('DELETE', `/api/v1/products/${productUuid}`, token)
    },

    searchCustomers(token: string, page = 0, size = 10) {
      return request<PageResult<CustomerResponse>>('GET', '/api/v1/customers', token, undefined, {
        query: {
          page,
          size,
        },
      })
    },

    createCustomer(token: string, payload: CreateCustomerRequest) {
      return request<CustomerResponse>('POST', '/api/v1/customers', token, payload)
    },

    async searchFarmers(token: string, page = 0, size = 10) {
      const response = await request<unknown>('GET', '/api/v1/farmers', token, undefined, {
        query: {
          page,
          size,
        },
      })
      return normalizeFarmerPageResponse(response)
    },

    searchMilkCollections(token: string, page = 0, size = 10) {
      return request<
        PageResult<{
          uuid: string
          collectionNo: string
          farmerName: string
          farmerUuid?: string
          shiftUuid?: string
          milkTypeUuid?: string
          collectionDate: string
          collectionTime?: string
          quantity: number
          fat?: number | null
          snf?: number | null
          mava?: number | null
          entryMode?: ApiCollectionEntryMode | null
          remarks?: string | null
          grossAmount: number
        }>
      >('GET', '/api/v1/milk-collections', token, undefined, {
        query: {
          page,
          size,
        },
      })
    },

    createMilkCollection(token: string, payload: CreateMilkCollectionRequest) {
      return request<{
        uuid: string
        collectionNo: string
        farmerName: string
        farmerUuid?: string
        shiftUuid?: string
        milkTypeUuid?: string
        collectionDate: string
        collectionTime?: string
        quantity: number
        fat?: number | null
        snf?: number | null
        mava?: number | null
        entryMode?: ApiCollectionEntryMode | null
        remarks?: string | null
        grossAmount: number
      }>('POST', '/api/v1/milk-collections', token, payload)
    },

    updateMilkCollection(token: string, collectionUuid: string, payload: CreateMilkCollectionRequest) {
      return request<{
        uuid: string
        collectionNo: string
        farmerName: string
        farmerUuid?: string
        shiftUuid?: string
        milkTypeUuid?: string
        collectionDate: string
        collectionTime?: string
        quantity: number
        fat?: number | null
        snf?: number | null
        mava?: number | null
        entryMode?: ApiCollectionEntryMode | null
        remarks?: string | null
        grossAmount: number
      }>('PUT', `/api/v1/milk-collections/${collectionUuid}`, token, payload)
    },

    deleteMilkCollection(token: string, collectionUuid: string) {
      return request<void>('DELETE', `/api/v1/milk-collections/${collectionUuid}`, token)
    },

    searchSales(token: string, page = 0, size = 10) {
      return request<PageResult<SalesInvoiceResponse>>('GET', '/api/v1/sales', token, undefined, {
        query: {
          page,
          size,
        },
      })
    },

    createSalesInvoice(token: string, payload: CreateSalesInvoiceRequest) {
      return request<SalesInvoiceResponse>('POST', '/api/v1/sales', token, payload)
    },

    async searchInventoryTransactions(token: string, page = 0, size = 100) {
      const response = await request<unknown>('GET', '/api/v1/inventory', token, undefined, {
        query: {
          page,
          size,
        },
      })
      return normalizeInventoryTransactionListResponse(response)
    },

    async searchInventoryCurrentStock(token: string) {
      const response = await request<unknown>('GET', '/api/v1/inventory/current-stock', token)
      return normalizeInventoryCurrentStockListResponse(response)
    },

    async createInventoryTransaction(token: string, payload: CreateInventoryTransactionRequest) {
      const response = await request<unknown>('POST', '/api/v1/inventory', token, payload)
      return normalizeInventoryTransactionItemResponse(response)
    },

    createFarmer(token: string, payload: CreateFarmerRequest) {
      return request<FarmerResponse>('POST', '/api/v1/farmers', token, payload)
    },

    updateFarmer(token: string, farmerUuid: string, payload: CreateFarmerRequest) {
      return request<FarmerResponse>('PUT', `/api/v1/farmers/${farmerUuid}`, token, payload)
    },

    deleteFarmer(token: string, farmerUuid: string) {
      return request<void>('DELETE', `/api/v1/farmers/${farmerUuid}`, token)
    },
  }
}

function normalizeInventoryTransactionListResponse(
  payload: unknown,
): InventoryTransactionResponse[] {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => normalizeInventoryTransactionItemResponse(item))
      .filter((item): item is InventoryTransactionResponse => Boolean(item))
  }

  const payloadRecord = asRecord(payload)
  const content = payloadRecord?.content
  if (Array.isArray(content)) {
    return content
      .map((item) => normalizeInventoryTransactionItemResponse(item))
      .filter((item): item is InventoryTransactionResponse => Boolean(item))
  }

  const list = payloadRecord?.data
  if (Array.isArray(list)) {
    return list
      .map((item) => normalizeInventoryTransactionItemResponse(item))
      .filter((item): item is InventoryTransactionResponse => Boolean(item))
  }

  return []
}

function normalizeInventoryTransactionItemResponse(
  payload: unknown,
): InventoryTransactionResponse | null {
  const record = asRecord(payload)
  if (!record) {
    return null
  }

  const uuid = readString(record, 'uuid', 'id', 'inventoryUuid')
  const transactionDate = readString(record, 'transactionDate', 'date', 'entryDate')
  const productUuid = readString(record, 'productUuid', 'productId', 'itemUuid')

  if (!uuid || !transactionDate || !productUuid) {
    return null
  }

  const directionRaw = readString(record, 'direction', 'transactionType', 'type').toUpperCase()
  const direction: InventoryTransactionDirection =
    directionRaw === 'OUT' || directionRaw === 'ADJUSTMENT' ? directionRaw : 'IN'

  return {
    uuid,
    transactionDate,
    direction,
    productUuid,
    productCode: readString(record, 'productCode', 'itemCode', 'code'),
    productName: readString(record, 'productName', 'itemName', 'name'),
    quantity: readNumber(record, 'quantity', 'qty'),
    unitRate: readNumber(record, 'unitRate', 'rate', 'unitPrice'),
    amount: readNumber(record, 'amount', 'totalAmount', 'grossAmount'),
    referenceNo: readString(record, 'referenceNo', 'reference', 'voucherNo'),
    remarks: readString(record, 'remarks', 'note', 'description'),
  }
}

function normalizeInventoryCurrentStockListResponse(
  payload: unknown,
): InventoryCurrentStockResponse[] {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => normalizeInventoryCurrentStockItemResponse(item))
      .filter((item): item is InventoryCurrentStockResponse => Boolean(item))
  }

  const payloadRecord = asRecord(payload)
  const content = payloadRecord?.content
  if (Array.isArray(content)) {
    return content
      .map((item) => normalizeInventoryCurrentStockItemResponse(item))
      .filter((item): item is InventoryCurrentStockResponse => Boolean(item))
  }

  const list = payloadRecord?.data
  if (Array.isArray(list)) {
    return list
      .map((item) => normalizeInventoryCurrentStockItemResponse(item))
      .filter((item): item is InventoryCurrentStockResponse => Boolean(item))
  }

  return []
}

function normalizeInventoryCurrentStockItemResponse(
  payload: unknown,
): InventoryCurrentStockResponse | null {
  const record = asRecord(payload)
  if (!record) return null

  const productUuid = readString(record, 'productUuid', 'productId', 'itemUuid', 'uuid')
  const productCode = readString(record, 'productCode', 'itemCode', 'code')
  const productName = readString(record, 'productName', 'itemName', 'name')
  const currentStock = readNumber(record, 'currentStock', 'stock', 'quantity', 'balanceQty', 'availableQty')

  if (!productUuid && !productCode && !productName) {
    return null
  }

  return {
    productUuid: productUuid || productCode || productName,
    productCode,
    productName,
    currentStock,
  }
}
