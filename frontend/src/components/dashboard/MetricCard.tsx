import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, calculateTrend } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertCircle } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  previousValue?: number
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
  format?: 'currency' | 'number' | 'percentage'
}

export function MetricCard({
  title,
  value,
  previousValue,
  icon,
  variant = 'default',
  format = 'currency',
}: MetricCardProps) {
  const trend = previousValue !== undefined ? calculateTrend(value, previousValue) : null

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'number':
        return val.toLocaleString()
      case 'percentage':
        return `${val.toFixed(1)}%`
      default:
        return val.toString()
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
          iconBg: 'bg-emerald-500',
          textColor: 'text-emerald-700',
        }
      case 'warning':
        return {
          bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
          iconBg: 'bg-amber-500',
          textColor: 'text-amber-700',
        }
      case 'danger':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-red-100/50',
          iconBg: 'bg-red-500',
          textColor: 'text-red-700',
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-ocean-50 to-violet-50/50',
          iconBg: 'bg-gradient-to-br from-ocean-500 to-violet-500',
          textColor: 'text-slate-700',
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <Card className="group hover:shadow-premium-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${styles.bg}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className={`text-3xl font-bold ${styles.textColor}`}>
              {formatValue(value)}
            </div>
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                {trend.value > 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {trend.value.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500">
                  {' '}{trend.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function BalanceMetric({ value, previousValue }: { value: number; previousValue?: number }) {
  return (
    <MetricCard
      title="Total Balance"
      value={value}
      previousValue={previousValue}
      icon={<DollarSign className="w-5 h-5 text-white" />}
      variant="default"
    />
  )
}

export function PendingInvoicesMetric({ value }: { value: number }) {
  return (
    <MetricCard
      title="Pending Invoices"
      value={value}
      icon={<Calendar className="w-5 h-5 text-white" />}
      variant="success"
    />
  )
}

export function OverdueObligationsMetric({ value }: { value: number }) {
  return (
    <MetricCard
      title="Overdue Obligations"
      value={value}
      icon={<AlertCircle className="w-5 h-5 text-white" />}
      variant="danger"
    />
  )
}

export function RunwayMetric({ value }: { value: number }) {
  return (
    <MetricCard
      title="Cash Runway"
      value={value}
      icon={<Calendar className="w-5 h-5 text-white" />}
      variant="warning"
      format="number"
    />
  )
}
