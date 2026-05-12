import React from 'react'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components'
import { formatCurrency } from '@/utils/helpers'
import { transactionService } from '@/services/api'
import { useBusinessStore } from '@/stores'

export const Finances: React.FC = () => {
  const { currentBusiness } = useBusinessStore()
  const [loading, setLoading] = React.useState(true)
  const [balance, setBalance] = React.useState<any>(null)
  const [transactions, setTransactions] = React.useState<any[]>([])
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null)

  React.useEffect(() => {
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
      setTransactions(txData)
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Cargando finanzas...</p>
      </div>
    )
  }

  const currentBalance = balance ? parseFloat(balance.current_balance) : 0
  const totalIncome = balance ? parseFloat(balance.total_income) : 0
  const totalExpenses = balance ? parseFloat(balance.total_expenses) : 0
  const netProfit = totalIncome - totalExpenses

  const incomeByCategory = transactions.reduce((acc: any, tx: any) => {
    if (tx.type === 'deposit') {
      const cat = tx.description || 'Otros'
      acc[cat] = (acc[cat] || 0) + parseFloat(tx.amount)
    }
    return acc
  }, {})

  const expenseByCategory = transactions.reduce((acc: any, tx: any) => {
    if (tx.type === 'withdrawal') {
      const cat = tx.description || 'Otros'
      acc[cat] = (acc[cat] || 0) + parseFloat(tx.amount)
    }
    return acc
  }, {})

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-dark-800">Finanzas</h1>
        <p className="text-gray-600 mt-1">Gestión integral de ingresos y gastos</p>
        {lastUpdated && (
          <p className="text-xs text-gray-500 mt-2">Última actualización: {lastUpdated.toLocaleTimeString()}</p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Balance Actual</p>
              <p className="text-2xl font-bold text-dark-800">{formatCurrency(currentBalance)}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary-50 text-primary-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Ingresos</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-500">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Gastos</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 text-red-500">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Ganancia Neta</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${netProfit >= 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
              {netProfit >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>
          </div>
        </Card>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Ingresos por Categoría" />
          <CardBody>
            {Object.keys(incomeByCategory).length === 0 ? (
              <p className="text-gray-500 text-center py-6">Sin ingresos registrados</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(incomeByCategory)
                  .sort((a: any, b: any) => b[1] - a[1])
                  .map(([category, amount]: [string, any]) => (
                    <div key={category} className="flex items-center justify-between">
                      <p className="text-sm font-medium text-dark-800">{category}</p>
                      <p className="text-sm font-semibold text-green-600">{formatCurrency(amount)}</p>
                    </div>
                  ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Gastos por Categoría" />
          <CardBody>
            {Object.keys(expenseByCategory).length === 0 ? (
              <p className="text-gray-500 text-center py-6">Sin gastos registrados</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(expenseByCategory)
                  .sort((a: any, b: any) => b[1] - a[1])
                  .map(([category, amount]: [string, any]) => (
                    <div key={category} className="flex items-center justify-between">
                      <p className="text-sm font-medium text-dark-800">{category}</p>
                      <p className="text-sm font-semibold text-red-600">{formatCurrency(amount)}</p>
                    </div>
                  ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader title="Transacciones Recientes" />
        <CardBody>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-6">Sin transacciones</p>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-dark-800">{tx.description || 'Sin descripción'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">{tx.type === 'deposit' ? 'Ingreso' : 'Gasto'}</p>
                      {(tx.fincore_status || tx.fincoreStatus) && (
                        <span className="text-[10px] uppercase tracking-[0.2em] bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                          {tx.fincore_status || tx.fincoreStatus}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`font-semibold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
