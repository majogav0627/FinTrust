import React from 'react'
import { Package, AlertCircle, Plus, Trash2, Pencil, X, Check } from 'lucide-react'
import { Card, CardHeader, CardBody, Button } from '@/components'
import { formatCurrency } from '@/utils/helpers'
import { useBusinessStore } from '@/stores'

export const Inventory: React.FC = () => {
  const { currentBusiness } = useBusinessStore()
  const [items, setItems] = React.useState<any[]>([])
  const [showForm, setShowForm] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [editData, setEditData] = React.useState<any>({})
  const [formData, setFormData] = React.useState({ name: '', category: '', quantity: '', unit_price: '', minStock: '' })

  React.useEffect(() => {
    const savedItems = localStorage.getItem(`products_${Number(currentBusiness?.id)}`)
    if (savedItems) {
      setItems(JSON.parse(savedItems))
    }
  }, [currentBusiness])

  const handleAddItem = () => {
    if (formData.name && formData.quantity && formData.unit_price) {
      const newItem = {
        id: Date.now(),
        ...formData,
        quantity: Number(formData.quantity),
        unit_price: parseFloat(formData.unit_price),
        minStock: Number(formData.minStock) || 10,
      }
      const updated = [...items, newItem]
      setItems(updated)
      localStorage.setItem(`products_${Number(currentBusiness?.id)}`, JSON.stringify(updated))
      setFormData({ name: '', category: '', quantity: '', unit_price: '', minStock: '' })
      setShowForm(false)
    }
  }

  const handleDelete = (id: number) => {
    const updated = items.filter(item => item.id !== id)
    setItems(updated)
    localStorage.setItem(`products_${Number(currentBusiness?.id)}`, JSON.stringify(updated))
  }

  const handleEditStart = (item: any) => {
    setEditingId(item.id)
    setEditData({
      name: item.name,
      category: item.category || '',
      quantity: String(item.quantity),
      unit_price: String(item.unit_price),
      minStock: String(item.minStock),
    })
  }

  const handleEditSave = (id: number) => {
    const updated = items.map(item =>
      item.id === id
        ? {
            ...item,
            ...editData,
            quantity: Number(editData.quantity),
            unit_price: parseFloat(editData.unit_price),
            minStock: Number(editData.minStock) || 10,
          }
        : item
    )
    setItems(updated)
    localStorage.setItem(`products_${Number(currentBusiness?.id)}`, JSON.stringify(updated))
    setEditingId(null)
    setEditData({})
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  const lowStockItems = items.filter(item => item.quantity < item.minStock).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold text-dark-800">Inventario</h1>
          <p className="text-gray-600 mt-1">Gestiona tu inventario de productos</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Agregar Producto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Total de Productos</p>
              <p className="text-2xl font-bold text-dark-800">{items.length}</p>
            </div>
            <Package className="w-6 h-6 text-primary-400" />
          </div>
        </Card>
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-dark-800">{formatCurrency(totalValue)}</p>
            </div>
            <Package className="w-6 h-6 text-green-400" />
          </div>
        </Card>
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Stock Bajo</p>
              <p className={`text-2xl font-bold ${lowStockItems > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {lowStockItems}
              </p>
            </div>
            <AlertCircle className="w-6 h-6 text-orange-400" />
          </div>
        </Card>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card>
          <CardHeader title="Nuevo Producto" />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre del producto" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="p-2 border rounded" />
              <input type="text" placeholder="Categoría" value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="p-2 border rounded" />
              <input type="number" placeholder="Cantidad" value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="p-2 border rounded" />
              <input type="number" placeholder="Precio unitario" step="0.01" value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })} className="p-2 border rounded" />
              <input type="number" placeholder="Stock mínimo" value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })} className="p-2 border rounded" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddItem} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
                Guardar
              </button>
              <button onClick={() => setShowForm(false)} className="bg-gray-300 text-dark-800 px-4 py-2 rounded hover:bg-gray-400">
                Cancelar
              </button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Items List */}
      <Card>
        <CardHeader title="Productos" />
        <CardBody>
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No hay productos</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) =>
                editingId === item.id ? (
                  // ── Fila en modo edición ──
                  <div key={item.id} className="p-3 bg-blue-50 border border-blue-200 rounded space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <input type="text" placeholder="Nombre" value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="p-2 border rounded text-sm col-span-2" />
                      <input type="text" placeholder="Categoría" value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        className="p-2 border rounded text-sm col-span-2" />
                      <input type="number" placeholder="Cantidad" value={editData.quantity}
                        onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                        className="p-2 border rounded text-sm" />
                      <input type="number" placeholder="Precio" step="0.01" value={editData.unit_price}
                        onChange={(e) => setEditData({ ...editData, unit_price: e.target.value })}
                        className="p-2 border rounded text-sm" />
                      <input type="number" placeholder="Stock mín." value={editData.minStock}
                        onChange={(e) => setEditData({ ...editData, minStock: e.target.value })}
                        className="p-2 border rounded text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditSave(item.id)}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700">
                        <Check className="w-3 h-3" /> Guardar
                      </button>
                      <button onClick={handleEditCancel}
                        className="flex items-center gap-1 bg-gray-300 text-dark-800 px-3 py-1.5 rounded text-sm hover:bg-gray-400">
                        <X className="w-3 h-3" /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // ── Fila normal ──
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-dark-800">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.category || 'Sin categoría'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Stock</p>
                        <p className={`font-semibold ${item.quantity < item.minStock ? 'text-orange-600' : 'text-green-600'}`}>
                          {item.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Precio</p>
                        <p className="font-semibold">{formatCurrency(item.unit_price)}</p>
                      </div>
                      <button onClick={() => handleEditStart(item)} className="p-2 hover:bg-blue-100 rounded">
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-100 rounded">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}