import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2, Loader } from 'lucide-react'
import { Card, Button, Modal } from '@/components'
import { businessService } from '@/services/api'
import { useBusinessStore } from '@/stores'
import type { Business } from '@/types'

export const BusinessSelector: React.FC = () => {
  const navigate = useNavigate()
  const { setCurrentBusiness, setBusinesses } = useBusinessStore()
  const [businesses, setLocalBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [newBusinessName, setNewBusinessName] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Business | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadBusinesses()
  }, [])

  const loadBusinesses = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await businessService.getAll()
      setLocalBusinesses(data)
      setBusinesses(data)
    } catch (err) {
      setError('Error al cargar negocios. Verifica que el servidor esté corriendo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectBusiness = (business: Business) => {
    setCurrentBusiness(business)
    navigate('/dashboard')
  }

  const handleCreateBusiness = async () => {
    if (!newBusinessName.trim()) {
      alert('Ingresa un nombre para el negocio')
      return
    }

    try {
      setCreating(true)
      const newBusiness = await businessService.create(newBusinessName)
      setLocalBusinesses([...businesses, newBusiness])
      setBusinesses([...businesses, newBusiness])
      setCurrentBusiness(newBusiness)
      setModalOpen(false)
      setNewBusinessName('')
      navigate('/dashboard')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear negocio')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteBusiness = async () => {
    if (!deleteConfirm) return

    try {
      setDeleting(true)
      await businessService.delete(deleteConfirm.id)
      setLocalBusinesses(businesses.filter(b => b.id !== deleteConfirm.id))
      setBusinesses(businesses.filter(b => b.id !== deleteConfirm.id))
      setDeleteConfirm(null)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar negocio')
    } finally {
      setDeleting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('fintrust_authenticated')
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando negocios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-800 to-dark-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 mb-4 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
          >
            <img src="/logo.png" alt="FinTrust" className="w-12 h-12 object-contain" />
            <h1 className="text-4xl font-display font-bold">FinTrust</h1>
          </button>
          <p className="text-white/80">Selecciona o crea un negocio para comenzar</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadBusinesses}
              className="mt-2 text-red-700 font-medium hover:text-red-900"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Create New Business Button */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="primary"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Crear Nuevo Negocio
          </Button>
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="flex items-center justify-center"
          >
            Cerrar sesión
          </Button>
        </div>

        {/* Businesses Grid */}
        {businesses.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">No hay negocios creados aún</p>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Crear tu primer negocio
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Card
                key={business.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSelectBusiness(business)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary-400" />
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Activo
                    </span>
                  </div>

                  <h3 className="text-xl font-display font-bold text-dark-800 mb-2">
                    {(business.business_name || business.name || 'Sin nombre') as string}
                  </h3>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Saldo</span>
                      <span className="font-semibold text-dark-800">
                        ${Number(business.current_balance || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Ingresos</span>
                      <span className="font-semibold text-green-600">
                        ${Number(business.total_income || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Gastos</span>
                      <span className="font-semibold text-alert">
                        ${Number(business.total_expenses || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full mb-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectBusiness(business)
                    }}
                  >
                    Entrar
                  </Button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteConfirm(business)
                    }}
                    className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium text-sm"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Business Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setNewBusinessName('')
        }}
        title="Crear Nuevo Negocio"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-800 mb-2">
              Nombre del Negocio
            </label>
            <input
              type="text"
              value={newBusinessName}
              onChange={(e) => setNewBusinessName(e.target.value)}
              placeholder="Ej: Mi Tienda Online"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateBusiness()
                }
              }}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false)
                setNewBusinessName('')
              }}
              disabled={creating}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateBusiness}
              disabled={creating || !newBusinessName.trim()}
              className="flex-1"
            >
              {creating ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-xl font-bold text-dark-800 mb-2">¿Eliminar Negocio?</h3>
                <p className="text-gray-600 mb-1">Nombre: <strong>{deleteConfirm.business_name || deleteConfirm.name}</strong></p>
                <p className="text-gray-600 mb-6 text-sm">Esta acción eliminará el negocio y todos sus datos asociados. No se puede deshacer.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 border border-gray-300 text-dark-800 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteBusiness}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition font-medium"
                  >
                    {deleting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
