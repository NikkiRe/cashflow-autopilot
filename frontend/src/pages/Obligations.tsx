import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AccountSelector } from '@/components/AccountSelector'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/utils'
import { useAccount } from '@/contexts/AccountContext'
import { RecurrenceType } from '@/types'
import type { ObligationDTO, CreateObligationRequest } from '@/types'
import { Calendar, Plus, ArrowDownLeft, Repeat, Search, Trash2, X } from 'lucide-react'

export function Obligations() {
  const { selectedCashAccountId, loading: accountLoading } = useAccount()

  const [obligations, setObligations] = useState<ObligationDTO[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [recurrenceFilter, setRecurrenceFilter] = useState<'ALL' | string>('ALL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [createData, setCreateData] = useState<CreateObligationRequest>({
    cashAccountId: 0,
    name: '',
    amount: 0,
    currency: 'USD',
    nextDueDate: new Date().toISOString().split('T')[0],
    recurrence: RecurrenceType.NONE,
  })

  const loadObligations = async () => {
    if (!selectedCashAccountId) {
      setObligations([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await api.getObligationsByCashAccount(selectedCashAccountId)
      setObligations(data)
    } catch (err) {
      setError('Failed to load obligations')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadObligations()
  }, [selectedCashAccountId])

  const handleCreateObligation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCashAccountId) {
      setError('Please select a cash account first')
      return
    }

    try {
      await api.createObligation({
        ...createData,
        cashAccountId: selectedCashAccountId,
      })
      setShowCreateModal(false)
      setCreateData({
        cashAccountId: 0,
        name: '',
        amount: 0,
        currency: 'USD',
        nextDueDate: new Date().toISOString().split('T')[0],
        recurrence: RecurrenceType.NONE,
      })
      await loadObligations()
    } catch (err) {
      setError('Failed to create obligation')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setDeleteId(id)
      await api.deleteObligation(id)
      setDeleteId(null)
      await loadObligations()
    } catch (err) {
      setError('Failed to delete obligation')
      setDeleteId(null)
    }
  }

  const filteredObligations = obligations.filter(obligation => {
    const matchesSearch = obligation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           obligation.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRecurrence = recurrenceFilter === 'ALL' || obligation.recurrence === recurrenceFilter
    return matchesSearch && matchesRecurrence
  }).sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())

  const getRecurrenceBadge = (recurrence: string) => {
    switch (recurrence) {
      case 'WEEKLY':
        return 'violet' as const
      case 'MONTHLY':
        return 'info' as const
      case 'NONE':
      default:
        return 'warning' as const
    }
  }

  const getTotalMonthly = () => {
    return obligations
      .filter(obl => obl.active && (obl.recurrence === 'MONTHLY' || obl.recurrence === 'WEEKLY'))
      .reduce((sum, obl) => {
        const multiplier = obl.recurrence === 'WEEKLY' ? 4 : 1
        return sum + (obl.amount * multiplier)
      }, 0)
  }

  const upcomingObligations = obligations
    .filter(obl => {
      const dueDate = new Date(obl.nextDueDate)
      const today = new Date()
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilDue >= 0 && daysUntilDue <= 7 && obl.active
    })
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Obligations</h2>
          <p className="text-slate-500 mt-1">Manage your payables and recurring expenses</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          New Obligation
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-premium-lg transition-all duration-300 bg-gradient-to-br from-ocean-50 to-violet-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Total Monthly</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(getTotalMonthly())}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-ocean-500 to-violet-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-premium-lg transition-all duration-300 bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 mb-1">Upcoming (7 days)</p>
                <p className="text-2xl font-bold text-amber-700">
                  {formatCurrency(upcomingObligations.reduce((sum, obl) => sum + obl.amount, 0))}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-premium-lg transition-all duration-300 bg-gradient-to-br from-slate-50 to-slate-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Total Obligations</p>
                <p className="text-2xl font-bold text-slate-900">
                  {filteredObligations.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <AccountSelector />
      {showCreateModal && (
        <Card className="shadow-premium-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create New Obligation</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5 text-slate-600" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateObligation} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="obligation-name">Name *</Label>
                <Input
                  id="obligation-name"
                  value={createData.name}
                  onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                  placeholder="e.g., Office Rent"
                  required
                />
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
                <Label htmlFor="due-date">Next Due Date *</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={createData.nextDueDate}
                  onChange={(e) => setCreateData({ ...createData, nextDueDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recurrence">Recurrence *</Label>
                <select
                  id="recurrence"
                  value={createData.recurrence}
                  onChange={(e) => setCreateData({ ...createData, recurrence: e.target.value as any })}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
                  required
                >
                  <option value="NONE">One-time</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                  id="category"
                  value={createData.description || ''}
                  onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                  placeholder="e.g., Fixed, Subscription, Variable"
                />
              </div>
              <div className="space-y-2 md:col-span-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Obligation</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {upcomingObligations.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-700 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <Calendar className="w-5 h-5 text-amber-600" />
          <span>
            <strong>Upcoming Obligations (Next 7 Days):</strong>
            {upcomingObligations.map((obl, i) => (
              <span key={i}>
                {i > 0 && ', '}
                <strong>{obl.name}</strong> ({formatRelativeDate(obl.nextDueDate)})
              </span>
            ))}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          {(['ALL', RecurrenceType.NONE, RecurrenceType.WEEKLY, RecurrenceType.MONTHLY] as const).map(recurrence => (
            <Button
              key={recurrence}
              variant={recurrenceFilter === recurrence ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRecurrenceFilter(recurrence)}
            >
              {recurrence === 'ALL' ? 'All Types' : recurrence.charAt(0) + recurrence.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search obligations..."
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
            Obligations List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accountLoading || loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Loading obligations...</p>
            </div>
          ) : !selectedCashAccountId ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Please select a cash account to view obligations</p>
            </div>
          ) : filteredObligations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No obligations found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredObligations.map((obligation) => (
                <div
                  key={obligation.id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                    obligation.active ? 'bg-slate-50 hover:bg-slate-100' : 'bg-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg bg-red-100`}>
                      <ArrowDownLeft className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-slate-900">
                          {obligation.name}
                        </p>
                        <Badge variant={getRecurrenceBadge(obligation.recurrence)}>
                          {obligation.recurrence.charAt(0) + obligation.recurrence.slice(1).toLowerCase()}
                        </Badge>
                        {obligation.description && (
                          <Badge variant="info">{obligation.description}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Due: {formatRelativeDate(obligation.nextDueDate)}</span>
                        {obligation.recurrence !== 'NONE' && (
                          <span>Next: {formatDate(obligation.nextDueDate)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-semibold text-red-600">
                      -{formatCurrency(obligation.amount)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(obligation.id)}
                        disabled={deleteId === obligation.id}
                        title="Delete obligation"
                      >
                        <Trash2 className={`w-4 h-4 ${deleteId === obligation.id ? 'animate-spin' : 'text-red-600'}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500 py-4 px-4 bg-slate-100 rounded-lg">
        <Calendar className="w-4 h-4 text-amber-600" />
        <span>
          <strong>Update</strong> obligation feature is not available in the current backend version.
        </span>
      </div>
    </div>
  )
}
