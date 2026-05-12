import React, { useEffect, useState } from 'react'
import { TrendingUp, AlertCircle, Package, Zap } from 'lucide-react'
import { Card, CardHeader, CardBody, CashFlowChart, TransactionModal, Button, ExpenseCategoriesChart } from '@/components'
import { formatCurrency, formatDate } from '@/utils/helpers'
import { transactionService } from '@/services/api'
import { useBusinessStore } from '@/stores'

interface SummaryCard {
  title: string
  value: string
  change?: number
  icon: React.ReactNode
  color: string
}

export const Dashboard: React.FC = () => {
  const { currentBusiness } = useBusinessStore()
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (!currentBusiness) return

    loadData()
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [currentBusiness])

  const loadData = async () => {
    try {
      setLoading(true)
      if (!currentBusiness) return
      
      const [balanceData, txData] = await Promise.all([
        transactionService.getBalance(Number(currentBusiness.id)),
        transactionService.getHistory(Number(currentBusiness.id)),
      ])
      
      setBalance(balanceData)
      setTransactions(txData.slice(0, 5))
      setLastUpdated(new Date())

      // Cargar productos del localStorage
      const savedProducts = localStorage.getItem(`products_${Number(currentBusiness.id)}`)
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts))
      }

      // Generar alertas basadas en datos reales
      generateAlerts(balanceData, txData, savedProducts ? JSON.parse(savedProducts) : [])
    } finally {
      setLoading(false)
    }
  }

  const generateAlerts = (balanceData: any, _txData: any[], savedProducts: any[]) => {
    const generatedAlerts: any[] = []

    // Obtener valores numéricos
    const currentBalance = parseFloat(balanceData?.current_balance || 0)
    const totalIncome = parseFloat(balanceData?.total_income || 0)
    const totalExpenses = parseFloat(balanceData?.total_expenses || 0)

    // Alerta: Stock bajo
    if (savedProducts.length > 0) {
      const lowStockProducts = savedProducts.filter((p: any) => p.quantity < p.minStock)
      if (lowStockProducts.length > 0) {
        generatedAlerts.push({
          id: 1,
          type: 'inventory',
          severity: 'warning',
          title: 'Inventario bajo',
          description: `${lowStockProducts.length} productos requieren atención`,
          color: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          titleColor: 'text-yellow-900',
          textColor: 'text-yellow-700',
        })
      }

      // Alerta: Productos agotados
      const outOfStockProducts = savedProducts.filter((p: any) => p.quantity === 0)
      if (outOfStockProducts.length > 0) {
        generatedAlerts.push({
          id: 2,
          type: 'inventory',
          severity: 'critical',
          title: 'Productos agotados',
          description: `${outOfStockProducts.length} productos sin stock`,
          color: 'bg-red-50',
          borderColor: 'border-red-200',
          titleColor: 'text-red-900',
          textColor: 'text-red-700',
        })
      }
    }

    // Alerta: Liquidez baja
    const razionCorriente = totalIncome > 0 ? currentBalance / totalIncome : 0
    if (razionCorriente < 1) {
      generatedAlerts.push({
        id: 3,
        type: 'finance',
        severity: 'critical',
        title: 'Liquidez baja',
        description: 'Tu razón de liquidez está por debajo de lo recomendado',
        color: 'bg-red-50',
        borderColor: 'border-red-200',
        titleColor: 'text-red-900',
        textColor: 'text-red-700',
      })
    }

    // Alerta: Gastos altos
    if (totalIncome > 0) {
      const expenseRatio = totalExpenses / totalIncome
      if (expenseRatio > 0.85) {
        generatedAlerts.push({
          id: 4,
          type: 'finance',
          severity: 'warning',
          title: 'Gastos elevados',
          description: `Gastos representan el ${(expenseRatio * 100).toFixed(1)}% de ingresos`,
          color: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          titleColor: 'text-yellow-900',
          textColor: 'text-yellow-700',
        })
      }
    }

    // Alerta: Análisis disponible (si no hay otras alertas)
    if (generatedAlerts.length === 0) {
      generatedAlerts.push({
        id: 5,
        type: 'report',
        severity: 'info',
        title: 'Análisis disponible',
        description: 'Nuevo reporte mensual listo para revisar',
        color: 'bg-blue-50',
        borderColor: 'border-blue-200',
        titleColor: 'text-blue-900',
        textColor: 'text-blue-700',
      })
    }

    setAlerts(generatedAlerts.slice(0, 3)) // Mostrar máximo 3 alertas
  }

  const productCount = products.length

  const summaryCards: SummaryCard[] = [
    {
      title: 'Saldo Disponible',
      value: balance ? formatCurrency(balance.current_balance) : '$0.00',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-primary-50 text-primary-400',
    },
    {
      title: 'Ingresos Totales',
      value: balance ? formatCurrency(balance.total_income) : '$0.00',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-green-50 text-green-500',
    },
    {
      title: 'Gastos Totales',
      value: balance ? formatCurrency(balance.total_expenses) : '$0.00',
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'bg-alert/10 text-alert',
    },
    {
      title: 'Productos',
      value: productCount.toString(),
      icon: <Package className="w-6 h-6" />,
      color: 'bg-purple-50 text-purple-500',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Cargando panel...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-dark-800">Panel</h1>
        <p className="text-gray-600 mt-1">Bienvenido de vuelta, aquí está tu resumen financiero</p>
        {lastUpdated && (
          <p className="text-xs text-gray-500 mt-2">Última actualización: {lastUpdated.toLocaleTimeString()}</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={() => setDepositModalOpen(true)}
        >
          + Depositar
        </Button>
        <Button
          variant="danger"
          onClick={() => setWithdrawModalOpen(true)}
        >
          - Retirar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">{card.title}</p>
                <p className="text-2xl font-display font-bold text-dark-800">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                {card.icon}
              </div>
            </div>
            {card.change !== undefined && (
              <p className={`text-xs mt-3 ${card.change >= 0 ? 'text-green-600' : 'text-alert'}`}>
                {card.change >= 0 ? '↑' : '↓'} {Math.abs(card.change)}% vs mes anterior
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <Card className="lg:col-span-2">
          <CardHeader title="Flujo de Caja" subtitle="Últimas 7 días" />
          <CardBody>
            {transactions.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Sin transacciones en los últimos 7 días
              </div>
            ) : (
              <CashFlowChart transactions={transactions} debug />
            )}
          </CardBody>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader title="Alertas" subtitle={`${alerts.length} activas`} />
          <CardBody>
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>✅ Todo está bien</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-3 ${alert.color} rounded-lg border ${alert.borderColor}`}>
                    <p className={`text-sm font-medium ${alert.titleColor}`}>{alert.title}</p>
                    <p className={`text-xs ${alert.textColor} mt-1`}>{alert.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Expense Categories Chart */}
      <Card>
        <CardHeader title="Gastos por Categoría" subtitle="Desglose de tus gastos" />
        <CardBody>
          {transactions.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Sin categorías de gastos
            </div>
          ) : (
            <ExpenseCategoriesChart transactions={transactions} />
          )}
        </CardBody>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader title="Movimientos Recientes" />
        <CardBody>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay movimientos todavía</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-dark-800">{tx.description || tx.type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">{formatDate(tx.created_at)}</p>
                      {tx.fincore_status && (
                        <span className="text-[10px] uppercase tracking-[0.2em] bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                          {tx.fincore_status}
                        </span>
                      )}
                      {tx.fincoreStatus && !tx.fincore_status && (
                        <span className="text-[10px] uppercase tracking-[0.2em] bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                          {tx.fincoreStatus}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`font-semibold ${tx.type === 'deposit' ? 'text-green-600' : 'text-alert'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modals */}
      {currentBusiness && (
        <>
          <TransactionModal
            isOpen={depositModalOpen}
            onClose={() => setDepositModalOpen(false)}
            businessId={String(currentBusiness.id)}
            type="deposit"
            onSuccess={loadData}
          />
          <TransactionModal
            isOpen={withdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            businessId={String(currentBusiness.id)}
            type="withdrawal"
            onSuccess={loadData}
          />
        </>
      )}
    </div>
  )
}
