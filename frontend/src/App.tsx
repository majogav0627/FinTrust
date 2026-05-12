import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components'
import { Dashboard, Finances, Inventory, Alerts, Simulator, Reports, Settings, BusinessSelector, Login } from '@/pages'
import { useBusinessStore } from '@/stores'
import { businessService } from '@/services/api'

function App() {
  const { currentBusiness, setCurrentBusiness, setBusinesses } = useBusinessStore()
  const [loading, setLoading] = React.useState(true)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      // Verificar si está autenticado
      const authenticated = localStorage.getItem('fintrust_authenticated') === 'true'
      setIsAuthenticated(authenticated)

      if (authenticated) {
        const businesses = await businessService.getAll()
        setBusinesses(businesses)
        
        if (businesses.length > 0 && !currentBusiness) {
          setCurrentBusiness(businesses[0])
        }
      }
    } catch (error) {
      console.error('Error loading businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando aplicación...</p>
      </div>
    )
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <Login />
  }

  // Si está autenticado pero sin negocio, mostrar selector
  if (!currentBusiness) {
    return (
      <Router>
        <Routes>
          <Route path="/selector" element={<BusinessSelector />} />
          <Route path="*" element={<Navigate to="/selector" />} />
        </Routes>
      </Router>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Protected Routes with Layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/finances" element={<Finances />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/simulator" element={<Simulator />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
