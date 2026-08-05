import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'react'
import { CollectionMethodsPanel } from './CollectionMethodsPanel'
import { CustomersPage } from './CustomersPage'
import { DashboardPage } from './DashboardPage'
import { FarmersPage } from './FarmersPage'
import { InventoryTransactionsPage } from './InventoryTransactionsPage'
import { MilkCollectionsPage } from './MilkCollectionsPage'
import { MilkRateChartsPage } from './MilkRateChartsPage'
import { PaymentCyclesPanel } from './PaymentCyclesPanel'
import { ProductsPage } from './ProductsPage'
import { RateProfilesPage } from './RateProfilesPage'
import { SalesPage } from './SalesPage'
import { ShiftsPanel } from './ShiftsPanel'
import { TenantsPage } from './TenantsPage'
import type {
  CollectionMethodResponse,
  CreateInventoryTransactionRequest,
  CreateCollectionMethodRequest,
  CreateMilkRateChartRequest,
  CreatePaymentCycleRequest,
  CreateRateCategoryRequest,
  CreateSalesInvoiceItemRequest,
  CreateShiftRequest,
  CreateTenantRequest,
  CustomerResponse,
  FarmerResponse,
  InventoryCurrentStockResponse,
  InventoryTransactionResponse,
  MilkRateChartResponse,
  MilkTypeResponse,
  PaymentCycleResponse,
  PaymentMode,
  ProductResponse,
  RateCategoryResponse,
  SalesDashboardResponse,
  SalesInvoiceResponse,
  ShiftResponse,
  TenantResponse,
} from '../types/api'
import type { CollectionEntryMode } from '../lib/collectionEntryMode'

type TabKey =
  | 'dashboard'
  | 'products'
  | 'customers'
  | 'milkCollections'
  | 'sales'
  | 'farmers'
  | 'tenants'

type CollectionListItem = {
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
  remarks?: string | null
  entryMode?: CollectionEntryMode
  grossAmount: number
}

type DashboardRangeState = {
  fromDate: string
  toDate: string
}

type ProductFormState = {
  productCode: string
  productName: string
  productType: 'RAW_MILK' | 'FINISHED_PRODUCT'
  unitType: 'LITER' | 'KILOGRAM' | 'GRAM' | 'PIECE'
  description: string
  purchasePrice: number
  sellingPrice: number
  minimumStock: number
}

