import React from 'react'
import { AlertCircle, AlertTriangle, Check, Trash2, Package, TrendingDown, DollarSign, FileX } from 'lucide-react'
import { Card } from '@/components'
import { useBusinessStore } from '@/stores'
import { useAlertStore } from '@/stores'
import { transactionService } from '@/services/api'

export const Alerts: React.FC = () => {
  const { currentBusiness } = useBusinessStore()
  const { alerts, setAlerts, markAsRead, dismissAlert } = useAlertStore()
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (currentBusiness) {
      loadAndGenerateAlerts()
    }
  }, [currentBusiness])

  const loadAndGenerateAlerts = async () => {
    try {
      setLoading(true)
      if (!currentBusiness) return

      const [balanceData, txData] = await Promise.all([
        transactionService.getBalance(Number(currentBusiness.id)),
        transactionService.getHistory(Number(currentBusiness.id)),
      ])

      const savedProducts = localStorage.getItem(`products_${Number(currentBusiness.id)}`)
      const products = savedProducts ? JSON.parse(savedProducts) : []

      const generated: any[] = []

      // ── 1. Productos agotados (danger) ──
      const outOfStock = products.filter((p: any) => p.quantity === 0)
      outOfStock.forEach((p: any) => {
        generated.push({
          id: `out_${p.id}`,
          business_id: Number(currentBusiness.id),
          title: 'Producto agotado',
          message: `"${p.name}" está completamente sin stock.`,
          severity: 'danger' as const,
          type: 'inventario' as const,
          read: false,
          created_at: new Date().toISOString(),
        })
      })

      // ── 2. Stock bajo (warning) ──
      const lowStock = products.filter((p: any) => p.quantity > 0 && p.quantity < p.minStock)
      lowStock.forEach((p: any) => {
        generated.push({
          id: `stock_${p.id}`,
          business_id: Number(currentBusiness.id),
          title: 'Stock bajo',
          message: `"${p.name}" tiene ${p.quantity} unidad(es) — mínimo requerido: ${p.minStock}.`,
          severity: 'warning' as const,
          type: 'inventario' as const,
          read: false,
          created_at: new Date().toISOString(),
        })
      })

      const currentBalance = parseFloat(balanceData?.current_balance || '0')
      const totalIncome = parseFloat(balanceData?.total_income || '0')
      const totalExpenses = parseFloat(balanceData?.total_expenses || '0')
      const netProfit = totalIncome - totalExpenses

      // ── 3. Sin transacciones (warning) ──
      if (txData.length === 0) {
        generated.push({
          id: 'no_tx',
          business_id: Number(currentBusiness.id),
          title: 'Sin transacciones registradas',
          message: 'No hay movimientos financieros registrados en tu negocio.',
          severity: 'warning' as const,
          type: 'finanzas' as const,
          read: false,
          created_at: new Date().toISOString(),
        })
      }

      // ── 4. Ganancia neta negativa (danger) ──
      if (totalIncome > 0 && netProfit < 0) {
        generated.push({
          id: 'net_loss',
          business_id: Number(currentBusiness.id),
          title: 'Pérdida neta',
          message: `Tus gastos superan tus ingresos por ${formatCurrency(Math.abs(netProfit))}.`,
          severity: 'danger' as const,
          type: 'finanzas' as const,
          read: false,
          created_at: new Date().toISOString(),
        })
      }

      // ── 5. Gastos > 85% de ingresos (warning) ──
      if (totalIncome > 0) {
        const expenseRatio = totalExpenses / totalIncome
        if (expenseRatio > 0.85 && netProfit >= 0) {
          generated.push({
            id: 'high_expenses',
            business_id: Number(currentBusiness.id),
            title: 'Gastos elevados',
            message: `Tus gastos representan el ${(expenseRatio * 100).toFixed(1)}% de tus ingresos.`,
            severity: 'warning' as const,
            type: 'finanzas' as const,
            read: false,
            created_at: new Date().toISOString(),
          })
        }
      }

      // ── 6. Liquidez baja (warning) ──
      if (totalIncome > 0) {
        const liquidityRatio = currentBalance / totalIncome
        if (liquidityRatio < 1) {
          generated.push({
            id: 'low_liquidity',
            business_id: Number(currentBusiness.id),
            title: 'Liquidez baja',
            message: `Tu balance actual (${formatCurrency(currentBalance)}) está por debajo de tus ingresos totales.`,
            severity: 'warning' as const,
            type: 'finanzas' as const,
            read: false,
            created_at: new Date().toISOString(),
          })
        }
      }

      setAlerts(generated)
    } catch (error) {
      console.error('Error generando alertas:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(value)

  const getIcon = (alert: any) => {
    if (alert.type === 'inventario') return <Package className="w-4 h-4" />
    if (alert.id === 'net_loss') return <TrendingDown className="w-4 h-4" />
    if (alert.id === 'no_tx') return <FileX className="w-4 h-4" />
    if (alert.id === 'low_liquidity') return <DollarSign className="w-4 h-4" />
    return alert.severity === 'danger'
      ? <AlertTriangle className="w-4 h-4" />
      : <AlertCircle className="w-4 h-4" />
  }

  const getIconColor = (alert: any) =>
    alert.severity === 'danger' ? 'text-red-600' : 'text-orange-500'

  const getBadgeLabel = (type: string) => {
    if (type === 'inventario') return 'Inventario'
    if (type === 'finanzas') return 'Finanzas'
    return type
  }

  const getBadgeColor = (type: string) =>
    type === 'inventario'
      ? 'bg-orange-100 text-orange-700'
      : 'bg-blue-100 text-blue-700'

  const unread = alerts.filter(a => !a.read)
  const read = alerts.filter(a => a.read)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Analizando tu negocio...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-dark-800">Alertas</h1>
        <p className="text-gray-600 mt-1">Notificaciones importantes sobre tu negocio</p>
      </div>

      {/* Sin leer */}
      <div>
        <h2 className="text-lg font-semibold text-dark-800 mb-3">Sin Leer ({unread.length})</h2>
        {unread.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center py-8">✅ Todo está bien, no tienes alertas pendientes</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {unread.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${alert.severity === 'danger' ? 'border-red-500' : 'border-orange-500'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={getIconColor(alert)}>{getIcon(alert)}</span>
                      <h3 className="font-semibold text-dark-800">{alert.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColor(alert.type)}`}>
                        {getBadgeLabel(alert.type)}
                      </span>
                    </div>
                    <p className="text-gray-700">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(alert.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => markAsRead(alert.id)} className="p-2 hover:bg-green-100 rounded" title="Marcar como leído">
                      <Check className="w-4 h-4 text-green-600" />
                    </button>
                    <button onClick={() => dismissAlert(alert.id)} className="p-2 hover:bg-red-100 rounded" title="Descartar">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Leídas */}
      {read.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-dark-800 mb-3">Leídas ({read.length})</h2>
          <div className="space-y-2">
            {read.map((alert) => (
              <Card key={alert.id} className="opacity-60">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-600">{alert.title}</h3>
                    <p className="text-sm text-gray-500">{alert.message}</p>
                  </div>
                  <button onClick={() => dismissAlert(alert.id)} className="p-1 hover:bg-red-100 rounded">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}