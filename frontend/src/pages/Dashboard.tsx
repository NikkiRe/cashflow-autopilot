import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AccountSelector } from '@/components/AccountSelector'
import { AddTransactionModal } from '@/components/AddTransactionModal'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AnimatedValue, AnimatedCurrency } from '@/components/ui/AnimatedValue'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { useAccount } from '@/contexts/AccountContext'
import {
  TrendingUp, ArrowRight, Sparkles, AlertCircle, Plus,
  DollarSign, FileText, Clock, BarChart3, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { GlassTooltip } from '@/components/ui/ChartTooltip'
import { motion } from 'framer-motion'
import type {
  InvoiceDTO,
  ObligationDTO,
  ForecastPointDTO,
  DashboardSummaryDTO,
} from '@/types'
import { TransactionDirection, InvoiceStatus, RecurrenceType } from '@/types'

export function Dashboard() {
  const navigate = useNavigate()
  const {
    selectedCashAccountId, startDate, days,
    loading: accountLoading, error: accountError,
  } = useAccount()

  const [summary, setSummary] = useState<DashboardSummaryDTO | null>(null)
  const [forecast, setForecast]         = useState<ForecastPointDTO[]>([])
  const [invoices, setInvoices]         = useState<InvoiceDTO[]>([])
  const [obligations, setObligations]   = useState<ObligationDTO[]>([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [isDemoMode, setIsDemoMode]     = useState(false)
  const [demoTransactions, setDemoTransactions] = useState<Array<{
    id: number; amount: number; description: string; date: string; type: 'IN' | 'OUT'
  }>>([])

  const loadDashboardData = async () => {
    if (!selectedCashAccountId || !startDate) return
    try {
      setLoading(true)
      setError(null)
      const [summaryData, forecastData, invoicesData, obligationsData] = await Promise.all([
        api.getDashboardSummary(selectedCashAccountId, startDate, days),
        api.getForecast(selectedCashAccountId, startDate, days),
        api.getInvoicesByCashAccount(selectedCashAccountId),
        api.getObligationsByCashAccount(selectedCashAccountId),
      ])
      setSummary(summaryData)
      setForecast(forecastData)
      setInvoices(invoicesData)
      setObligations(obligationsData)
    } catch (err) {
      console.error('Backend unavailable, using demo data:', err)
      setIsDemoMode(true)
      setError('Backend unavailable — using demo data')
      setSummary({ cashNow: 125000, minCash: 89000, minCashDate: new Date(Date.now() + 45*86400000).toISOString().split('T')[0], runwayDays: 89 })
      const demoForecast: ForecastPointDTO[] = Array.from({ length: 91 }, (_, i) => {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const baseCash = 125000
        const variance = Math.sin(i / 10) * 15000
        const trend = (i / 91) * -20000
        const inflows = i % 14 === 0 ? 25000 : 0
        const outflows = i % 30 === 0 ? -15000 : 0
        return {
          date: date.toISOString().split('T')[0],
          openingBalance: Math.round(baseCash + variance + trend + inflows + outflows - inflows - outflows),
          expectedIn: inflows,
          expectedOut: Math.abs(outflows),
          closingBalance: Math.round(baseCash + variance + trend + inflows + outflows),
        }
      })
      setForecast(demoForecast)
      setInvoices([{
        id: 1, cashAccountId: selectedCashAccountId, counterpartyId: null,
        invoiceNumber: 'INV-2024-015',
        issueDate: new Date(Date.now() + 7*86400000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 37*86400000).toISOString().split('T')[0],
        amount: 45000, currency: 'USD', status: InvoiceStatus.ISSUED,
        description: 'Client payment for Q4 services', createdAt: new Date().toISOString(),
      }])
      setObligations([
        { id: 1, cashAccountId: selectedCashAccountId, name: 'Office Rent', amount: 12000, currency: 'USD', nextDueDate: new Date(Date.now() + 30*86400000).toISOString().split('T')[0], recurrence: RecurrenceType.MONTHLY, description: 'Monthly office rent', active: true, createdAt: new Date().toISOString() },
        { id: 2, cashAccountId: selectedCashAccountId, name: 'Software Licenses', amount: 3500, currency: 'USD', nextDueDate: new Date(Date.now() + 15*86400000).toISOString().split('T')[0], recurrence: RecurrenceType.MONTHLY, description: 'Monthly software subscription', active: true, createdAt: new Date().toISOString() },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDashboardData() }, [selectedCashAccountId, startDate, days])

  if (accountLoading || loading) return <DashboardSkeleton />
  if (accountError) return (
    <div className="flex items-center justify-center h-96">
      <div className="glass-card p-8 max-w-md text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-slate-700 mb-4">{accountError}</p>
        <button className="btn-neon" onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  )
  if (!selectedCashAccountId) return (
    <div className="flex items-center justify-center h-96">
      <div className="glass-card p-8 max-w-md text-center">
        <Sparkles className="w-10 h-10 mx-auto mb-4" style={{ color: '#0080FF' }} />
        <p className="font-semibold text-slate-800 mb-2">No cash account selected</p>
        <p className="text-sm text-slate-500">Select an account or wait for auto-load.</p>
      </div>
    </div>
  )
  if (error && !isDemoMode) return (
    <div className="flex items-center justify-center h-96">
      <div className="glass-card p-8 max-w-md text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button className="btn-neon" onClick={loadDashboardData}>Retry</button>
      </div>
    </div>
  )

  const totalInflow = invoices.filter((i) => i.status !== InvoiceStatus.PAID).reduce((s, i) => s + i.amount, 0)
  const totalOutflow = obligations.filter((o) => o.active).reduce((s, o) => s + o.amount, 0)
  const upcomingInvoices = invoices
    .filter((i) => i.status !== InvoiceStatus.PAID)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)
  const upcomingObligations = obligations.filter(o => o.active).sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()).slice(0, 5)

  const metrics = [
    {
      label: 'Current Cash',
      numericValue: summary?.cashNow ?? 0,
      isCurrency: true,
      sub: 'Available balance',
      icon: DollarSign,
      color: 'cyan',
      trend: '+2.4%',
      up: true,
    },
    {
      label: 'Pending Invoices',
      numericValue: upcomingInvoices.length,
      isCurrency: false,
      sub: formatCurrency(totalInflow),
      icon: FileText,
      color: 'green',
      trend: '+1 this week',
      up: true,
    },
    {
      label: 'Active Obligations',
      numericValue: upcomingObligations.length,
      isCurrency: false,
      sub: formatCurrency(totalOutflow) + '/mo',
      icon: Clock,
      color: 'amber',
      trend: 'On schedule',
      up: null,
    },
    {
      label: 'Cash Runway',
      numericValue: summary?.runwayDays ?? 0,
      isCurrency: false,
      sub: 'days remaining',
      icon: BarChart3,
      color: 'purple',
      trend: summary && summary.runwayDays > 60 ? 'Healthy' : 'Monitor',
      up: summary ? summary.runwayDays > 60 : null,
    },
  ]

  return (
    <div className="stagger-in space-y-6">
      <AccountSelector />

      {isDemoMode && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm animate-slide-up"
          style={{
            background: 'linear-gradient(135deg, rgba(255,184,0,0.08) 0%, rgba(255,140,0,0.05) 100%)',
            border: '1px solid rgba(255,184,0,0.2)',
          }}
        >
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <div>
            <span className="font-semibold text-amber-700">Demo Mode</span>
            <span className="text-amber-600 ml-2">— data is simulated, changes won't persist</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">Good morning 👋</h2>
          <p className="text-sm text-slate-400 mt-0.5">Here's your liquidity overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all duration-200"
            onClick={() => setShowAddTransaction(true)}
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
          <button
            className="btn-neon"
            onClick={() => navigate('/forecast')}
          >
            View Forecast
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon
          return (
            <motion.div
              key={m.label}
              className={`metric-card ${m.color} p-5`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`neon-icon ${m.color}`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                {m.up !== null && (
                  <div className={`flex items-center gap-1 text-xs font-semibold ${m.up ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {m.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : null}
                    {m.trend}
                  </div>
                )}
                {m.up === null && (
                  <span className="text-xs font-medium text-slate-400">{m.trend}</span>
                )}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-1">
                  {m.isCurrency
                    ? <AnimatedCurrency value={m.numericValue} />
                    : <AnimatedValue value={m.numericValue} />
                  }
                </p>
                <p className="text-xs text-slate-400 font-medium">{m.sub}</p>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-3 pt-3 border-t border-slate-100">
                {m.label}
              </p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Cash Flow Projection</h3>
                <p className="text-xs text-slate-400 mt-0.5">{days}-day forecast window</p>
              </div>
              <span className="badge-neon blue">
                <TrendingUp className="w-3 h-3 mr-1 inline" />
                {days}d
              </span>
            </div>

            {forecast.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No forecast data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Forecast Period', value: `${days} days`, color: 'text-slate-900' },
                    { label: 'Lowest Balance', value: summary?.minCash ? formatCurrency(summary.minCash) : '—', color: 'text-amber-600' },
                    { label: 'Critical Date', value: summary?.minCashDate ? formatDate(summary.minCashDate) : '—', color: 'text-slate-900' },
                  ].map(stat => (
                    <div
                      key={stat.label}
                      className="p-3 rounded-xl"
                      style={{ background: 'rgba(0,128,255,0.03)', border: '1px solid rgba(0,128,255,0.08)' }}
                    >
                      <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                      <p className={`text-sm font-semibold ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-1 -mx-2">
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={forecast.slice(0, 30)} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0080FF" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={['dataMin - 5000', 'dataMax + 5000']} />
                      <Tooltip
                        content={
                          <GlassTooltip
                            series={[{ key: 'closingBalance', label: 'Balance', color: '#0080FF' }]}
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="closingBalance"
                        stroke="#0080FF"
                        strokeWidth={2.5}
                        fill="url(#dashGrad)"
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'New Invoice', href: '/invoices', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100' },
                { label: 'New Obligation', href: '/obligations', color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-100' },
                { label: 'View Forecast', href: '/forecast', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100' },
              ].map(a => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.href)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 flex items-center justify-between ${a.color}`}
                >
                  {a.label}
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0080FF 0%, #00D4FF 100%)',
              boxShadow: '0 8px 24px rgba(0,128,255,0.3)',
            }}
          >
            <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.4)' }} />
            <p className="text-xs font-semibold text-white/70 mb-1 uppercase tracking-wide">Liquidity Health</p>
            <p className="text-2xl font-bold text-white">
              {summary && summary.runwayDays > 60 ? 'Strong' : summary && summary.runwayDays > 30 ? 'Moderate' : 'Monitor'}
            </p>
            <p className="text-xs text-white/60 mt-1">
              {summary ? `${summary.runwayDays} days runway` : 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Upcoming Invoices</h3>
            <span className="badge-neon green">{upcomingInvoices.length} pending</span>
          </div>
          {upcomingInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No pending invoices</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                  style={{ background: 'rgba(0,214,143,0.05)', border: '1px solid rgba(0,214,143,0.12)' }}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {inv.invoiceNumber || `Invoice #${inv.id}`}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(inv.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {formatCurrency(inv.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Upcoming Obligations</h3>
            <span className="badge-neon amber">{upcomingObligations.length} active</span>
          </div>
          {upcomingObligations.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No active obligations</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingObligations.map((obl) => (
                <div
                  key={obl.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                  style={{ background: 'rgba(255,184,0,0.05)', border: '1px solid rgba(255,184,0,0.12)' }}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{obl.name}</p>
                    <p className="text-xs text-slate-400">{formatDate(obl.nextDueDate)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-600 font-bold text-sm">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    {formatCurrency(obl.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddTransactionModal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onSubmit={async (data) => {
          try {
            if (isDemoMode) {
              const newTx = { id: Date.now(), amount: data.amount, description: data.description, date: data.date, type: data.type }
              setDemoTransactions([...demoTransactions, newTx])
              setSummary(prev => prev ? {
                ...prev,
                cashNow: data.type === 'IN' ? prev.cashNow + data.amount : prev.cashNow - data.amount,
              } : null)
              setShowAddTransaction(false)
              alert(`Transaction added in demo mode: ${data.description} (${data.type === 'IN' ? '+' : '-'}${data.amount})`)
            } else {
              await api.createBankTransaction({
                cashAccountId: selectedCashAccountId!,
                bookedAt: data.date,
                amount: data.amount,
                currency: 'USD',
                direction: data.type === 'IN' ? TransactionDirection.IN : TransactionDirection.OUT,
                description: data.description,
              })
              await loadDashboardData()
              setShowAddTransaction(false)
            }
          } catch (err) {
            console.error('Failed to create transaction:', err)
            alert('Failed to create transaction. Please try again.')
          }
        }}
      />
    </div>
  )
}
