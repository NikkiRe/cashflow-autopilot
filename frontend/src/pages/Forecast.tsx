import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AccountSelector } from '@/components/AccountSelector'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAccount } from '@/contexts/AccountContext'
import { AlertTriangle, CheckCircle, Calendar, BarChart3, RefreshCw } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { GlassTooltip } from '@/components/ui/ChartTooltip'
import type { ForecastPointDTO, DashboardSummaryDTO } from '@/types'
import { ForecastSkeleton } from '@/components/ui/Skeleton'
import { AnimatedCurrency, AnimatedValue } from '@/components/ui/AnimatedValue'

export function Forecast() {
  const { selectedCashAccountId, startDate, days, loading: accountLoading } = useAccount()

  const [forecast, setForecast] = useState<ForecastPointDTO[]>([])
  const [summary, setSummary] = useState<DashboardSummaryDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadForecast = useCallback(async () => {
    if (!selectedCashAccountId || !startDate) return
    try {
      setLoading(true)
      setError(null)
      const [forecastData, summaryData] = await Promise.all([
        api.getForecast(selectedCashAccountId, startDate, days),
        api.getDashboardSummary(selectedCashAccountId, startDate, days),
      ])
      setForecast(forecastData)
      setSummary(summaryData)
    } catch (err) {
      setError('Failed to generate forecast')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedCashAccountId, startDate, days])

  useEffect(() => {
    void loadForecast()
  }, [loadForecast])

  const chartData = useMemo(
    () => forecast.map((point) => ({ ...point, formattedDate: formatDate(point.date) })),
    [forecast],
  )

  const criticalThreshold = summary?.minCash ?? 20_000

  const criticalDates = useMemo(
    () => forecast.filter((p) => p.closingBalance < criticalThreshold).slice(0, 5),
    [forecast, criticalThreshold],
  )

  const periodStats = useMemo(() => {
    if (forecast.length === 0) return null
    const first = forecast[0]
    const last = forecast[forecast.length - 1]
    const periodNet = last.closingBalance - first.openingBalance
    const totalIn = forecast.reduce((s, p) => s + p.expectedIn, 0)
    const totalOut = forecast.reduce((s, p) => s + p.expectedOut, 0)
    return { endingBalance: last.closingBalance, periodNet, totalIn, totalOut }
  }, [forecast])

  const recommendations = useMemo(() => {
    if (!summary || forecast.length === 0 || !periodStats) return []
    const recs: Array<{
      type: 'danger' | 'warning' | 'success'
      icon: React.ReactNode
      title: string
      description: string
    }> = []
    const { periodNet, totalIn, totalOut } = periodStats
    const scheduledNet = totalIn - totalOut

    if (scheduledNet < 0) {
      recs.push({
        type: 'danger',
        icon: <AlertTriangle className="w-5 h-5" />,
        title: 'Negative scheduled cash flow',
        description:
          'Scheduled outflows exceed inflows in this window. Consider timing of payables or accelerating collections.',
      })
    }
    if (summary.runwayDays < 30) {
      recs.push({
        type: 'warning',
        icon: <AlertTriangle className="w-5 h-5" />,
        title: 'Low runway',
        description: `About ${summary.runwayDays} days of runway in the model. Review obligations and liquidity buffers.`,
      })
    }
    if (periodNet >= 0 && summary.runwayDays >= 30) {
      recs.push({
        type: 'success',
        icon: <CheckCircle className="w-5 h-5" />,
        title: 'Stable trajectory',
        description: 'Ending balance does not fall below your starting point in this forecast window.',
      })
    }
    return recs
  }, [summary, forecast.length, periodStats])

  if (accountLoading || (loading && forecast.length === 0)) return <ForecastSkeleton />

  if (!selectedCashAccountId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Forecast Decision Cockpit</h2>
            <p className="text-slate-500 mt-1">Model your liquidity position and make data-driven decisions</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <p className="text-slate-500">Please select a cash account to generate forecast</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="stagger-in space-y-6">
      <AccountSelector />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Forecast Decision Cockpit</h2>
          <p className="text-slate-500 mt-1">Model your liquidity position and make data-driven decisions</p>
        </div>
        <Button onClick={() => void loadForecast()} disabled={loading || !startDate} className="gap-2">
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4" />
              Generate Forecast
            </>
          )}
        </Button>
      </div>
      {summary && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-premium-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Current Cash</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                <AnimatedCurrency value={summary.cashNow} />
              </p>
              <p className="text-xs text-slate-500 mt-1">Ledger through today</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-premium-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Ending Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-ocean-600">
                {periodStats ? <AnimatedCurrency value={periodStats.endingBalance} /> : '—'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-premium-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Net Change (period)</CardTitle>
            </CardHeader>
            <CardContent>
              {periodStats ? (
                <>
                  <p
                    className={`text-2xl font-bold ${
                      periodStats.periodNet >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {periodStats.periodNet >= 0 ? '+' : '−'}
                    <AnimatedCurrency value={Math.abs(periodStats.periodNet)} />
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{days}-day window (end vs start)</p>
                </>
              ) : (
                <p className="text-2xl font-bold text-slate-400">—</p>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-premium-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Runway</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-violet-600">
                <AnimatedValue value={summary.runwayDays} />
              </p>
              <p className="text-xs text-slate-500 mt-1">days</p>
            </CardContent>
          </Card>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center h-24">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}
      {forecast.length > 0 && !loading && (
        <>
          <Card className="hover:shadow-premium-lg transition-all duration-300 overflow-visible">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-ocean-500" />
                  Cumulative Balance Projection
                </CardTitle>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                    Balance
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                    Inflows
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />
                    Outflows
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forecastBalanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0080FF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="forecastInflowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0.01} />
                    </linearGradient>
                    <linearGradient id="forecastOutflowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fb7185" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#fb7185" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => {
                      const d = new Date(v)
                      return `${d.getDate()}/${d.getMonth() + 1}`
                    }}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    interval={Math.max(1, Math.floor(forecast.length / 8))}
                  />
                  <YAxis
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <Tooltip
                    content={
                      <GlassTooltip
                        series={[
                          { key: 'closingBalance', label: 'Balance', color: '#0080FF' },
                          { key: 'expectedIn', label: 'Inflows', color: '#34d399' },
                          { key: 'expectedOut', label: 'Outflows', color: '#fb7185' },
                        ]}
                      />
                    }
                  />
                  {summary?.minCash != null && (
                    <ReferenceLine
                      y={summary.minCash}
                      stroke="#f59e0b"
                      strokeDasharray="6 4"
                      strokeWidth={1.5}
                      label={{
                        value: `Min: ${formatCurrency(summary.minCash)}`,
                        position: 'insideTopRight',
                        fill: '#d97706',
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="expectedIn"
                    stroke="#34d399"
                    strokeWidth={1.5}
                    fill="url(#forecastInflowGrad)"
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="expectedOut"
                    stroke="#fb7185"
                    strokeWidth={1.5}
                    fill="url(#forecastOutflowGrad)"
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="closingBalance"
                    stroke="#0080FF"
                    strokeWidth={2.5}
                    fill="url(#forecastBalanceGrad)"
                    animationDuration={1400}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {[
                  { label: 'Period', value: `${days} days` },
                  { label: 'Start', value: formatDate(startDate) },
                  { label: 'Lowest Balance', value: summary?.minCash ? formatCurrency(summary.minCash) : '—', accent: true },
                  { label: 'Critical Date', value: summary?.minCashDate ? formatDate(summary.minCashDate) : '—' },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-slate-50 p-2.5">
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{s.label}</p>
                    <p
                      className={`text-sm font-semibold mt-0.5 ${
                        'accent' in s && s.accent ? 'text-amber-600' : 'text-slate-800'
                      }`}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="hover:shadow-premium-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-ocean-500" />
                  Forecast Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.length > 0 ? (
                    recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          rec.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200'
                            : rec.type === 'warning'
                              ? 'bg-amber-50 border-amber-200'
                              : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              rec.type === 'success'
                                ? 'bg-emerald-100 text-emerald-600'
                                : rec.type === 'warning'
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {rec.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900 mb-1">{rec.title}</h4>
                            <p className="text-sm text-slate-600">{rec.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-slate-500">No analysis for this forecast yet</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-premium-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Critical Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                {criticalDates.length > 0 ? (
                  <div className="space-y-3">
                    {criticalDates.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="font-medium text-slate-900">{formatDate(point.date)}</p>
                            <p className="text-xs text-slate-500">Balance: {formatCurrency(point.closingBalance)}</p>
                          </div>
                        </div>
                        <Badge variant="danger">Critical</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">No critical dates in this forecast</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
