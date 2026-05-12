import React, { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

interface InventoryModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (product: any) => void
  onSaveEdit?: (product: any) => void
  editingProduct?: any
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  onSaveEdit,
  editingProduct,
}) => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Electrónica')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [minStock, setMinStock] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name)
      setCategory(editingProduct.category)
      setQuantity(String(editingProduct.quantity))
      setUnitPrice(String(editingProduct.unitPrice))
      setMinStock(String(editingProduct.minStock))
    } else {
      resetForm()
    }
  }, [editingProduct, isOpen])

  const resetForm = () => {
    setName('')
    setCategory('Electrónica')
    setQuantity('')
    setUnitPrice('')
    setMinStock('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Ingresa el nombre del producto')
      return
    }

    if (!quantity || parseInt(quantity) < 0) {
      setError('Ingresa una cantidad válida')
      return
    }

    if (!unitPrice || parseFloat(unitPrice) <= 0) {
      setError('Ingresa un precio válido')
      return
    }

    if (!minStock || parseInt(minStock) < 0) {
      setError('Ingresa un stock mínimo válido')
      return
    }

    const product = {
      id: editingProduct?.id || Math.random(),
      name,
      category,
      quantity: parseInt(quantity),
      unitPrice: parseFloat(unitPrice),
      minStock: parseInt(minStock),
    }

    if (editingProduct && onSaveEdit) {
      onSaveEdit(product)
    } else {
      onAdd(product)
    }
    
    resetForm()
    onClose()
  }

  const title = editingProduct ? '✏️ Editar Producto' : '➕ Agregar Producto'
  const submitText = editingProduct ? 'Guardar Cambios' : 'Agregar Producto'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-dark-800 mb-2">
            Nombre del Producto *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Laptop"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-dark-800 mb-2">
            Categoría *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option>Electrónica</option>
            <option>Accesorios</option>
            <option>Ropa</option>
            <option>Alimentos</option>
            <option>Otros</option>
          </select>
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-sm font-medium text-dark-800 mb-2">
            Cantidad *
          </label>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        {/* Precio Unitario */}
        <div>
          <label className="block text-sm font-medium text-dark-800 mb-2">
            Precio Unitario ($) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        </div>

        {/* Stock Mínimo */}
        <div>
          <label className="block text-sm font-medium text-dark-800 mb-2">
            Stock Mínimo *
          </label>
          <input
            type="number"
            min="0"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            placeholder="5"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="flex-1"
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

