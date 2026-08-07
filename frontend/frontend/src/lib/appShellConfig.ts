import type { PaymentMode } from '../types/api'

export type TabKey =
  | 'dashboard'
  | 'products'
  | 'customers'
  | 'milkCollections'
  | 'sales'
  | 'farmers'
  | 'configuration'
  | 'tenants'

export const SIDEBAR_GROUPS = [
  {
    title: 'Operations',
    items: ['dashboard', 'products', 'customers', 'milkCollections', 'sales', 'farmers'],
  },
  {
    title: 'Masters',
    items: ['master', 'collectionMethods', 'paymentCycles', 'pricing', 'rateProfiles', 'milkRateCharts', 'shifts'],
  },
  {
    title: 'Settings',
    items: ['configuration'],
  },
  {
    title: 'Transactions',
    items: [
      'tenants',
      'companies',
      'branches',
      'farmerConfigurations',
      'productionBatches',
      'inventory',
      'loans',
      'settlements',
      'payments',
    ],
  },
  {
    title: 'Reports',
    items: ['reports', 'health'],
  },
  {
    title: 'Access',
    items: ['auth'],
  },
] as const

export const TAB_LABELS: Record<TabKey, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  customers: 'Customers',
  milkCollections: 'Milk Collections',
  sales: 'Sales',
  farmers: 'Farmers',
  configuration: 'Configuration',
  tenants: 'Tenants',
}

export const SIDEBAR_ICON_MAP: Record<string, string> = {
  dashboard: 'icon-home',
  products: 'icon-box',
  customers: 'icon-users',
  milkCollections: 'icon-drop',
  sales: 'icon-chart',
  farmers: 'icon-user',
  configuration: 'icon-cog',
  master: 'icon-sliders',
  collectionMethods: 'icon-filter',
  paymentCycles: 'icon-calendar',
  pricing: 'icon-tag',
  rateProfiles: 'icon-trend',
  milkRateCharts: 'icon-bars',
  shifts: 'icon-clock',
  tenants: 'icon-building',
  companies: 'icon-briefcase',
  branches: 'icon-pin',
  farmerConfigurations: 'icon-cog',
  productionBatches: 'icon-layers',
  inventory: 'icon-archive',
  loans: 'icon-wallet',
  settlements: 'icon-check',
  payments: 'icon-card',
  reports: 'icon-file',
  health: 'icon-pulse',
  auth: 'icon-lock',
}

export const PAYMENT_MODES: PaymentMode[] = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CREDIT']
