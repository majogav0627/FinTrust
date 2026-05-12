// Business Types
export interface Business {
  id: number | string
  name?: string
  business_name?: string
  description?: string
  current_balance?: string | number
  total_income?: string | number
  total_expenses?: string | number
  created_at: string
  updated_at: string
}

// Transaction Types
export interface Transaction {
  id: number
  business_id?: number
  businessId?: number
  type: 'deposit' | 'withdrawal'
  amount: string | number
  description?: string
  fincore_tx_id?: string
  fincoreTxId?: string
  fincore_status?: string
  fincoreStatus?: string
  created_at?: string
  createdAt?: string
  updated_at?: string
}

// Balance Types
export interface Balance {
  id: number
  business_id: number
  current_balance: string
  total_income: string
  total_expenses: string
  updated_at: string
}

// Inventory Types
export interface InventoryItem {
  id: number
  business_id: number
  name: string
  category: string
  quantity: number
  unit_price: string
  created_at: string
  updated_at: string
}

// Alert Types
export type AlertSeverity = 'info' | 'warning' | 'danger'

export interface Alert {
  id: string
  business_id: number
  title: string
  message: string
  severity: AlertSeverity
  type: 'liquidez' | 'inventario' | 'gastos' | 'general'
  action?: {
    label: string
    url: string
  }
  read: boolean
  created_at: string
}

// User Types
export interface User {
  id: number
  email: string
  business_id: number
  created_at: string
}

// Dashboard Types
export interface DashboardData {
  business: Business
  balance: Balance
  recentTransactions: Transaction[]
  alerts: Alert[]
  cashFlowData: CashFlowPoint[]
}

export interface CashFlowPoint {
  date: string
  income: number
  expense: number
  balance: number
}

// Simulation Types
export interface SimulationScenario {
  name: string
  description: string
  type: 'inventory' | 'expense' | 'sales'
  parameters: Record<string, number | string>
  results: {
    projectedBalance: number
    riskLevel: 'low' | 'medium' | 'high'
    recommendation: string
  }
}
