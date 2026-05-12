import React, { useState, useEffect } from 'react'
import { Plus, Package } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { transactionService } from '@/services/api'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  businessId: string
  type: 'deposit' | 'withdrawal'
  onSuccess: () => void
}

const DEFAULT_DEPOSIT_CATEGORIES = [
  'Ventas',
  'Servicios',
  'Préstamos',
  'Inversiones',
  'Otros Ingresos',
]

const DEFAULT_WITHDRAWAL_CATEGORIES = [
  'Salarios',
  'Alquiler/Local',
  'Servicios (Agua, Luz, Internet)',
  'Suministros/Inventario',
  'Impuestos',
  'Gastos Operacionales',
  'Otros Gastos',
]

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  businessId,
  type,
  onSuccess,
}) => {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Estado para venta de productos
  const [products, setProducts] = useState<any[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [soldQuantity, setSoldQuantity] = useState<string>('')

  const isVenta = type === 'deposit' && category === 'Ventas'
  const selectedProduct = products.find(p => String(p.id) === selectedProductId)

  useEffect(() => {
    const saved = localStorage.getItem(`custom_categories_${type}`)
    if (saved) setCustomCategories(JSON.parse(saved))
  }, [type])

  // Cargar productos del localStorage cuando se selecciona "Ventas"
  useEffect(() => {
    if (isVenta) {
      const saved = localStorage.getItem(`products_${businessId}`)
      setProducts(saved ? JSON.parse(saved) : [])
    } else {
      setSelectedProductId('')
      setSoldQuantity('')
    }
  }, [isVenta, businessId])

  // Autocompletar monto al seleccionar producto y cantidad
  useEffect(() => {
    if (selectedProduct && soldQuantity && parseFloat(soldQuantity) > 0) {
      const total = selectedProduct.unit_price * parseFloat(soldQuantity)
      setAmount(total.toFixed(2))
    }
  }, [selectedProductId, soldQuantity])

  const defaultCategories = type === 'deposit' ? DEFAULT_DEPOSIT_CATEGORIES : DEFAULT_WITHDRAWAL_CATEGORIES
  const allCategories = [...defaultCategories, ...customCategories]

  const handleAddCustomCategory = () => {
    if (customCategory.trim() && !allCategories.includes(customCategory)) {
      const updated = [...customCategories, customCategory]
      setCustomCategories(updated)
      localStorage.setItem(`custom_categories_${type}`, JSON.stringify(updated))
      setCategory(customCategory)
      setCustomCategory('')
      setShowCustomInput(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!amount || parseFloat(amount) <= 0) {
      setError('Ingresa un monto válido')
      return
    }

    if (!category.trim()) {
      setError('Selecciona una categoría')
      return
    }

    // Validaciones extra para ventas
    if (isVenta) {
      if (!selectedProductId) {
        setError('Selecciona un producto vendido')
        return
      }
      const qty = parseFloat(soldQuantity)
      if (!qty || qty <= 0) {
        setError('Ingresa una cantidad válida')
        return
      }
      if (selectedProduct && qty > selectedProduct.quantity) {
        setError(`Solo hay ${selectedProduct.quantity} unidad(es) disponibles de "${selectedProduct.name}"`)
        return
      }
    }

    try {
      setLoading(true)
      const numAmount = parseFloat(amount) as number
      const description = isVenta && selectedProduct
        ? `Ventas - ${selectedProduct.name} (x${soldQuantity})`
        : category

      if (type === 'deposit') {
        await transactionService.deposit(businessId, String(numAmount), description)
      } else {
        await transactionService.withdraw(businessId, String(numAmount), description)
      }

      // Descontar del inventario si es una venta
      if (isVenta && selectedProduct) {
        const updatedProducts = products.map(p =>
          String(p.id) === selectedProductId
            ? { ...p, quantity: p.quantity - parseFloat(soldQuantity) }
            : p
        )
        localStorage.setItem(`products_${businessId}`, JSON.stringify(updatedProducts))
      }

      onSuccess()
      onClose()
      setAmount('')
      setCategory('')
      setCustomCategory('')
      setShowCustomInput(false)
      setSelectedProductId('')
      setSoldQuantity('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error en la transacción')
    } finally {
      setLoading(false)
    }
  }

  const title = type === 'deposit' ? '💰 Registrar Ingreso' : '💸 Registrar Gasto'
  const submitText = type === 'deposit' ? 'Depositar' : 'Retirar'
  const bgColor = type === 'deposit' ? 'bg-green-50' : 'bg-red-50'
  const textColor = type === 'deposit' ? 'text-green-700' : 'text-red-700'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-dark-800 mb-2">Categoría</label>
          <select
            value={category}
            onChange={(e) => {
              const selected = e.target.value
              setCategory(selected)
              setShowCustomInput(selected === '__custom__')
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="">-- Selecciona una categoría --</option>
            {defaultCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            {customCategories.map((cat) => (
              <option key={cat} value={cat}>{cat} (personalizado)</option>
            ))}
            <option value="__custom__">➕ Agregar nueva categoría</option>
          </select>
        </div>

        {/* Selector de producto — solo para Ventas */}
        {isVenta && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
              <Package className="w-4 h-4" />
              Producto vendido
            </div>

            {products.length === 0 ? (
              <p className="text-sm text-green-600">No hay productos en inventario.</p>
            ) : (
              <>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value)
                    setSoldQuantity('')
                    setAmount('')
                  }}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                >
                  <option value="">-- Selecciona un producto --</option>
                  {products.map((p) => (
                    <option key={p.id} value={String(p.id)} disabled={p.quantity === 0}>
                      {p.name} — Stock: {p.quantity} | ${p.unit_price}
                      {p.quantity === 0 ? ' (agotado)' : ''}
                    </option>
                  ))}
                </select>

                {selectedProduct && (
                  <div>
                    <label className="block text-xs text-green-700 mb-1">
                      Cantidad vendida (máx. {selectedProduct.quantity})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct.quantity}
                      value={soldQuantity}
                      onChange={(e) => setSoldQuantity(e.target.value)}
                      placeholder="Ej: 2"
                      className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-dark-800 mb-2">
            Monto {isVenta && selectedProduct && soldQuantity ? '(calculado automáticamente)' : ''}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          {isVenta && selectedProduct && soldQuantity && (
            <p className="text-xs text-gray-500 mt-1">
              {soldQuantity} × ${selectedProduct.unit_price} = ${amount}
            </p>
          )}
        </div>

        {/* Custom Category Input */}
        {(category === '__custom__' || showCustomInput) && (
          <div>
            <label className="block text-sm font-medium text-dark-800 mb-2">Nueva Categoría</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Nombre de la categoría"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCategory() } }}
              />
              <button
                type="button"
                onClick={handleAddCustomCategory}
                className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Añadir
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={`p-3 rounded-lg ${bgColor} ${textColor} text-sm`}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant={type === 'deposit' ? 'primary' : 'danger'}
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Procesando...' : submitText}
          </Button>
        </div>
      </form>
    </Modal>
  )
}