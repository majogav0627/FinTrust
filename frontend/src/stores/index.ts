import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Business, Alert as FintrustAlert } from '@/types'

interface BusinessStore {
  currentBusiness: Business | null
  businesses: Business[]
  setCurrentBusiness: (business: Business | null) => void
  setBusinesses: (businesses: Business[]) => void
}

export const useBusinessStore = create<BusinessStore>()(
  persist(
    (set) => ({
      currentBusiness: null,
      businesses: [],
      setCurrentBusiness: (business) => set({ currentBusiness: business }),
      setBusinesses: (businesses) => set({ businesses }),
    }),
    {
      name: 'fintrust_businesses',
    }
  )
)

interface AlertStore {
  alerts: FintrustAlert[]
  unreadCount: number
  setAlerts: (alerts: FintrustAlert[]) => void
  addAlert: (alert: FintrustAlert) => void
  markAsRead: (id: string) => void
  dismissAlert: (id: string) => void
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  unreadCount: 0,
  setAlerts: (alerts) => set({
    alerts,
    unreadCount: alerts.filter(a => !a.read).length,
  }),
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts],
    unreadCount: state.unreadCount + 1,
  })),
  markAsRead: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, read: true } : a),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  dismissAlert: (id) => set((state) => ({
    alerts: state.alerts.filter(a => a.id !== id),
  })),
}))

interface UIStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  darkMode: boolean
  toggleDarkMode: () => void
  language: 'es' | 'en' | 'pt'
  setLanguage: (lang: 'es' | 'en' | 'pt') => void
  currency: 'USD' | 'MXN' | 'EUR' | 'COP'
  setCurrency: (currency: 'USD' | 'MXN' | 'EUR' | 'COP') => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      darkMode: false,
      toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.darkMode
        if (newDarkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        return { darkMode: newDarkMode }
      }),
      language: 'es',
      setLanguage: (lang) => set({ language: lang }),
      currency: 'USD',
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'fintrust_ui',
    }
  )
)