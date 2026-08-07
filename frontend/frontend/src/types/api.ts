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
  tenantUuid: string
  defaultTenantUuid: string
  companyUuid: string
  companyName: string
  branchUuid: string
  branchName: string
  accessibleTenants: string[]
}

export type TenantShopResponse = {
  uuid: string
  code: string
  name: string
  role: string
  isPrimary: boolean
  isOwner: boolean
  isAdmin: boolean
  active: boolean
  createdAt: string
}

export type PublicOnboardRequest = {
  companyName: string
  companyCode: string
  ownerName: string
  ownerMobile: string
  ownerEmail: string
  adminUsername: string
  adminPassword: string
  city: string
  state: string
}

export type PublicOnboardResponse = {
  tenantUuid: string
  companyName: string
  companyCode: string
  adminUsername: string
  message: string
}

export type TenantResponse = {
  uuid: string
  code: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type CreateTenantRequest = {
  code: string
  name: string
}

export type UpdateTenantRequest = {
  code: string
  name: string
}

export type SmartDairyConfigurationResponse = {
  uuid: string
  collectionFat: boolean
  collectionMava: boolean
  morningCollectionLimit: number
  eveningCollectionLimit: number
  allowMultipleCollection: boolean
  allowLoan: boolean
  allowAdvance: boolean
  allowLoanAndAdvanceTogether: boolean
  dailyPayment: boolean
  weeklyPayment: boolean
  monthlyPayment: boolean
  allowBackdatedEntry: boolean
  maxBackdatedDays: number
  autoLock: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export type CreateSmartDairyConfigurationRequest = {
  collectionFat: boolean
  collectionMava: boolean
  morningCollectionLimit: number
  eveningCollectionLimit: number
  allowMultipleCollection: boolean
  allowLoan: boolean
  allowAdvance: boolean
  allowLoanAndAdvanceTogether: boolean
  dailyPayment: boolean
  weeklyPayment: boolean
  monthlyPayment: boolean
  allowBackdatedEntry: boolean
  maxBackdatedDays: number
  autoLock: boolean
}

export type UpdateSmartDairyConfigurationRequest = CreateSmartDairyConfigurationRequest

export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT'
export type ApiCollectionEntryMode = 'SINGLE' | 'MULTI'
export type SettlementStatus = 'GENERATED' | 'PAID'

export type SettlementSearchRequest = {
  farmerUuid?: string
  status?: SettlementStatus
  fromDate?: string
  toDate?: string
}

export type CreateSettlementRequest = {
  farmerUuid: string
  fromDate: string
  toDate: string
  bonusAmount: number
  loanRecovery: number
  advanceRecovery: number
  otherDeduction: number
  remarks: string
}

export type UpdateSettlementRequest = {
  bonusAmount: number
  loanRecovery: number
  advanceRecovery: number
  otherDeduction: number
  remarks: string
}

export type SettlementResponse = {
  uuid: string
  settlementNo: string
  farmerUuid: string
  farmerCode: string
  farmerName: string
  fromDate: string
  toDate: string
  milkAmount: number
  bonusAmount: number
  loanRecovery: number
  advanceRecovery: number
  otherDeduction: number
  netPayable: number
  status: SettlementStatus
  remarks: string | null
}

export type CreatePaymentRequest = {
  settlementUuid: string
  paymentDate: string
  paymentMode: PaymentMode
  remarks: string
}

export type PaymentResponse = {
  uuid: string
  paymentNo: string
  settlementUuid: string
  settlementNo: string
  farmerUuid: string
  farmerCode: string
  farmerName: string
  paymentDate: string
  paidAmount: number
  paymentMode: PaymentMode
  remarks: string | null
}

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

export type InventoryTransactionDirection = 'IN' | 'OUT' | 'ADJUSTMENT'

export type InventoryTransactionResponse = {
  uuid: string
  transactionDate: string
  direction: InventoryTransactionDirection
  productUuid: string
  productCode: string
  productName: string
  quantity: number
  unitRate: number
  amount: number
  referenceNo: string
  remarks: string
}

export type InventoryCurrentStockResponse = {
  productUuid: string
  productCode: string
  productName: string
  currentStock: number
}

export type CreateInventoryTransactionRequest = {
  transactionDate: string
  direction: InventoryTransactionDirection
  productUuid: string
  quantity: number
  unitRate: number
  referenceNo: string
  remarks: string
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

export type ShiftResponse = {
  uuid: string
  code: string
  name: string
  description: string | null
  displayOrder: number | null
  active: boolean
}

export type CreateShiftRequest = {
  code: string
  name: string
  description: string
  displayOrder: number
}

export type MasterLookupResponse = {
  uuid: string
  code: string
  name: string
  description: string | null
}

export type CollectionMethodResponse = {
  uuid: string
  code: string
  name: string
  description: string | null
  displayOrder: number | null
  active: boolean
}

export type PaymentCycleResponse = {
  uuid: string
  code: string
  name: string
  description: string | null
  displayOrder: number | null
  active: boolean
}

export type CreateCollectionMethodRequest = {
  code: string
  name: string
  description: string
  displayOrder?: number
}

export type UpdateCollectionMethodRequest = {
  code: string
  name: string
  description: string
  displayOrder?: number
}

export type CreatePaymentCycleRequest = {
  code: string
  name: string
  description: string
  displayOrder?: number
}

export type UpdatePaymentCycleRequest = {
  code: string
  name: string
  description: string
  displayOrder?: number
}

export type RateCategoryResponse = {
  uuid: string
  code: string
  name: string
  description: string | null
  displayOrder: number | null
  active: boolean
}

export type CreateRateCategoryRequest = {
  code: string
  name: string
  description: string
  displayOrder?: number
}

export type UpdateRateCategoryRequest = {
  code: string
  name: string
  description: string
  displayOrder?: number
}

export type CreateMilkRateChartDetailRequest = {
  fatFrom: number | null
  fatTo: number | null
  snfFrom: number | null
  snfTo: number | null
  mavaFrom: number | null
  mavaTo: number | null
  rate: number
}

export type CreateMilkRateChartRequest = {
  branchUuid: string
  rateCategoryUuid: string
  collectionMethodUuid: string
  chartName: string
  effectiveFrom: string
  effectiveTo: string
  remarks: string
  details: CreateMilkRateChartDetailRequest[]
}

export type MilkRateChartDetailResponse = {
  uuid: string
  fatFrom: number | null
  fatTo: number | null
  snfFrom: number | null
  snfTo: number | null
  mavaFrom: number | null
  mavaTo: number | null
  rate: number
}

export type MilkRateChartResponse = {
  uuid: string
  branchUuid: string
  rateCategoryUuid: string
  collectionMethodUuid: string
  chartName: string
  effectiveFrom: string
  effectiveTo: string | null
  remarks: string | null
  active: boolean
  details: MilkRateChartDetailResponse[]
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
  entryMode?: ApiCollectionEntryMode
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
  alternateMobileNo?: string
  email?: string
  address?: string
  village?: string
  taluka?: string
  district?: string
  state?: string
  pincode?: string
  aadharNo?: string
  panNo?: string
  photoUrl?: string
  remarks?: string
  milkTypeUuid?: string
  milkRateChartUuid?: string | null
  collectionMethodUuid?: string
  paymentCycleUuid?: string
  rateCategoryUuid?: string
  configEffectiveFrom?: string
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
  milkTypeUuid: string
  milkRateChartUuid: string
  collectionMethodUuid: string
  paymentCycleUuid: string
  rateCategoryUuid: string
  configEffectiveFrom: string
}