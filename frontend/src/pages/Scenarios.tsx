import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Layers, Plus, Star, TrendingUp, TrendingDown, Calendar, DollarSign, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Scenario {
  id: number
  name: string
  description?: string
  probability?: number
  startDate: string
  endDate: string
  isBaseline: boolean
  createdAt: string
  updatedAt: string
}

export function Scenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 1,
      name: 'Baseline',
      description: 'Standard business operations forecast',
      probability: 100,
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      isBaseline: true,
      createdAt: '2024-03-01',
      updatedAt: '2024-03-01',
    },
    {
      id: 2,
      name: 'Optimistic Growth',
      description: 'Best-case scenario with accelerated sales',
      probability: 30,
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      isBaseline: false,
      createdAt: '2024-03-01',
      updatedAt: '2024-03-01',
    },
    {
      id: 3,
      name: 'Conservative',
      description: 'Pessimistic scenario with delayed payments',
      probability: 40,
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      isBaseline: false,
      createdAt: '2024-03-01',
      updatedAt: '2024-03-01',
    },
  ])
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(scenarios[0])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newScenario, setNewScenario] = useState({
    name: '',
    description: '',
    probability: 50,
    startDate: '',
    endDate: '',
  })

  const handleCreateScenario = () => {
    const scenario: Scenario = {
      id: Date.now(),
      name: newScenario.name,
      description: newScenario.description,
      probability: newScenario.probability,
      startDate: newScenario.startDate,
      endDate: newScenario.endDate,
      isBaseline: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setScenarios([...scenarios, scenario])
    setShowCreateModal(false)
    setNewScenario({ name: '', description: '', probability: 50, startDate: '', endDate: '' })
  }

  const handleSetBaseline = (scenarioId: number) => {
    setScenarios(scenarios.map(s => ({
      ...s,
      isBaseline: s.id === scenarioId,
    })))
  }

  const getScenarioForecast = (scenario: Scenario) => {
    const days = Math.floor((new Date(scenario.endDate).getTime() - new Date(scenario.startDate).getTime()) / (1000 * 60 * 60 * 24))
    const multiplier = scenario.name === 'Optimistic Growth' ? 1.5 : scenario.name === 'Conservative' ? 0.7 : 1
    return Array.from({ length: Math.min(days, 90) }, (_, i) => {
      const date = new Date(scenario.startDate)
      date.setDate(date.getDate() + i)
      const inflow = Math.floor(Math.random() * 20000 * multiplier) + 5000 * multiplier
      const outflow = Math.floor(Math.random() * 15000 * multiplier) + 3000 * multiplier
      return {
        date: date.toISOString(),
        formattedDate: formatDate(date),
        inflow,
        outflow,
        netCashflow: inflow - outflow,
        cumulativeBalance: 125000 * multiplier + (inflow - outflow) * (i + 1),
      }
    })
  }

  const getScenarioMetrics = (scenario: Scenario) => {
    const forecast = getScenarioForecast(scenario)
    const totalInflow = forecast.reduce((sum, f) => sum + f.inflow, 0)
    const totalOutflow = forecast.reduce((sum, f) => sum + f.outflow, 0)
    const netCashflow = totalInflow - totalOutflow
    const endingBalance = forecast[forecast.length - 1]?.cumulativeBalance || 0

    return {
      totalInflow,
      totalOutflow,
      netCashflow,
      endingBalance,
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-amber-700 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <span>
          <strong>Preview Mode:</strong> Scenarios are currently in demo mode. Backend integration will be available in a future update.
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Scenario Planning</h2>
          <p className="text-slate-500 mt-1">Model different business outcomes and prepare for uncertainty</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          Create Scenario
        </Button>
      </div>
      {showCreateModal && (
        <Card className="shadow-premium-lg">
          <CardHeader>
            <CardTitle>Create New Scenario</CardTitle>
            <CardDescription>Define a new business scenario for forecasting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scenario-name">Scenario Name</Label>
                <Input
                  id="scenario-name"
                  value={newScenario.name}
                  onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
                  placeholder="e.g., Optimistic Growth"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenario-description">Description</Label>
                <Input
                  id="scenario-description"
                  value={newScenario.description}
                  onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })}
                  placeholder="Describe the scenario"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="scenario-probability">Probability (%)</Label>
                  <Input
                    id="scenario-probability"
                    type="number"
                    min={0}
                    max={100}
                    value={newScenario.probability}
                    onChange={(e) => setNewScenario({ ...newScenario, probability: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scenario-start">Start Date</Label>
                  <Input
                    id="scenario-start"
                    type="date"
                    value={newScenario.startDate}
                    onChange={(e) => setNewScenario({ ...newScenario, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="scenario-end">End Date</Label>
                  <Input
                    id="scenario-end"
                    type="date"
                    value={newScenario.endDate}
                    onChange={(e) => setNewScenario({ ...newScenario, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateScenario}>Create Scenario</Button>
          </CardFooter>
        </Card>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => {
          const metrics = getScenarioMetrics(scenario)
          return (
            <Card
              key={scenario.id}
              className={`cursor-pointer transition-all duration-300 ${
                selectedScenario?.id === scenario.id
                  ? 'ring-2 ring-ocean-500 shadow-premium-lg'
                  : 'hover:shadow-premium-lg'
              }`}
              onClick={() => setSelectedScenario(scenario)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-ocean-500" />
                    <CardTitle className="text-base font-semibold">
                      {scenario.name}
                    </CardTitle>
                  </div>
                  {scenario.isBaseline && (
                    <Badge variant="violet" className="gap-1">
                      <Star className="w-3 h-3" />
                      Baseline
                    </Badge>
                  )}
                </div>
                {scenario.description && (
                  <CardDescription className="text-sm">
                    {scenario.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scenario.probability !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Probability</span>
                      <span className="font-medium text-slate-900">{scenario.probability}%</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Net Cashflow</span>
                    <span className={`font-medium ${metrics.netCashflow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {metrics.netCashflow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(metrics.netCashflow))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Ending Balance</span>
                    <span className="font-medium text-ocean-600">
                      {formatCurrency(metrics.endingBalance)}
                    </span>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(scenario.startDate)} - {formatDate(scenario.endDate)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 gap-2">
                {scenario.isBaseline && (
                  <Badge variant="violet" className="gap-1">
                    <Star className="w-3 h-3" />
                    Baseline
                  </Badge>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSetBaseline(scenario.id)
                    }}
                    aria-label="Set this scenario as baseline"
                  >
                    Set as Baseline
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
      {selectedScenario && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="hover:shadow-premium-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-ocean-500" />
                Scenario Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getScenarioForecast(selectedScenario)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white rounded-lg shadow-lg border border-slate-100 p-3">
                            <p className="text-sm font-medium text-slate-900 mb-2">
                              {payload[0].payload.formattedDate}
                            </p>
                            <p className="text-sm text-ocean-600">
                              Balance: {formatCurrency(payload[0].value as number)}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeBalance"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={false}
                    name="Balance"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="hover:shadow-premium-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Scenario Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-ocean-500" />
                    Key Metrics
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Inflow</span>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(getScenarioMetrics(selectedScenario).totalInflow)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Outflow</span>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(getScenarioMetrics(selectedScenario).totalOutflow)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Net Cashflow</span>
                      <span className={`font-medium ${getScenarioMetrics(selectedScenario).netCashflow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {getScenarioMetrics(selectedScenario).netCashflow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(getScenarioMetrics(selectedScenario).netCashflow))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-ocean-50 border border-ocean-200">
                  <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-ocean-500" />
                    Recommendation
                  </h4>
                  <p className="text-sm text-slate-600">
                    {selectedScenario.name === 'Optimistic Growth'
                      ? 'Consider investing excess cash in growth initiatives while maintaining liquidity reserves.'
                      : selectedScenario.name === 'Conservative'
                      ? 'Build cash reserves and consider factoring options to improve cash flow.'
                      : 'Maintain current operations while monitoring cash flow closely for opportunities.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