type CustomerFormState = {
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

type CollectionFormState = {
  collectionNo: string
  farmerUuid: string
  shiftUuid: string
  milkTypeUuid: string
  collectionDate: string
  collectionTime: string
  quantity: number
  rate: number
  fat: number
  snf: number | null
  mava: number
  remarks: string
}

type SalesFormState = {
  branchUuid: string
  invoiceDate: string
  customerUuid: string
  paymentMode: PaymentMode
  discountAmount: number
  remarks: string
  items: CreateSalesInvoiceItemRequest[]
}

type CollectionQualityVisibility = {
  showFat: boolean
  showSnf: boolean
  showMava: boolean
}

type MilkRateQualityVisibility = {
  showFat: boolean
  showSnf: boolean
  showMava: boolean
}

type MilkRateRowConflictState = {
  conflictingRows: number[]
  messages: string[]
}

type WorkspacePanelGridProps = {
  activeTab: TabKey
  activeSidebarMenu: string
  busy: boolean
  dashboard: SalesDashboardResponse | null
  dashboardRange: DashboardRangeState
  setDashboardRange: Dispatch<SetStateAction<DashboardRangeState>>
  collections: CollectionListItem[]
  farmers: FarmerResponse[]
  products: ProductResponse[]
  customers: CustomerResponse[]
  sales: SalesInvoiceResponse[]
  inventoryTransactions: InventoryTransactionResponse[]
  inventoryCurrentStock: InventoryCurrentStockResponse[]
  loadDashboard: () => void | Promise<void>
  openPrimarySection: (section: TabKey) => void
  productForm: ProductFormState
  setProductForm: Dispatch<SetStateAction<ProductFormState>>
  averageProductSellingPrice: number
  nextProductCode: string
  loadProducts: () => void | Promise<void>
  editingProductUuid: string
  onCreateProduct: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onEditProduct: (item: ProductResponse) => void
  onCancelProductEdit: () => void
  onDeleteProduct: (item: ProductResponse) => void | Promise<void>
  branchName: string
  branchUuid: string
  customerForm: CustomerFormState
  setCustomerForm: Dispatch<SetStateAction<CustomerFormState>>
  loadCustomers: () => void | Promise<void>
  onCreateCustomer: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  collectionForm: CollectionFormState
  setCollectionForm: Dispatch<SetStateAction<CollectionFormState>>
  shifts: ShiftResponse[]
  milkTypes: MilkTypeResponse[]
  collectionQualityVisibility: CollectionQualityVisibility
  calculatedCollectionRate: number
  calculatedCollectionAmount: number
  isCollectionDateWithinRateChart: boolean
  onCollectionFarmerChange: (event: ChangeEvent<HTMLSelectElement>) => void | Promise<void>
  onCreateCollection: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onCreateMultipleCollections: (entries: {
    farmerUuid: string
    quantity: number
    fat: number
    snf: number | null
    mava: number
    remarks: string
  }[], shiftUuid: string) => void | Promise<void>
  editingCollectionUuid: string
  onEditCollection: (item: CollectionListItem) => void
  onCancelCollectionEdit: () => void
  onDeleteCollection: (item: CollectionListItem) => void | Promise<void>
  loadCollections: () => void | Promise<void>
  loadInventoryTransactions: () => void | Promise<void>
  loadInventoryCurrentStock: () => void | Promise<void>
  onCreateInventoryTransaction: (
    payload: CreateInventoryTransactionRequest,
  ) => void | Promise<void>
  collectionMethods: CollectionMethodResponse[]
  collectionMethodForm: CreateCollectionMethodRequest
  editingCollectionMethodUuid: string
  setCollectionMethodForm: Dispatch<SetStateAction<CreateCollectionMethodRequest>>
  onSubmitCollectionMethod: () => void | Promise<void>
  onCancelCollectionMethodEdit: () => void
  onEditCollectionMethod: (item: CollectionMethodResponse) => void
  onDeleteCollectionMethod: (item: CollectionMethodResponse) => void | Promise<void>
  loadCollectionMethodsView: () => void | Promise<void>
  paymentCycles: PaymentCycleResponse[]
  paymentCycleForm: CreatePaymentCycleRequest
  editingPaymentCycleUuid: string
  setPaymentCycleForm: Dispatch<SetStateAction<CreatePaymentCycleRequest>>
  onSubmitPaymentCycle: () => void | Promise<void>
  onCancelPaymentCycleEdit: () => void
  onEditPaymentCycle: (item: PaymentCycleResponse) => void
  onDeletePaymentCycle: (item: PaymentCycleResponse) => void | Promise<void>
  loadPaymentCyclesView: () => void | Promise<void>
  shiftForm: CreateShiftRequest
  setShiftForm: Dispatch<SetStateAction<CreateShiftRequest>>
  onSubmitShift: () => void | Promise<void>
  loadShiftsView: () => void | Promise<void>
  rateCategories: RateCategoryResponse[]
  rateCategoryForm: CreateRateCategoryRequest
  setRateCategoryForm: Dispatch<SetStateAction<CreateRateCategoryRequest>>
  editingRateCategoryUuid: string
  loadMilkRateLookups: () => void | Promise<void>
  onSubmitRateCategory: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onCancelRateCategoryEdit: () => void
  onEditRateCategory: (item: RateCategoryResponse) => void
  onDeleteRateCategory: (item: RateCategoryResponse) => void | Promise<void>
  currentShopName: string
  milkRateForm: CreateMilkRateChartRequest
  setMilkRateForm: Dispatch<SetStateAction<CreateMilkRateChartRequest>>
  editingMilkRateChartUuid: string
  milkRateCharts: MilkRateChartResponse[]
  milkRateQualityVisibility: MilkRateQualityVisibility
  milkRateRowConflictState: MilkRateRowConflictState
  loadMilkRateChartsView: () => void | Promise<void>
  onCreateMilkRateChart: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  updateMilkRateDetail: (
    index: number,
    key: keyof CreateMilkRateChartRequest['details'][number],
    value: number | null,
  ) => void
  removeMilkRateDetailRow: (index: number) => void
  addMilkRateDetailRow: () => void
  setMavaFromRef: (index: number, element: HTMLInputElement | null) => void
  onCancelMilkRateChartEdit: () => void
  onEditMilkRateChart: (item: MilkRateChartResponse) => void
  onDeleteMilkRateChart: (item: MilkRateChartResponse) => void
  salesForm: SalesFormState
  setSalesForm: Dispatch<SetStateAction<SalesFormState>>
  salesCustomerInput: string
  onSalesCustomerInputChange: (value: string) => void
  loadSales: () => void | Promise<void>
  onCreateSales: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  addSalesItemRow: () => void
  updateSalesItem: (index: number, field: 'productUuid' | 'quantity' | 'unitPrice', value: string) => void
  paymentModes: PaymentMode[]
  farmerForm: React.ComponentProps<typeof FarmersPage>['farmerForm']
  setFarmerForm: React.ComponentProps<typeof FarmersPage>['setFarmerForm']
  editingFarmerUuid: string
  farmerRateCharts: MilkRateChartResponse[]
  selectedFarmerRateChartUuid: string
  setSelectedFarmerRateChartUuid: (value: string) => void
  farmerMappedFieldError: string
  setFarmerMappedFieldError: (value: string) => void
  loadFarmers: () => void | Promise<void>
  onCreateFarmer: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onCancelFarmerEdit: () => void
  onEditFarmer: (item: FarmerResponse) => void
  onDeleteFarmer: (item: FarmerResponse) => void | Promise<void>
  tenants: TenantResponse[]
  tenantForm: CreateTenantRequest
  setTenantForm: Dispatch<SetStateAction<CreateTenantRequest>>
  editingTenantUuid: string
  loadTenants: () => void | Promise<void>
  onSubmitTenant: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onEditTenant: (item: TenantResponse) => void
  onCancelTenantEdit: () => void
}

export function WorkspacePanelGrid({
  activeTab,
  activeSidebarMenu,
  busy,
  dashboard,
  dashboardRange,
  setDashboardRange,
  collections,
  farmers,
  products,
  customers,
  sales,
  inventoryTransactions,
  inventoryCurrentStock,
  loadDashboard,
  openPrimarySection,
  productForm,
  setProductForm,
  averageProductSellingPrice,
  nextProductCode,
  loadProducts,
  editingProductUuid,
  onCreateProduct,
  onEditProduct,
  onCancelProductEdit,
  onDeleteProduct,
  branchName,
  branchUuid,
  customerForm,
  setCustomerForm,
  loadCustomers,
  onCreateCustomer,
  collectionForm,
  setCollectionForm,
  shifts,
  milkTypes,
  collectionQualityVisibility,
  calculatedCollectionRate,
  calculatedCollectionAmount,
  isCollectionDateWithinRateChart,
  onCollectionFarmerChange,
  onCreateCollection,
  onCreateMultipleCollections,
  editingCollectionUuid,
  onEditCollection,
  onCancelCollectionEdit,
  onDeleteCollection,
  loadCollections,
  loadInventoryTransactions,
  loadInventoryCurrentStock,
  onCreateInventoryTransaction,
  collectionMethods,
  collectionMethodForm,
  editingCollectionMethodUuid,
  setCollectionMethodForm,
  onSubmitCollectionMethod,
  onCancelCollectionMethodEdit,
  onEditCollectionMethod,
  onDeleteCollectionMethod,
  loadCollectionMethodsView,
  paymentCycles,
  paymentCycleForm,
  editingPaymentCycleUuid,
  setPaymentCycleForm,
  onSubmitPaymentCycle,
  onCancelPaymentCycleEdit,
  onEditPaymentCycle,
  onDeletePaymentCycle,
  loadPaymentCyclesView,
  shiftForm,
  setShiftForm,
  onSubmitShift,
  loadShiftsView,
  rateCategories,
  rateCategoryForm,
  setRateCategoryForm,
  editingRateCategoryUuid,
  loadMilkRateLookups,
  onSubmitRateCategory,
  onCancelRateCategoryEdit,
  onEditRateCategory,
  onDeleteRateCategory,
  currentShopName,
  milkRateForm,
  setMilkRateForm,
  editingMilkRateChartUuid,
  milkRateCharts,
  milkRateQualityVisibility,
  milkRateRowConflictState,
  loadMilkRateChartsView,
  onCreateMilkRateChart,
  updateMilkRateDetail,
  removeMilkRateDetailRow,
  addMilkRateDetailRow,
  setMavaFromRef,
  onCancelMilkRateChartEdit,
  onEditMilkRateChart,
  onDeleteMilkRateChart,
  salesForm,
  setSalesForm,
  salesCustomerInput,
  onSalesCustomerInputChange,
  loadSales,
  onCreateSales,
  addSalesItemRow,
  updateSalesItem,
  paymentModes,
  farmerForm,
  setFarmerForm,
  editingFarmerUuid,
  farmerRateCharts,
  selectedFarmerRateChartUuid,
  setSelectedFarmerRateChartUuid,
  farmerMappedFieldError,
  setFarmerMappedFieldError,
  loadFarmers,
  onCreateFarmer,
  onCancelFarmerEdit,
  onEditFarmer,
  onDeleteFarmer,
  tenants,
  tenantForm,
  setTenantForm,
  editingTenantUuid,
  loadTenants,
  onSubmitTenant,
  onEditTenant,
  onCancelTenantEdit,
}: WorkspacePanelGridProps) {
  return (
    <main className="panel-grid">
      {activeTab === 'dashboard' && activeSidebarMenu === 'dashboard' && (
        <DashboardPage
          busy={busy}
          dashboard={dashboard}
          dashboardRange={dashboardRange}
          setDashboardRange={setDashboardRange}
          collections={collections}
          farmers={farmers}
          products={products}
          customers={customers}
          sales={sales}
          loadDashboard={loadDashboard}
          onOpenSection={openPrimarySection}
        />
      )}

      {activeTab === 'products' && activeSidebarMenu === 'products' && (
        <ProductsPage
          busy={busy}
          products={products}
          productForm={productForm}
          setProductForm={setProductForm}
          averageProductSellingPrice={averageProductSellingPrice}
          nextProductCode={nextProductCode}
          loadProducts={loadProducts}
          editingProductUuid={editingProductUuid}
          onCreateProduct={onCreateProduct}
          onEditProduct={onEditProduct}
          onCancelProductEdit={onCancelProductEdit}
          onDeleteProduct={onDeleteProduct}
        />
      )}

      {activeTab === 'customers' && activeSidebarMenu === 'customers' && (
        <CustomersPage
          busy={busy}
          customers={customers}
          branchDisplay={branchName || branchUuid || customerForm.branchUuid}
          customerForm={customerForm}
          setCustomerForm={setCustomerForm}
          loadCustomers={loadCustomers}
          onCreateCustomer={onCreateCustomer}
        />
      )}

      {activeTab === 'milkCollections' && activeSidebarMenu === 'milkCollections' && (
        <MilkCollectionsPage
          busy={busy}
          collectionForm={collectionForm}
          setCollectionForm={setCollectionForm}
          farmers={farmers}
          shifts={shifts}
          milkTypes={milkTypes}
          milkRateCharts={milkRateCharts}
          collections={collections}
          collectionQualityVisibility={collectionQualityVisibility}
          calculatedCollectionRate={calculatedCollectionRate}
          calculatedCollectionAmount={calculatedCollectionAmount}
          isCollectionDateWithinRateChart={isCollectionDateWithinRateChart}
          onCollectionFarmerChange={onCollectionFarmerChange}
          onOpenFarmerFromCollection={() => openPrimarySection('farmers')}
          onCreateCollection={onCreateCollection}
          onCreateMultipleCollections={onCreateMultipleCollections}
          editingCollectionUuid={editingCollectionUuid}
          onEditCollection={onEditCollection}
          onCancelCollectionEdit={onCancelCollectionEdit}
          onDeleteCollection={onDeleteCollection}
          loadCollections={loadCollections}
        />
      )}

      {activeSidebarMenu === 'collectionMethods' && (
        <CollectionMethodsPanel
          busy={busy}
          methods={collectionMethods}
          form={collectionMethodForm}
          editingUuid={editingCollectionMethodUuid}
          onFormChange={setCollectionMethodForm}
          onSubmit={onSubmitCollectionMethod}
          onCancelEdit={onCancelCollectionMethodEdit}
          onEdit={onEditCollectionMethod}
          onDelete={onDeleteCollectionMethod}
          loadCollectionMethodsView={loadCollectionMethodsView}
        />
      )}

      {activeSidebarMenu === 'paymentCycles' && (
        <PaymentCyclesPanel
          busy={busy}
          cycles={paymentCycles}
          form={paymentCycleForm}
          editingUuid={editingPaymentCycleUuid}
          onFormChange={setPaymentCycleForm}
          onSubmit={onSubmitPaymentCycle}
          onCancelEdit={onCancelPaymentCycleEdit}
          onEdit={onEditPaymentCycle}
          onDelete={onDeletePaymentCycle}
          loadPaymentCyclesView={loadPaymentCyclesView}
        />
      )}

      {activeSidebarMenu === 'shifts' && (
        <ShiftsPanel
          busy={busy}
          shifts={shifts}
          form={shiftForm}
          onFormChange={setShiftForm}
          onSubmit={onSubmitShift}
          loadShiftsView={loadShiftsView}
        />
      )}

      {activeSidebarMenu === 'rateProfiles' && (
        <RateProfilesPage
          busy={busy}
          rateCategories={rateCategories}
          rateCategoryForm={rateCategoryForm}
          setRateCategoryForm={setRateCategoryForm}
          editingRateCategoryUuid={editingRateCategoryUuid}
          loadMilkRateLookups={loadMilkRateLookups}
          onSubmitRateCategory={onSubmitRateCategory}
          onCancelRateCategoryEdit={onCancelRateCategoryEdit}
          onEditRateCategory={onEditRateCategory}
          onDeleteRateCategory={onDeleteRateCategory}
        />
      )}

      {activeSidebarMenu === 'milkRateCharts' && (
        <MilkRateChartsPage
          busy={busy}
          branchDisplay={branchName || currentShopName || milkRateForm.branchUuid}
          milkRateForm={milkRateForm}
          setMilkRateForm={setMilkRateForm}
          editingMilkRateChartUuid={editingMilkRateChartUuid}
          rateCategories={rateCategories}
          collectionMethods={collectionMethods}
          milkRateCharts={milkRateCharts}
          milkRateQualityVisibility={milkRateQualityVisibility}
          milkRateRowConflictState={milkRateRowConflictState}
          loadMilkRateLookups={loadMilkRateLookups}
          loadMilkRateChartsView={loadMilkRateChartsView}
          onCreateMilkRateChart={onCreateMilkRateChart}
          updateMilkRateDetail={updateMilkRateDetail}
          removeMilkRateDetailRow={removeMilkRateDetailRow}
          addMilkRateDetailRow={addMilkRateDetailRow}
          setMavaFromRef={setMavaFromRef}
          onCancelMilkRateChartEdit={onCancelMilkRateChartEdit}
          onEditMilkRateChart={onEditMilkRateChart}
          onDeleteMilkRateChart={onDeleteMilkRateChart}
        />
      )}

      {activeTab === 'sales' && activeSidebarMenu === 'sales' && (
        <SalesPage
          busy={busy}
          branchDisplay={branchName || branchUuid || salesForm.branchUuid}
          salesForm={salesForm}
          setSalesForm={setSalesForm}
          salesCustomerInput={salesCustomerInput}
          onSalesCustomerInputChange={onSalesCustomerInputChange}
          customers={customers}
          products={products}
          paymentModes={paymentModes}
          sales={sales}
          loadSales={loadSales}
          onCreateSales={onCreateSales}
          addSalesItemRow={addSalesItemRow}
          updateSalesItem={updateSalesItem}
        />
      )}

      {activeTab === 'farmers' && activeSidebarMenu === 'farmers' && (
        <FarmersPage
          busy={busy}
          farmers={farmers}
          branchUuid={branchUuid}
          branchName={branchName}
          farmerForm={farmerForm}
          setFarmerForm={setFarmerForm}
          editingFarmerUuid={editingFarmerUuid}
          farmerRateCharts={farmerRateCharts}
          selectedFarmerRateChartUuid={selectedFarmerRateChartUuid}
          setSelectedFarmerRateChartUuid={setSelectedFarmerRateChartUuid}
          farmerMappedFieldError={farmerMappedFieldError}
          setFarmerMappedFieldError={setFarmerMappedFieldError}
          milkTypes={milkTypes}
          paymentCycles={paymentCycles}
          loadFarmers={loadFarmers}
          onCreateFarmer={onCreateFarmer}
          onCancelFarmerEdit={onCancelFarmerEdit}
          onEditFarmer={onEditFarmer}
          onDeleteFarmer={onDeleteFarmer}
        />
      )}

      {activeTab === 'tenants' && activeSidebarMenu === 'tenants' && (
        <TenantsPage
          busy={busy}
          tenants={tenants}
          tenantForm={tenantForm}
          setTenantForm={setTenantForm}
          editingTenantUuid={editingTenantUuid}
          loadTenants={loadTenants}
          onSubmitTenant={onSubmitTenant}
          onEditTenant={onEditTenant}
          onCancelTenantEdit={onCancelTenantEdit}
        />
      )}

      {activeSidebarMenu === 'inventory' && (
        <InventoryTransactionsPage
          busy={busy}
          products={products}
          transactions={inventoryTransactions}
          currentStockRows={inventoryCurrentStock}
          loadInventoryTransactions={loadInventoryTransactions}
          loadInventoryCurrentStock={loadInventoryCurrentStock}
          onCreateInventoryTransaction={onCreateInventoryTransaction}
        />
      )}
    </main>
  )
}
