import React from 'react'
import type { TooltipProps } from 'recharts'
import { formatDate } from '@/lib/utils'

interface SeriesConfig {
  key: string
  label: string
  color: string
  formatter?: (value: number) => string
}

const defaultCurrencyFormat = (v: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

interface GlassTooltipProps extends TooltipProps<number, string> {
  series: SeriesConfig[]
}

export function GlassTooltip({ active, payload, label, series }: GlassTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div
      className="rounded-xl border border-white/60 px-4 py-3 text-sm"
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(16px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
        boxShadow:
          '0 8px 32px -8px rgba(0,60,120,0.14), 0 2px 6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
      }}
    >
      <p className="mb-2 font-display text-xs font-semibold text-slate-500">
        {typeof label === 'string' ? formatDate(label) : label}
      </p>
      <div className="space-y-1">
        {series.map((s) => {
          const entry = payload.find((p) => p.dataKey === s.key)
          if (!entry || entry.value == null) return null
          const fmt = s.formatter ?? defaultCurrencyFormat
          return (
            <div key={s.key} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-2 text-slate-600">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: s.color }}
                />
                {s.label}
              </span>
              <span className="font-semibold tabular-nums text-slate-900">
                {fmt(entry.value as number)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
