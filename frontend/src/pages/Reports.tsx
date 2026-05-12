import React from 'react'
import { Download } from 'lucide-react'
import { Card, CardHeader, CardBody, Button } from '@/components'
import { formatCurrency, formatDate } from '@/utils/helpers'
import { transactionService } from '@/services/api'
import { useBusinessStore } from '@/stores'
import jsPDF from 'jspdf'

export const Reports: React.FC = () => {
  const { currentBusiness } = useBusinessStore()
  const [balance, setBalance] = React.useState<any>(null)
  const [transactions, setTransactions] = React.useState<any[]>([])
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' })

  React.useEffect(() => {
    if (currentBusiness) loadData()
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

  const filteredTransactions = transactions.filter((tx) => {
    if (!dateRange.start && !dateRange.end) return true
    const txDate = new Date(tx.createdAt)
    const from = dateRange.start ? new Date(dateRange.start) : null
    const to = dateRange.end ? new Date(dateRange.end) : null
    if (from && txDate < from) return false
    if (to && txDate > to) return false
    return true
  })

  const downloadCSV = () => {
    // BOM para que Excel reconozca UTF-8
    const BOM = '\uFEFF'
    let content = BOM + 'Fecha,Tipo,Monto,Descripcion\n'
    filteredTransactions.forEach((tx) => {
      const fecha = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('es-SV') : '-'
      const tipo = tx.type === 'deposit' ? 'Ingreso' : 'Gasto'
      const monto = parseFloat(tx.amount).toFixed(2)
      const desc = (tx.description || '').replace(/"/g, '""')
      content += `${fecha},${tipo},${monto},"${desc}"\n`
    })
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`)
    element.setAttribute('download', 'reporte_fintrust.csv')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, pageWidth, 30, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('FinTrust', 14, 15)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Reporte Financiero', 14, 23)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-SV')}`, pageWidth - 14, 23, { align: 'right' })

    // Nombre del negocio
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(currentBusiness?.name || 'Mi Negocio', 14, 42)

    // Cajas de resumen
    const currentBalance = balance ? parseFloat(balance.current_balance) : 0
    const totalIncome   = balance ? parseFloat(balance.total_income)    : 0
    const totalExpenses = balance ? parseFloat(balance.total_expenses)  : 0

    const boxes = [
      { label: 'Balance Actual',   value: formatCurrency(currentBalance), color: [37, 99, 235]  },
      { label: 'Ingresos Totales', value: formatCurrency(totalIncome),    color: [16, 185, 129] },
      { label: 'Gastos Totales',   value: formatCurrency(totalExpenses),  color: [239, 68, 68]  },
    ]
    boxes.forEach((box, i) => {
      const x = 14 + i * 62
      doc.setFillColor(box.color[0], box.color[1], box.color[2])
      doc.rect(x, 48, 58, 18, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(box.label, x + 4, 55)
      doc.setFont('helvetica', 'bold')
      doc.text(box.value, x + 4, 63)
    })

    // Título tabla
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Detalle de Transacciones', 14, 80)

    // Encabezado tabla
    doc.setFillColor(15, 23, 42)
    doc.rect(14, 84, pageWidth - 28, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.text('Fecha',       16, 89)
    doc.text('Tipo',        60, 89)
    doc.text('Descripcion', 88, 89)
    doc.text('Monto', pageWidth - 16, 89, { align: 'right' })

    // Filas
    let y = 96
    filteredTransactions.slice(0, 30).forEach((tx, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(243, 244, 246)
        doc.rect(14, y - 4, pageWidth - 28, 8, 'F')
      }
      const fecha = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('es-SV') : '-'
      const tipo  = tx.type === 'deposit' ? 'Ingreso' : 'Gasto'
      const desc  = (tx.description || '-').substring(0, 30)
      const monto = `${tx.type === 'deposit' ? '+' : '-'}${formatCurrency(tx.amount)}`

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(55, 65, 81)
      doc.text(fecha, 16, y)
      doc.setTextColor(tx.type === 'deposit' ? 22 : 185, tx.type === 'deposit' ? 163 : 28, 74)
      doc.text(tipo, 60, y)
      doc.setTextColor(55, 65, 81)
      doc.text(desc, 88, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(tx.type === 'deposit' ? 22 : 220, tx.type === 'deposit' ? 163 : 38, tx.type === 'deposit' ? 74 : 38)
      doc.text(monto, pageWidth - 16, y, { align: 'right' })

      y += 8
      if (y > 270) { doc.addPage(); y = 20 }
    })

    // Footer
    doc.setTextColor(156, 163, 175)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text('FinTrust v0.1.0  ·  Universidad Dr. Jose Matias Delgado  ·  El Salvador',
      pageWidth / 2, 290, { align: 'center' })

    doc.save('reporte_fintrust.pdf')
  }

  const currentBalance = balance ? parseFloat(balance.current_balance) : 0
  const totalIncome    = balance ? parseFloat(balance.total_income)    : 0
  const totalExpenses  = balance ? parseFloat(balance.total_expenses)  : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-dark-800">Reportes</h1>
        <p className="text-gray-600 mt-1">Genera reportes detallados de tu negocio</p>
      </div>

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
              <Button onClick={downloadCSV} className="flex items-center gap-2 flex-1">
                <Download className="w-4 h-4" />
                Descargar CSV
              </Button>
              <Button onClick={downloadPDF} className="flex items-center gap-2 flex-1" variant="secondary">
                <Download className="w-4 h-4" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Resumen de Transacciones" />
        <CardBody>
          {filteredTransactions.length === 0 ? (
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
                  {filteredTransactions.slice(0, 20).map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('es-SV') : '-'}
                      </td>
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