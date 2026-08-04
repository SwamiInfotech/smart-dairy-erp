import type {
  CreateCustomerRequest,
  CreateFarmerRequest,
  CreateMilkCollectionRequest,
  CreateProductRequest,
  CreateSalesInvoiceRequest,
  CustomerResponse,
  FarmerResponse,
  PageResult,
  ProductResponse,
  SalesDashboardResponse,
  SalesInvoiceResponse,
} from '../types/api'
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
          collectionDate: string
          quantity: number
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
        collectionDate: string
        quantity: number
        grossAmount: number
      }>('POST', '/api/v1/milk-collections', token, payload)
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
