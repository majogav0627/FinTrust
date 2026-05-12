import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/utils/helpers'

interface Transaction {
  id: string | number
  amount: string | number
  type: 'deposit' | 'withdrawal'
  description?: string
  created_at?: string
  createdAt?: string
  [key: string]: any
}

interface CategoryData {
  name: string
  value: number
}

interface ExpenseCategoriesChartProps {
  transactions: Transaction[]
}

const COLORS = [
  '#8A70FF', // primary-400
  '#E87A5D', // alert
  '#10B981', // green-500
  '#F59E0B', // amber-400
  '#06B6D4', // cyan-500
  '#EC4899', // pink-500
  '#6366F1', // indigo-500
  '#14B8A6', // teal-500
]

export const ExpenseCategoriesChart: React.FC<ExpenseCategoriesChartProps> = ({
  transactions,
}) => {
  // Use the description directly for category names so custom labels appear as written
  const categoryMap: { [key: string]: number } = {}

  transactions.forEach((tx) => {
    if (tx.type === 'withdrawal') {
      const category = tx.description?.trim() || 'Otros'
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount
      if (!isNaN(amount)) {
        categoryMap[category] = (categoryMap[category] || 0) + amount
      }
    }
  })

  const chartData: CategoryData[] = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        Sin gastos registrados
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-dark-800">{payload[0].name}</p>
          <p className="text-sm font-semibold text-alert">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-gray-500">
            {((payload[0].value / chartData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 20 }}>
        <Pie
          data={chartData}
          cx="35%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
        {chartData.map((_entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="middle"
          align="right"
          layout="vertical"
          wrapperStyle={{ paddingLeft: '20px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
