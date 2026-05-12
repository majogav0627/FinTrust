import React from 'react'
import { Bell, LogOut } from 'lucide-react'
import { useBusinessStore, useAlertStore } from '@/stores'

export const Header: React.FC = () => {
  const { currentBusiness } = useBusinessStore()
  const { unreadCount } = useAlertStore()
  const [showLogoutModal, setShowLogoutModal] = React.useState(false)

  const handleLogout = () => {
    localStorage.removeItem('fintrust_authenticated')
    localStorage.removeItem('fintrust_session')
    window.location.href = '/'
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left side - Business name */}
          <div>
            <h1 className="text-sm font-medium text-gray-600">Mi Negocio</h1>
            {currentBusiness && (
              <p className="text-lg font-display font-semibold text-dark-800">
                {currentBusiness.name || currentBusiness.business_name}
              </p>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-dark-800 transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-alert rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                A
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="p-2 text-gray-600 hover:text-dark-800 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de confirmación de logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 flex flex-col items-center gap-4">
            {/* Ícono */}
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
              <LogOut className="w-7 h-7 text-red-500" />
            </div>

            {/* Texto */}
            <div className="text-center">
              <h2 className="text-lg font-semibold text-dark-800">¿Cerrar sesión?</h2>
              <p className="text-sm text-gray-500 mt-1">
                Tu sesión será cerrada. Podrás volver a ingresar cuando quieras.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}