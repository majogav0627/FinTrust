import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, LayoutDashboard, TrendingUp, Package, AlertCircle, Zap, BarChart3, Settings, Building2 } from 'lucide-react'
import clsx from 'clsx'
import { useUIStore, useBusinessStore } from '@/stores'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: TrendingUp, label: 'Finanzas', href: '/finances' },
  { icon: Package, label: 'Inventario', href: '/inventory' },
  { icon: AlertCircle, label: 'Alertas', href: '/alerts' },
  { icon: Zap, label: 'Simulador', href: '/simulator' },
  { icon: BarChart3, label: 'Reportes', href: '/reports' },
  { icon: Settings, label: 'Configuración', href: '/settings' },
]

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { currentBusiness, setCurrentBusiness } = useBusinessStore()

  const handleChangeBusiness = () => {
    setCurrentBusiness(null)
    navigate('/selector')
  }

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg hover:bg-gray-100"
      >
        <Menu className="w-8 h-8 text-dark-800" />
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => toggleSidebar()}
        />
      )}

      <aside
        className={clsx(
          'fixed left-0 top-0 h-full w-96 bg-dark-800 text-white z-40 transition-transform duration-300 flex flex-col',
          'lg:translate-x-0 lg:static lg:h-screen',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <Link
          to="/dashboard"
          className="p-10 border-b border-dark-700 flex-shrink-0 block hover:bg-dark-700 transition-colors"
        >
          <div className="flex items-center gap-5">
            <img src="/logo.png" alt="FinTrust" className="w-14 h-14 object-contain" />
            <span className="font-display font-bold text-3xl">FinTrust</span>
          </div>
        </Link>

        {/* Business Info */}
        {currentBusiness && (
          <div className="px-6 py-4 bg-dark-700/50 flex-shrink-0">
            <p className="text-xs text-gray-400 mb-1">Negocio Actual</p>
            <p className="text-white font-semibold text-sm">{currentBusiness.name || currentBusiness.business_name}</p>
            <button
              onClick={handleChangeBusiness}
              className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm bg-primary-400 hover:bg-primary-500 text-white rounded-lg transition-colors"
            >
              <Building2 className="w-4 h-4" />
              Cambiar Negocio
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="px-6 py-6 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    toggleSidebar()
                  }
                }}
                className={clsx(
                  'flex items-center gap-5 px-6 py-4 rounded-xl transition-colors duration-200',
                  isActive
                    ? 'bg-primary-400 text-white'
                    : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                )}
              >
                <Icon className="w-7 h-7 flex-shrink-0" />
                <span className="text-lg font-semibold">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-dark-700 flex-shrink-0">
          <div className="text-sm text-gray-400 text-center">
            <p>FinTrust v0.1.0</p>
            <p className="mt-1">Inteligencia que fluye contigo</p>
          </div>
        </div>
      </aside>
    </>
  )
}