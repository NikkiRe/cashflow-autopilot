import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Zap, TrendingUp, Clock, CheckCircle, AlertCircle, ArrowRight, DollarSign, Calculator, FileText, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface FactoredInvoice {
  id: number
  invoiceNumber: string
  amount: number
  factoringPercentage: number
  advanceAmount: number
  fee: number
  factoringDate: string
  originalDueDate: string
  clientName: string
}

export function Factoring() {
  const [factoredInvoices, setFactoredInvoices] = useState<FactoredInvoice[]>([
    {
      id: 1,
      invoiceNumber: 'INV-2024-002',
      amount: 18000,
      factoringPercentage: 85,
      advanceAmount: 15300,
      fee: 900,
      factoringDate: '2024-02-25',
      originalDueDate: '2024-03-25',
      clientName: 'Tech Solutions',
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-010',
      amount: 35000,
      factoringPercentage: 80,
      advanceAmount: 28000,
      fee: 1750,
      factoringDate: '2024-02-20',
      originalDueDate: '2024-04-20',
      clientName: 'Enterprise Corp',
    },
  ])

  const [selectedInvoice, setSelectedInvoice] = useState<FactoredInvoice | null>(factoredInvoices[0])
  const [factoringRate, setFactoringRate] = useState(85)
  const [feePercentage, setFeePercentage] = useState(5)
  const [calculatorAmount, setCalculatorAmount] = useState(10000)

  const getTotalAdvance = () => {
    return factoredInvoices.reduce((sum, inv) => sum + inv.advanceAmount, 0)
  }

  const getTotalFee = () => {
    return factoredInvoices.reduce((sum, inv) => sum + inv.fee, 0)
  }

  const getTotalOriginal = () => {
    return factoredInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  }

  const calculateAdvance = (amount: number, percentage: number, feeRate: number) => {
    const advance = amount * (percentage / 100)
    const fee = amount * (feeRate / 100)
    return {
      advanceAmount: advance,
      fee: fee,
      netAmount: advance - fee,
    }
  }

  const getCashFlowImpactData = () => {
    return Array.from({ length: 90 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const baseCashflow = 125000 + (Math.random() * 20000 - 10000) * i
      const factoringBoost = i < 30 ? 10000 * (1 - i / 30) : 0
      return {
        date: formatDate(date),
        withoutFactoring: baseCashflow,
        withFactoring: baseCashflow + factoringBoost,
      }
    })
  }

  const getLiquidityImprovement = () => {
    const totalAdvance = getTotalAdvance()
    const totalFee = getTotalFee()
    const netImprovement = totalAdvance - totalFee
    const percentage = (netImprovement / getTotalOriginal()) * 100
    return {
      totalAdvance,
      totalFee,
      netImprovement,
      percentage,
    }
  }

  const handleNewFactoringDeal = () => {
    const newDeal: FactoredInvoice = {
      id: Date.now(),
      invoiceNumber: `INV-2024-${String(factoredInvoices.length + 1).padStart(3, '0')}`,
      amount: calculatorAmount,
      factoringPercentage: factoringRate,
      advanceAmount: calculateAdvance(calculatorAmount, factoringRate, feePercentage).advanceAmount,
      fee: calculateAdvance(calculatorAmount, factoringRate, feePercentage).fee,
      factoringDate: new Date().toISOString().split('T')[0],
      originalDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientName: 'New Client',
    }
    setFactoredInvoices([...factoredInvoices, newDeal])
    setSelectedInvoice(newDeal)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Invoice Factoring</h2>
          <p className="text-slate-500 mt-1">Accelerate cash flow by selling your invoices</p>
        </div>
        <Button className="gap-2" onClick={handleNewFactoringDeal}>
          <Zap className="w-4 h-4" />
          New Factoring Deal
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-premium-lg transition-all duration-300 bg-gradient-to-br from-ocean-50 to-violet-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Total Advanced</p>
                <p className="text-2xl font-bold text-ocean-600">
                  {formatCurrency(getTotalAdvance())}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-ocean-500 to-violet-500">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-premium-lg transition-all duration-300 bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 mb-1">Total Fees</p>
                <p className="text-2xl font-bold text-amber-700">
                  {formatCurrency(getTotalFee())}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500">
                <Calculator className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-premium-lg transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700 mb-1">Net Improvement</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(getLiquidityImprovement().netImprovement)}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  {getLiquidityImprovement().percentage.toFixed(1)}% of total
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="hover:shadow-premium-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-ocean-500" />
            Factoring Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Invoice Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(Number(e.target.value) || 0)}
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Advance Rate (%)</label>
                <div className="relative">
                  <input
                    type="range"
                    min={50}
                    max={95}
                    value={factoringRate}
                    onChange={(e) => setFactoringRate(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>50%</span>
                    <span className="font-medium text-ocean-600">{factoringRate}%</span>
                    <span>95%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Fee Rate (%)</label>
                <div className="relative">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={feePercentage}
                    onChange={(e) => setFeePercentage(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1%</span>
                    <span className="font-medium text-ocean-600">{feePercentage}%</span>
                    <span>10%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Calculated Results</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-600">Advance Amount</span>
                  <span className="text-lg font-semibold text-ocean-600">
                    {formatCurrency(calculateAdvance(calculatorAmount, factoringRate, feePercentage).advanceAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-600">Factoring Fee</span>
                  <span className="text-lg font-semibold text-amber-600">
                    {formatCurrency(calculateAdvance(calculatorAmount, factoringRate, feePercentage).fee)}
                  </span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-sm font-medium text-emerald-700">Net Amount</span>
                  <span className="text-lg font-bold text-emerald-700">
                    {formatCurrency(calculateAdvance(calculatorAmount, factoringRate, feePercentage).netAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-premium-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-ocean-500" />
            Cash Flow Impact Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={getCashFlowImpactData()}>
              <defs>
                <linearGradient id="colorWithout" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorWith" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
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
                          {payload[0].payload.date}
                        </p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value as number)}
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="withoutFactoring"
                stroke="#94a3b8"
                fill="url(#colorWithout)"
                strokeWidth={2}
                name="Without Factoring"
              />
              <Area
                type="monotone"
                dataKey="withFactoring"
                stroke="#10b981"
                fill="url(#colorWith)"
                strokeWidth={2}
                name="With Factoring"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover:shadow-premium-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-ocean-500" />
              Factored Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {factoredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                    selectedInvoice?.id === invoice.id
                      ? 'border-ocean-500 bg-ocean-50 shadow-sm'
                      : 'border-slate-200 hover:border-ocean-300 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-slate-900">
                          {invoice.invoiceNumber}
                        </p>
                        <Badge variant="violet">Factored</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{invoice.clientName}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {formatDate(invoice.originalDueDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Factored: {formatDate(invoice.factoringDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-semibold text-emerald-600">
                        +{formatCurrency(invoice.advanceAmount)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {invoice.factoringPercentage}% advance
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedInvoice && (
          <Card className="hover:shadow-premium-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-50">
                  <h4 className="text-sm font-medium text-slate-900 mb-2">
                    {selectedInvoice.invoiceNumber} - {selectedInvoice.clientName}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Original Amount</p>
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(selectedInvoice.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Advance Rate</p>
                      <p className="font-semibold text-ocean-600">
                        {selectedInvoice.factoringPercentage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Advance Amount</p>
                      <p className="font-semibold text-emerald-600">
                        {formatCurrency(selectedInvoice.advanceAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Factoring Fee</p>
                      <p className="font-semibold text-amber-600">
                        {formatCurrency(selectedInvoice.fee)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Original Due Date</p>
                      <p className="font-semibold text-slate-900">
                        {formatDate(selectedInvoice.originalDueDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Factoring Date</p>
                      <p className="font-semibold text-slate-900">
                        {formatDate(selectedInvoice.factoringDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium text-emerald-900">Net Received</p>
                        <p className="text-xs text-emerald-700">
                          {(selectedInvoice.advanceAmount - selectedInvoice.fee).toFixed(2)}% of original
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(selectedInvoice.advanceAmount - selectedInvoice.fee)}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-ocean-50 border border-ocean-200">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-ocean-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-1">Cash Flow Benefit</h4>
                      <p className="text-sm text-slate-600">
                        This factoring deal improved your cash flow by{' '}
                        <span className="font-semibold text-ocean-600">
                          {formatCurrency(selectedInvoice.advanceAmount - selectedInvoice.fee)}
                        </span>{' '}
                        immediately, compared to waiting until{' '}
                        {formatDate(selectedInvoice.originalDueDate)}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
