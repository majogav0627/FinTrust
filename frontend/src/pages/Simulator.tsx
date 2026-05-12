import React from 'react'
import { Play } from 'lucide-react'
import { Card, CardHeader, CardBody, Button } from '@/components'
import { formatCurrency } from '@/utils/helpers'
import { transactionService } from '@/services/api'
import { useBusinessStore } from '@/stores'

export const Simulator: React.FC = () => {
  const { currentBusiness } = useBusinessStore()
  const [balance, setBalance] = React.useState<any>(null)
  const [scenarios, setScenarios] = React.useState<any[]>([])
  const [simulation, setSimulation] = React.useState<any>(null)
  const [selectedScenario, setSelectedScenario] = React.useState<string>('')

  React.useEffect(() => {
    if (currentBusiness) {
      loadData()
    }
  }, [currentBusiness])

  const loadData = async () => {
    try {
      if (!currentBusiness) return
      const balanceData = await transactionService.getBalance(Number(currentBusiness.id))
      setBalance(balanceData)
      
      const predefinedScenarios = [
        {
          id: 'optimistic',
          name: 'Escenario Optimista',
          description: 'Aumenta ingresos 20% y reduce gastos 10%',
          incomeMultiplier: 1.2,
          expenseMultiplier: 0.9,
        },
        {
          id: 'realistic',
          name: 'Escenario Realista',
          description: 'Mantiene tendencia actual',
          incomeMultiplier: 1.0,
          expenseMultiplier: 1.0,
        },
        {
          id: 'pessimistic',
          name: 'Escenario Pesimista',
          description: 'Reduce ingresos 15% y aumenta gastos 15%',
          incomeMultiplier: 0.85,
          expenseMultiplier: 1.15,
        },
      ]
      setScenarios(predefinedScenarios)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const runSimulation = () => {
    const scenario = scenarios.find(s => s.id === selectedScenario)
    if (!scenario || !balance) return

    const currentBalance = parseFloat(balance.current_balance)
    const monthlyIncome = parseFloat(balance.total_income) / 12 || 1000
    const monthlyExpense = parseFloat(balance.total_expenses) / 12 || 500

    const projectedIncome = monthlyIncome * scenario.incomeMultiplier
    const projectedExpense = monthlyExpense * scenario.expenseMultiplier
    const monthlyProfit = projectedIncome - projectedExpense

    const projections = []
    let runningBalance = currentBalance

    for (let i = 1; i <= 12; i++) {
      runningBalance += monthlyProfit
      projections.push({
        month: i,
        balance: runningBalance,
        income: projectedIncome,
        expense: projectedExpense,
      })
    }

    setSimulation({
      scenario: scenario.name,
      projections,
      finalBalance: runningBalance,
      totalProfit: monthlyProfit * 12,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-dark-800">Simulador Financiero</h1>
        <p className="text-gray-600 mt-1">Proyecta el desempeño de tu negocio</p>
      </div>

      {/* Scenario Selection */}
      <Card>
        <CardHeader title="Selecciona un Escenario" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`p-4 border-2 rounded cursor-pointer transition ${
                  selectedScenario === scenario.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-dark-800">{scenario.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
              </div>
            ))}
          </div>
          <Button onClick={runSimulation} disabled={!selectedScenario} className="flex items-center gap-2 w-full justify-center">
            <Play className="w-4 h-4" />
            Ejecutar Simulación
          </Button>
        </CardBody>
      </Card>

      {/* Results */}
      {simulation && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div>
                <p className="text-sm text-gray-600 mb-2">Escenario</p>
                <p className="text-xl font-bold text-dark-800">{simulation.scenario}</p>
              </div>
            </Card>

            <Card>
              <div>
                <p className="text-sm text-gray-600 mb-2">Balance Final (12 meses)</p>
                <p className={`text-xl font-bold ${simulation.finalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(simulation.finalBalance)}
                </p>
              </div>
            </Card>

            <Card>
              <div>
                <p className="text-sm text-gray-600 mb-2">Ganancia Proyectada</p>
                <p className={`text-xl font-bold ${simulation.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(simulation.totalProfit)}
                </p>
              </div>
            </Card>
          </div>

          {/* Projections Table */}
          <Card>
            <CardHeader title="Proyección Mensual" />
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Mes</th>
                      <th className="px-3 py-2 text-right font-semibold">Ingresos</th>
                      <th className="px-3 py-2 text-right font-semibold">Gastos</th>
                      <th className="px-3 py-2 text-right font-semibold">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulation.projections.map((proj: any) => (
                      <tr key={proj.month} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2">Mes {proj.month}</td>
                        <td className="px-3 py-2 text-right text-green-600">{formatCurrency(proj.income)}</td>
                        <td className="px-3 py-2 text-right text-red-600">{formatCurrency(proj.expense)}</td>
                        <td className="px-3 py-2 text-right font-semibold">{formatCurrency(proj.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
