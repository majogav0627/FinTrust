import React from 'react'
import { Save, LogOut, Trash2,} from 'lucide-react'
import { Card, CardHeader, CardBody, Button, Modal } from '@/components'
import { useBusinessStore, useUIStore } from '@/stores'
import { businessService } from '@/services/api'

export const Settings: React.FC = () => {
  const { currentBusiness, setCurrentBusiness, businesses, setBusinesses } = useBusinessStore()
  const { language, setLanguage, currency, setCurrency, darkMode, toggleDarkMode } = useUIStore()
  const [businessName, setBusinessName] = React.useState(currentBusiness?.business_name || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [showPaymentModal, setShowPaymentModal] = React.useState(false)
  const [isPurchasing, setIsPurchasing] = React.useState(false)
  const [paymentMessage, setPaymentMessage] = React.useState('')
  const [paymentSuccess, setPaymentSuccess] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleSaveBusinessName = async () => {
    // In a real app, this would make an API call to update the business
    console.log('Business name update:', businessName)
  }

  const handleDeleteBusiness = async () => {
    if (!currentBusiness) return
    try {
      setLoading(true)
      await businessService.delete(Number(currentBusiness.id))
      const updated = businesses.filter(b => b.id !== currentBusiness.id)
      setBusinesses(updated)
      if (updated.length > 0) {
        setCurrentBusiness(updated[0])
      }
      localStorage.removeItem('fintrust_authenticated')
      window.location.href = '/login'
    } catch (error) {
      console.error('Error deleting business:', error)
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('fintrust_authenticated')
    window.location.href = '/login'
  }

  const handlePurchasePremium = async () => {
    setIsPurchasing(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsPurchasing(false)
    setPaymentSuccess(true)
    setPaymentMessage('¡Felicidades! Ahora tienes acceso premium por $9.99 al mes.')
  }

  return (
    <div className="space-y-6">
      {paymentMessage && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
          {paymentMessage}
        </div>
      )}
      <div>
        <h1 className="text-3xl font-display font-bold text-dark-800">Configuración</h1>
        <p className="text-gray-600 mt-1">Personaliza tu cuenta y preferencias</p>
      </div>

      {/* Business Settings */}
      <Card>
        <CardHeader title="Información del Negocio" />
        <CardBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-800 mb-2">Nombre del Negocio</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-3 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-800 mb-2">ID del Negocio</label>
              <input
                type="text"
                value={currentBusiness?.id || ''}
                disabled
                className="w-full p-3 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <Button onClick={handleSaveBusinessName} className="flex items-center gap-2 w-full justify-center">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* User Preferences */}
      <Card>
        <CardHeader title="Preferencias de Usuario" />
        <CardBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-800 mb-2">Idioma</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full p-3 border rounded"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-800 mb-2">Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full p-3 border rounded"
              >
                <option value="USD">Dólar (USD $)</option>
                <option value="MXN">Peso Mexicano (MXN $)</option>
                <option value="EUR">Euro (EUR €)</option>
                <option value="COP">Peso Colombiano (COP $)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => toggleDarkMode()}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-dark-800">Modo Oscuro</span>
              </label>
            </div>

            <Button onClick={() => {}} className="flex items-center gap-2 w-full justify-center">
              <Save className="w-4 h-4" />
              Guardar Preferencias
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Premium Plan */}
      <Card>
        <CardHeader title="Plan Premium" />
        <CardBody>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-900 font-medium">Accede a funciones avanzadas para anticipar riesgos y optimizar tu negocio.</p>
            </div>
            <ul className="space-y-2 text-sm text-dark-700">
              <li>• Tres meses premium gratis al registrarte</li>
              <li>• Alertas inteligentes y proyecciones de flujo de caja</li>
              <li>• Análisis de inventario y compras avanzadas</li>
              <li>• Soporte prioritario y reportes exclusivos</li>
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="primary"
                onClick={() => setShowPaymentModal(true)}
                className="flex-1"
              >
                Activar Premium - $9.99 / mes
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowPaymentModal(true)}
                className="flex-1"
              >
                Ver planes
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader title="Seguridad de Cuenta" />
        <CardBody>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-900">
                Tu cuenta está protegida. Verifica que tu contraseña sea segura y cambiarla periódicamente.
              </p>
            </div>
            <Button variant="secondary" className="flex items-center gap-2 w-full justify-center">
              Cambiar Contraseña
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader title="Zona de Peligro" />
        <CardBody>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-900">
                Estas acciones son irreversibles. Procede con cuidado.
              </p>
            </div>

            {!showDeleteConfirm ? (
              <>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="secondary"
                  className="flex items-center gap-2 w-full justify-center text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar este Negocio
                </Button>

                <Button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full justify-center"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-dark-800 font-medium">
                  ¿Estás seguro? Esta acción eliminará permanentemente "{currentBusiness?.business_name}"
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDeleteBusiness}
                    disabled={loading}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {loading ? 'Eliminando...' : 'Sí, Eliminar'}
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {showPaymentModal && (
        <Modal isOpen={showPaymentModal} onClose={() => {
          setShowPaymentModal(false)
          setPaymentSuccess(false)
        }} title="Plan Premium" size="md">
          <div className="space-y-4">
            {paymentSuccess && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
                {paymentMessage}
              </div>
            )}
            {!paymentSuccess ? (
              <>
                <p className="text-sm text-dark-700">
                  Fintrust opera bajo un modelo freemium. Desde el primer día, el usuario accede gratuitamente a herramientas esenciales: registro financiero, flujo de caja básico e inventario.
                </p>
                <p className="text-sm text-dark-700">
                  Al registrarse, obtiene tres meses de acceso premium completo para experimentar el valor real de anticipar riesgos. Después, puede mantener las funciones avanzadas por $9.99 al mes.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-dark-800">Plan Gratis</h3>
                    <p className="text-sm text-gray-600 mt-2">Registro financiero, seguimiento básico y control de inventario.</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-yellow-50">
                    <h3 className="font-semibold text-dark-800">Plan Premium</h3>
                    <p className="text-sm text-gray-600 mt-2">Alertas inteligentes, proyecciones de flujo de caja, reportes avanzados y soporte prioritario.</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Porque creemos que la claridad financiera no debería ser inaccesible para un pequeño negocio.</p>
                </div>
                <div className="flex gap-3 pt-3">
                  <Button onClick={handlePurchasePremium} className="flex-1" disabled={isPurchasing}>
                    {isPurchasing ? 'Procesando...' : 'Pagar $9.99 / mes'}
                  </Button>
                  <Button variant="secondary" onClick={() => setShowPaymentModal(false)} className="flex-1">
                    Cerrar
                  </Button>
                </div>
              </>
            ) : (
              <div className="border-t pt-4">
                <div className="text-sm text-gray-600">Puedes cerrar esta ventana o continuar explorando la configuración.</div>
                <div className="flex gap-3 pt-3">
                  <Button variant="secondary" onClick={() => setShowPaymentModal(false)} className="flex-1">
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
