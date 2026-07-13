export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export type PageResult<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

export type AuthTokenResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number
  username: string
  role: string
}

export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT'

export type SalesDashboardResponse = {
  totalInvoices: number
  totalSales: number
  totalDiscount: number
  netSales: number
  averageInvoiceValue: number
}

export type ProductResponse = {
  uuid: string
  productCode: string
  productName: string
  productType: 'RAW_MILK' | 'FINISHED_PRODUCT'
  unitType: 'LITER' | 'KILOGRAM' | 'GRAM' | 'PIECE'
  description: string | null
  purchasePrice: number
  sellingPrice: number
  minimumStock: number
  active: boolean
}

export type CreateProductRequest = {
  productCode: string
  productName: string
  productType: 'RAW_MILK' | 'FINISHED_PRODUCT'
  unitType: 'LITER' | 'KILOGRAM' | 'GRAM' | 'PIECE'
  description: string
  purchasePrice: number
  sellingPrice: number
  minimumStock: number
}

export type CustomerResponse = {
  uuid: string
  customerCode: string
  customerName: string
  mobileNo: string
  city: string | null
  currentBalance: number
  active: boolean
}

export type CreateCustomerRequest = {
  branchUuid: string
  customerName: string
  mobileNo: string
  alternateMobileNo: string
  email: string
  address: string
  city: string
  state: string
  pincode: string
  gstNo: string
  creditLimit: number
  openingBalance: number
}

export type MilkTypeResponse = {
  uuid: string
  code: string
  name: string
  description: string | null
}

export type CreateMilkCollectionRequest = {
  farmerUuid: string
  shiftUuid: string
  milkTypeUuid: string
  collectionDate: string
  collectionTime: string
  quantity: number
  fat: number | null
  snf: number | null
  mava: number | null
  remarks: string
}

export type CreateSalesInvoiceItemRequest = {
  productUuid: string
  quantity: number
  unitPrice: number
}

export type SalesInvoiceResponse = {
  uuid: string
  invoiceNo: string
  invoiceDate: string
  customerUuid: string
  customerCode: string
  customerName: string
  customerMobile: string
  paymentMode: PaymentMode
  totalAmount: number
  discountAmount: number
  netAmount: number
  status: 'DRAFT' | 'COMPLETED' | 'LOCKED' | 'CANCELLED'
  remarks: string | null
  items: {
    uuid: string
    productUuid: string
    productCode: string
    productName: string
    quantity: number
    unitPrice: number
    amount: number
  }[]
}

export type CreateSalesInvoiceRequest = {
  branchUuid: string
  invoiceDate: string
  customerUuid: string
  paymentMode: PaymentMode
  discountAmount: number
  remarks: string
  items: CreateSalesInvoiceItemRequest[]
}

export type FarmerResponse = {
  uuid: string
  branchUuid: string
  farmerCode: string
  farmerName: string
  mobileNo: string
}

export type CreateFarmerRequest = {
  branchUuid: string
  farmerCode: string
  farmerName: string
  mobileNo: string
  alternateMobileNo: string
  email: string
  address: string
  village: string
  taluka: string
  district: string
  state: string
  pincode: string
  aadharNo: string
  panNo: string
  photoUrl: string
  remarks: string
}