import axios from 'axios'
import type { Business, Transaction, Balance } from '@/types'

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE,
})

// Business Services
export const businessService = {
  getAll: async (): Promise<Business[]> => {
    const { data } = await api.get('/businesses')
    return data.data
  },

  getById: async (id: number | string): Promise<Business> => {
    const { data } = await api.get(`/businesses/${id}`)
    return data.data
  },

  create: async (businessName: string): Promise<Business> => {
    const { data } = await api.post('/businesses', { businessName })
    return data.data
  },

  delete: async (id: number | string): Promise<{ id: string; message: string }> => {
    const { data } = await api.delete(`/businesses/${id}`)
    return data.data
  },
}

// Transaction Services
export const transactionService = {
  getHistory: async (businessId: number | string): Promise<Transaction[]> => {
    const { data } = await api.get(`/transactions/${businessId}`)
    // Convertir amount a número para que funcionen los gráficos
    return data.data.map((tx: any) => ({
      ...tx,
      amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount,
    }))
  },

  getBalance: async (businessId: number | string): Promise<Balance> => {
    const { data } = await api.get(`/transactions/${businessId}/balance`)
    return data.data
  },

  deposit: async (businessId: number | string, amount: string, description?: string): Promise<Transaction> => {
    const { data } = await api.post('/transactions/deposit', {
      businessId,
      amount,
      description,
    })
    return data.data
  },

  withdraw: async (businessId: number | string, amount: string, description?: string): Promise<Transaction> => {
    const { data } = await api.post('/transactions/withdraw', {
      businessId,
      amount,
      description,
    })
    return data.data
  },
}

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const { data } = await api.get('/health')
    return data.status === 'ok'
  } catch {
    return false
  }
}

export default api
