import React from 'react'
import { Download, Calendar } from 'lucide-react'
import { Card, CardHeader, CardBody, Button } from '@/components'
import { formatCurrency, formatDate } from '@/utils/helpers'
import { transactionService } from '@/services/api'
import { useBusinessStore } from '@/stores'

export const Reports: React.FC = () => {
  const { currentBusiness } = useBusinessStore()
  const [balance, setBalance] = React.useState<any>(null)
  const [transactions, setTransactions] = React.useState<any[]>([])
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' })

  React.useEffect(() => {
    if (currentBusiness) {
      loadData()
    }
  }, [currentBusiness])

  const loadData = async () => {
    try {
      if (!currentBusiness) return
      const [balanceData, txData] = await Promise.all([
        transactionService.getBalance(Number(currentBusiness.id)),
        transactionService.getHistory(Number(currentBusiness.id)),
      ])
      setBalance(balanceData)
      setTransactions(txData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const downloadReport = (format: 'csv' | 'pdf') => {
    let content = ''
    if (format === 'csv') {
      content = 'Fecha,Tipo,Monto,Descripción\n'
      transactions.forEach((tx) => {
        content += `${tx.created_at},${tx.type},${tx.amount},"${tx.description || ''}"\n`
      })
    }
    
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`)
    element.setAttribute('download', `reporte.${format}`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const currentBalance = balance ? parseFloat(balance.current_balance) : 0
  const totalIncome = balance ? parseFloat(balance.total_income) : 0
  const totalExpenses = balance ? parseFloat(balance.total_expenses) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-dark-800">Reportes</h1>
        <p className="text-gray-600 mt-1">Genera reportes detallados de tu negocio</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-600 mb-2">Balance Actual</p>
          <p className="text-2xl font-bold text-dark-800">{formatCurrency(currentBalance)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 mb-2">Ingresos Totales</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 mb-2">Gastos Totales</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
        </Card>
      </div>

      {/* Report Options */}
      <Card>
        <CardHeader title="Opciones de Reporte" />
        <CardBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-800 mb-1">Fecha Inicial</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-800 mb-1">Fecha Final</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => downloadReport('csv')} className="flex items-center gap-2 flex-1">
                <Download className="w-4 h-4" />
                Descargar CSV
              </Button>
              <Button onClick={() => downloadReport('pdf')} className="flex items-center gap-2 flex-1" variant="secondary">
                <Download className="w-4 h-4" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Transactions Summary */}
      <Card>
        <CardHeader title="Resumen de Transacciones" />
        <CardBody>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No hay transacciones</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Fecha</th>
                    <th className="px-3 py-2 text-left font-semibold">Tipo</th>
                    <th className="px-3 py-2 text-left font-semibold">Descripción</th>
                    <th className="px-3 py-2 text-right font-semibold">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 20).map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{formatDate(tx.created_at)}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.type === 'deposit' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </td>
                      <td className="px-3 py-2">{tx.description || '-'}</td>
                      <td className="px-3 py-2 text-right font-medium">
                        <span className={tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                          {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
