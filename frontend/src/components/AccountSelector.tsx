import React from 'react'
import { useAccount } from '@/contexts/AccountContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { AlertCircle, Calendar, Building2 } from 'lucide-react'

export function AccountSelector() {
  const {
    companies,
    cashAccounts,
    selectedCompanyId,
    selectedCashAccountId,
    startDate,
    days,
    loading,
    error,
    inFallbackMode,
    setSelectedCompanyId,
    setSelectedCashAccountId,
    setStartDate,
    setDays,
  } = useAccount()

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="w-5 h-5 text-ocean-500" />
          Account Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && !inFallbackMode && (
          <div className="flex items-center gap-2 text-sm text-red-600 mb-4">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        {inFallbackMode && (
          <div className="flex items-center gap-2 text-sm text-amber-600 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>
              <strong>Demo Mode:</strong> Backend unavailable. All data is simulated.
            </span>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="company-select">Company</Label>
            <select
              id="company-select"
              value={selectedCompanyId || ''}
              onChange={(e) => setSelectedCompanyId(e.target.value ? Number(e.target.value) : null)}
              disabled={loading || companies.length === 0}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 disabled:opacity-50"
            >
              <option value="">Select company...</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cash-account-select">Cash Account</Label>
            <select
              id="cash-account-select"
              value={selectedCashAccountId || ''}
              onChange={(e) => setSelectedCashAccountId(e.target.value ? Number(e.target.value) : null)}
              disabled={loading || cashAccounts.length === 0}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 disabled:opacity-50"
            >
              <option value="">Select account...</option>
              {cashAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.currency})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="days">Forecast Horizon (Days)</Label>
            <Input
              id="days"
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(Math.min(365, Math.max(1, Number(e.target.value) || 1)))}
              className="flex h-10"
            />
          </div>
        </div>

        {loading && (
          <div className="text-sm text-slate-500 mt-2">Loading...</div>
        )}
      </CardContent>
    </Card>
  )
}
