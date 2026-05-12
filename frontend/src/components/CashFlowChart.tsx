import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/utils/helpers'

interface Transaction {
  id: string | number
  amount: string | number
  type: 'deposit' | 'withdrawal'
  created_at?: string
  createdAt?: string
  [key: string]: any
}

interface ChartData {
  date: string
  income: number
  expenses: number
}

interface CashFlowChartProps {
  transactions: Transaction[]
  debug?: boolean
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ transactions, debug }) => {
  // Get last 7 days data
  const generateChartData = (): ChartData[] => {
    const data: { [key: string]: ChartData } = {}
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
      data[dateStr] = { date: dateStr, income: 0, expenses: 0 }
    }

    // Process transactions
    transactions.forEach((tx) => {
      const dateString = tx.createdAt || tx.created_at
      if (!dateString) {
        console.warn('Transaction missing date field:', tx)
        return
      }
      const txDate = new Date(dateString)
      const dateStr = txDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
      
      if (data[dateStr]) {
        const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount
        if (!isNaN(amount)) {
          if (tx.type === 'deposit') {
            data[dateStr].income += amount
          } else {
            data[dateStr].expenses += amount
          }
        }
      }
    })

    return Object.values(data)
  }

  const chartData = generateChartData()
  
  if (debug) {
    console.log('CashFlowChart - Transactions:', transactions)
    transactions.forEach((tx, idx) => {
      console.log(`TX ${idx}:`, {
        amount: tx.amount,
        type: typeof tx.amount,
        type_tx: tx.type,
        created_at: tx.created_at,
        createdAt: tx.createdAt,
        parsed: typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount
      })
    })
    console.log('CashFlowChart - Chart Data:', chartData)
    chartData.forEach((data) => {
      console.log(`Date ${data.date}: Income=${data.income}, Expenses=${data.expenses}`)
    })
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-dark-800">{payload[0].payload.date}</p>
          <p className="text-sm text-green-600">
            Ingresos: {formatCurrency(payload[0].payload.income)}
          </p>
          <p className="text-sm text-alert">
            Gastos: {formatCurrency(payload[0].payload.expenses)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickLine={{ stroke: '#E5E7EB' }}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
        <Bar
          dataKey="income"
          fill="#10B981"
          radius={[8, 8, 0, 0]}
          name="Ingresos"
        />
        <Bar
          dataKey="expenses"
          fill="#E87A5D"
          radius={[8, 8, 0, 0]}
          name="Gastos"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
