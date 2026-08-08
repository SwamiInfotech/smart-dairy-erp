export type EndpointDefinition = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  note?: string
}

export type BackendModuleDefinition = {
  label: string
  endpoints: EndpointDefinition[]
}

export const BACKEND_MODULES: Record<string, BackendModuleDefinition> = {
  health: {
    label: 'Health',
    endpoints: [{ method: 'GET', path: '/api/v1/health' }],
  },
  auth: {
    label: 'Auth',
    endpoints: [
      { method: 'POST', path: '/api/v1/auth/login' },
      { method: 'GET', path: '/api/v1/auth/users', note: 'Admin scope' },
      { method: 'POST', path: '/api/v1/auth/users', note: 'Admin scope' },
    ],
  },
  tenants: {
    label: 'Tenants',
    endpoints: [
      { method: 'GET', path: '/api/v1/tenants' },
      { method: 'POST', path: '/api/v1/tenants' },
      { method: 'GET', path: '/api/v1/tenants/{tenantUuid}' },
      { method: 'PUT', path: '/api/v1/tenants/{tenantUuid}', note: 'Phase 2 backend support' },
    ],
  },
  configuration: {
    label: 'Configuration',
    endpoints: [
      { method: 'GET', path: '/api/v1/smart-dairy-configuration/current/tenant' },
      { method: 'GET', path: '/api/v1/smart-dairy-configuration/{uuid}' },
      { method: 'POST', path: '/api/v1/smart-dairy-configuration' },
      { method: 'PUT', path: '/api/v1/smart-dairy-configuration/{uuid}' },
      { method: 'DELETE', path: '/api/v1/smart-dairy-configuration/{uuid}' },
    ],
  },
  companies: {
    label: 'Companies',
    endpoints: [
      { method: 'GET', path: '/api/v1/companies' },
      { method: 'POST', path: '/api/v1/companies' },
      { method: 'PUT', path: '/api/v1/companies/{uuid}' },
      { method: 'DELETE', path: '/api/v1/companies/{uuid}' },
    ],
  },
  branches: {
    label: 'Branches',
    endpoints: [
      { method: 'GET', path: '/api/v1/branches' },
      { method: 'POST', path: '/api/v1/branches' },
      { method: 'PUT', path: '/api/v1/branches/{uuid}' },
      { method: 'DELETE', path: '/api/v1/branches/{uuid}' },
    ],
  },
  farmers: {
    label: 'Farmers',
    endpoints: [
      { method: 'GET', path: '/api/v1/farmers' },
      { method: 'POST', path: '/api/v1/farmers' },
      { method: 'PUT', path: '/api/v1/farmers/{uuid}' },
      { method: 'DELETE', path: '/api/v1/farmers/{uuid}' },
    ],
  },
  farmerConfigurations: {
    label: 'Farmer Configurations',
    endpoints: [
      { method: 'GET', path: '/api/v1/farmer-configurations' },
      { method: 'POST', path: '/api/v1/farmer-configurations' },
      { method: 'PUT', path: '/api/v1/farmer-configurations/{uuid}' },
      { method: 'DELETE', path: '/api/v1/farmer-configurations/{uuid}' },
    ],
  },
  milkCollections: {
    label: 'Milk Collections',
    endpoints: [
      { method: 'GET', path: '/api/v1/milk-collections' },
      { method: 'POST', path: '/api/v1/milk-collections' },
      { method: 'POST', path: '/api/v1/milk-collections/bulk' },
      { method: 'PUT', path: '/api/v1/milk-collections/{uuid}' },
      { method: 'DELETE', path: '/api/v1/milk-collections/{uuid}' },
    ],
  },
  productionBatches: {
    label: 'Production Batches',
    endpoints: [
      { method: 'GET', path: '/api/v1/production-batches' },
      { method: 'POST', path: '/api/v1/production-batches' },
      { method: 'PUT', path: '/api/v1/production-batches/{uuid}' },
      { method: 'DELETE', path: '/api/v1/production-batches/{uuid}' },
    ],
  },
  inventory: {
    label: 'Inventory',
    endpoints: [
      { method: 'GET', path: '/api/v1/inventory' },
      { method: 'POST', path: '/api/v1/inventory' },
      { method: 'PUT', path: '/api/v1/inventory/{uuid}' },
      { method: 'DELETE', path: '/api/v1/inventory/{uuid}' },
    ],
  },
  products: {
    label: 'Products',
    endpoints: [
      { method: 'GET', path: '/api/v1/products' },
      { method: 'POST', path: '/api/v1/products' },
      { method: 'PUT', path: '/api/v1/products/{uuid}' },
      { method: 'DELETE', path: '/api/v1/products/{uuid}' },
    ],
  },
  customers: {
    label: 'Customers',
    endpoints: [
      { method: 'GET', path: '/api/v1/customers' },
      { method: 'POST', path: '/api/v1/customers' },
      { method: 'PUT', path: '/api/v1/customers/{uuid}' },
      { method: 'DELETE', path: '/api/v1/customers/{uuid}' },
      { method: 'GET', path: '/api/v1/customer-payments' },
      { method: 'POST', path: '/api/v1/customer-payments' },
    ],
  },
  sales: {
    label: 'Sales',
    endpoints: [
      { method: 'GET', path: '/api/v1/sales' },
      { method: 'POST', path: '/api/v1/sales' },
      { method: 'GET', path: '/api/v1/sales/dashboard' },
      { method: 'PUT', path: '/api/v1/sales/{uuid}' },
      { method: 'DELETE', path: '/api/v1/sales/{uuid}' },
    ],
  },
  loans: {
    label: 'Loans',
    endpoints: [
      { method: 'GET', path: '/api/v1/loans' },
      { method: 'POST', path: '/api/v1/loans' },
      { method: 'PUT', path: '/api/v1/loans/{uuid}' },
      { method: 'DELETE', path: '/api/v1/loans/{uuid}' },
    ],
  },
  settlements: {
    label: 'Settlements',
    endpoints: [
      { method: 'GET', path: '/api/v1/settlements' },
      { method: 'POST', path: '/api/v1/settlements/generate' },
      { method: 'GET', path: '/api/v1/settlements/{uuid}' },
      { method: 'PUT', path: '/api/v1/settlements/{uuid}' },
      { method: 'DELETE', path: '/api/v1/settlements/{uuid}' },
      { method: 'PATCH', path: '/api/v1/settlements/{uuid}/pay' },
      { method: 'GET', path: '/api/v1/settlements/{uuid}/pdf' },
    ],
  },
  payments: {
    label: 'Payments',
    endpoints: [
      { method: 'GET', path: '/api/v1/payments' },
      { method: 'GET', path: '/api/v1/payments/{uuid}' },
      { method: 'POST', path: '/api/v1/payments' },
    ],
  },
  reports: {
    label: 'Reports',
    endpoints: [
      { method: 'GET', path: '/api/v1/reports' },
      { method: 'GET', path: '/api/v1/reports/daily-sales' },
      { method: 'GET', path: '/api/v1/reports/daily-milk-collection' },
      { method: 'GET', path: '/api/v1/reports/settlement-summary' },
    ],
  },
  master: {
    label: 'Master',
    endpoints: [
      { method: 'GET', path: '/api/v1/master/milk-types' },
      { method: 'GET', path: '/api/v1/master/collection-methods' },
      { method: 'GET', path: '/api/v1/master/shifts' },
      { method: 'GET', path: '/api/v1/master/rate-categories' },
    ],
  },
  collectionMethods: {
    label: 'Collection Methods',
    endpoints: [
      { method: 'GET', path: '/api/v1/master/collection-methods' },
      { method: 'POST', path: '/api/v1/master/collection-methods' },
      { method: 'PUT', path: '/api/v1/master/collection-methods/{uuid}' },
      { method: 'DELETE', path: '/api/v1/master/collection-methods/{uuid}' },
    ],
  },
  paymentCycles: {
    label: 'Farmer Billing/Payment Cycles',
    endpoints: [
      { method: 'GET', path: '/api/v1/payment-cycles' },
      { method: 'POST', path: '/api/v1/payment-cycles' },
      { method: 'GET', path: '/api/v1/payment-cycles/{uuid}' },
      { method: 'PUT', path: '/api/v1/payment-cycles/{uuid}' },
      { method: 'DELETE', path: '/api/v1/payment-cycles/{uuid}' },
    ],
  },
  pricing: {
    label: 'Pricing',
    endpoints: [
      { method: 'GET', path: '/api/v1/pricing' },
      { method: 'POST', path: '/api/v1/pricing' },
    ],
  },
  rateProfiles: {
    label: 'Rate Profiles',
    endpoints: [
      { method: 'GET', path: '/api/v1/master/rate-categories' },
      { method: 'POST', path: '/api/v1/master/rate-categories' },
      { method: 'PUT', path: '/api/v1/master/rate-categories/{uuid}' },
      { method: 'DELETE', path: '/api/v1/master/rate-categories/{uuid}' },
    ],
  },
  milkRateCharts: {
    label: 'Milk Rate Charts',
    endpoints: [
      { method: 'GET', path: '/api/v1/milk-rate-charts' },
      { method: 'POST', path: '/api/v1/milk-rate-charts' },
      { method: 'PUT', path: '/api/v1/milk-rate-charts/{uuid}' },
      { method: 'DELETE', path: '/api/v1/milk-rate-charts/{uuid}' },
    ],
  },
  shifts: {
    label: 'Shifts',
    endpoints: [
      { method: 'GET', path: '/api/v1/master/shifts' },
      { method: 'POST', path: '/api/v1/master/shifts' },
    ],
  },
}
