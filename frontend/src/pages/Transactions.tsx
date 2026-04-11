import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AccountSelector } from '@/components/AccountSelector'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAccount } from '@/contexts/AccountContext'
import { TransactionDirection } from '@/types'
import type { BankTransactionDTO, CreateBankTransactionRequest } from '@/types'
import { ArrowLeftRight, ArrowDownLeft, Plus, Search, Trash2, Download, TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { GlassTooltip } from '@/components/ui/ChartTooltip'
import { AnimatedCurrency } from '@/components/ui/AnimatedValue'

export function Transactions() {
  const { selectedCashAccountId, loading: accountLoading } = useAccount()

  const [transactions, setTransactions] = useState<BankTransactionDTO[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | string>('ALL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [createData, setCreateData] = useState<CreateBankTransactionRequest>({
    cashAccountId: 0,
    bookedAt: new Date().toISOString().split('T')[0],
    amount: 0,
    currency: 'USD',
    direction: TransactionDirection.IN,
  })

  const loadTransactions = async () => {
    if (!selectedCashAccountId) {
      setTransactions([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await api.getBankTransactionsByCashAccount(selectedCashAccountId)
      setTransactions(data)
    } catch (err) {
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadTransactions()
  }, [selectedCashAccountId])

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCashAccountId) {
      setError('Please select a cash account first')
      return
    }

    try {
      await api.createBankTransaction({
        ...createData,
        cashAccountId: selectedCashAccountId,
      })
      setShowCreateModal(false)
      setCreateData({
        cashAccountId: 0,
        bookedAt: new Date().toISOString().split('T')[0],
        amount: 0,
        currency: 'USD',
        direction: TransactionDirection.IN,
      })
      await loadTransactions()
    } catch (err) {
      setError('Failed to create transaction')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setDeleteId(id)
      await api.deleteBankTransaction(id)
      await loadTransactions()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete transaction'
      setError(msg.includes('404') || msg.includes('Not Found') ? 'Transaction not found (refresh the list)' : msg)
    } finally {
      setDeleteId(null)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'ALL' || transaction.direction === typeFilter
    return matchesSearch && matchesType
  }).sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())

  const getTotalInflow = () => {
    return transactions
      .filter(tx => tx.direction === 'IN')
      .reduce((sum, tx) => sum + tx.amount, 0)
  }

  const getTotalOutflow = () => {
    return transactions
      .filter(tx => tx.direction === 'OUT')
      .reduce((sum, tx) => sum + tx.amount, 0)
  }

  const getDailyVolume = () => {
    const dailyData: { [key: string]: { inflow: number; outflow: number } } = {}

    transactions.forEach(tx => {
      const date = formatDate(tx.bookedAt)
      if (!dailyData[date]) {
        dailyData[date] = { inflow: 0, outflow: 0 }
      }

      if (tx.direction === 'IN') {
        dailyData[date].inflow += tx.amount
      } else {
        dailyData[date].outflow += tx.amount
      }
    })

    return Object.entries(dailyData)
      .map(([date, data]) => ({ date, ...data }))
      .slice(-7)
  }

  const dailyVolume = getDailyVolume()

  return (
    <div className="stagger-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Transactions</h2>
          <p className="text-slate-500 mt-1">View and manage your financial transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            New Transaction
          </Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-premium-lg transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700 mb-1">Total Inflow</p>
                <p className="text-2xl font-bold text-emerald-700">
                  <AnimatedCurrency value={getTotalInflow()} />
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-premium-lg transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 mb-1">Total Outflow</p>
                <p className="text-2xl font-bold text-red-700">
                  <AnimatedCurrency value={getTotalOutflow()} />
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-500">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-premium-lg transition-all duration-300 bg-gradient-to-br from-ocean-50 to-violet-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Net Cashflow</p>
                <p className={`text-2xl font-bold ${getTotalInflow() - getTotalOutflow() >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {getTotalInflow() - getTotalOutflow() >= 0 ? '+' : '-'}
                  <AnimatedCurrency value={Math.abs(getTotalInflow() - getTotalOutflow())} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {dailyVolume.length > 1 && (
        <Card className="hover:shadow-premium-lg transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-ocean-500" />
                <h3 className="text-sm font-semibold text-slate-700">7-Day Volume</h3>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Inflow
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" />
                  Outflow
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={dailyVolume} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="sparkInGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sparkOutGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb7185" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  content={
                    <GlassTooltip
                      series={[
                        { key: 'inflow', label: 'Inflow', color: '#34d399' },
                        { key: 'outflow', label: 'Outflow', color: '#fb7185' },
                      ]}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  stroke="#34d399"
                  strokeWidth={1.5}
                  fill="url(#sparkInGrad)"
                  animationDuration={800}
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  stroke="#fb7185"
                  strokeWidth={1.5}
                  fill="url(#sparkOutGrad)"
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      <AccountSelector />
      {showCreateModal && (
        <Card className="shadow-premium-lg">
          <CardHeader>
            <CardTitle>Create New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTransaction} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transaction-type">Type *</Label>
                <select
                  id="transaction-type"
                  value={createData.direction}
                  onChange={(e) => setCreateData({ ...createData, direction: e.target.value as any })}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
                  required
                >
                  <option value="IN">Inflow</option>
                  <option value="OUT">Outflow</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={createData.amount || ''}
                  onChange={(e) => setCreateData({ ...createData, amount: Number(e.target.value) })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booked-at">Date *</Label>
                <Input
                  id="booked-at"
                  type="date"
                  value={createData.bookedAt}
                  onChange={(e) => setCreateData({ ...createData, bookedAt: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={createData.description || ''}
                  onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                  placeholder="Transaction description"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="reference-number">Reference (Optional)</Label>
                <Input
                  id="reference-number"
                  value={createData.referenceNumber || ''}
                  onChange={(e) => setCreateData({ ...createData, referenceNumber: e.target.value })}
                  placeholder="Reference number"
                />
              </div>
              <div className="space-y-2 flex md:col-span-2 justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Transaction</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          {(['ALL', TransactionDirection.IN, TransactionDirection.OUT] as const).map(type => (
            <Button
              key={type}
              variant={typeFilter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(type)}
            >
              {type === 'ALL' ? 'All Types' : type.charAt(0) + type.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      {error && (
        <div className="flex items-center justify-center h-24">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <Calendar className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}
      <Card className="hover:shadow-premium-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-ocean-500" />
            Transactions List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accountLoading || loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Loading transactions...</p>
            </div>
          ) : !selectedCashAccountId ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Please select a cash account to view transactions</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${transaction.direction === 'IN' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      {transaction.direction === 'IN' ? (
                        <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-slate-900">
                          {transaction.description || 'Transaction'}
                        </p>
                        {transaction.referenceNumber && (
                          <span className="text-xs text-slate-500 ml-2">
                            Ref: {transaction.referenceNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Date: {formatDate(transaction.bookedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-lg font-semibold ${transaction.direction === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {transaction.direction === 'IN' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction.id)}
                        disabled={deleteId === transaction.id}
                        title="Delete transaction"
                      >
                        <Trash2 className={`w-4 h-4 ${deleteId === transaction.id ? 'animate-spin' : 'text-red-600'}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}
      </CardContent>
      </Card>
    </div>
  )
}
