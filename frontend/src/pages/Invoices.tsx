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
import { InvoiceStatus } from '@/types'
import type { InvoiceDTO, CreateInvoiceRequest } from '@/types'
import { FileText, ArrowUpRight, CheckCircle, Clock, AlertTriangle, Search, Trash2, Plus, X } from 'lucide-react'

export function Invoices() {
  const { selectedCashAccountId, loading: accountLoading } = useAccount()

  const [invoices, setInvoices] = useState<InvoiceDTO[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | string>('ALL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [createData, setCreateData] = useState<CreateInvoiceRequest>({
    cashAccountId: 0,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 0,
    currency: 'USD',
    status: InvoiceStatus.ISSUED,
  })

  const loadInvoices = async () => {
    if (!selectedCashAccountId) {
      setInvoices([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await api.getInvoicesByCashAccount(selectedCashAccountId)
      setInvoices(data)
    } catch (err) {
      setError('Failed to load invoices')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadInvoices()
  }, [selectedCashAccountId])

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCashAccountId) {
      setError('Please select a cash account first')
      return
    }

    try {
      await api.createInvoice({
        ...createData,
        cashAccountId: selectedCashAccountId,
      })
      setShowCreateModal(false)
      setCreateData({
        cashAccountId: 0,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: 0,
        currency: 'USD',
        status: InvoiceStatus.ISSUED,
      })
      await loadInvoices()
    } catch (err) {
      setError('Failed to create invoice')
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setDeleteId(id)
      await api.deleteInvoice(id)
      setDeleteId(null)
      await loadInvoices()
    } catch (err) {
      setError('Failed to delete invoice')
      console.error(err)
      setDeleteId(null)
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  }).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success' as const
      case 'OVERDUE':
        return 'danger' as const
      case 'ISSUED':
      default:
        return 'warning' as const
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4" />
      case 'OVERDUE':
        return <AlertTriangle className="w-4 h-4" />
      case 'ISSUED':
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const totalPending = filteredInvoices.filter(inv => inv.status === 'ISSUED').reduce((sum, inv) => sum + inv.amount, 0)
  const totalOverdue = filteredInvoices.filter(inv => inv.status === 'OVERDUE').reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Invoices</h2>
          <p className="text-slate-500 mt-1">Manage your receivables and track payments</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          New Invoice
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-premium-lg transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700 mb-1">Total Pending</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(totalPending)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-premium-lg transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 mb-1">Total Overdue</p>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(totalOverdue)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-500">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-premium-lg transition-all duration-300 bg-gradient-to-br from-ocean-50 to-violet-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Total Invoices</p>
                <p className="text-2xl font-bold text-slate-900">
                  {filteredInvoices.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-ocean-500 to-violet-500">
                <FileText className="w-6 h-6 text-white" />
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
              <CardTitle>Create New Invoice</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5 text-slate-600" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateInvoice} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="invoice-number">Invoice Number (Optional)</Label>
                <Input
                  id="invoice-number"
                  value={createData.invoiceNumber || ''}
                  onChange={(e) => setCreateData({ ...createData, invoiceNumber: e.target.value })}
                  placeholder="INV-2024-XXX"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={createData.description || ''}
                  onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                  placeholder="Invoice description"
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
                <Label htmlFor="issue-date">Issue Date *</Label>
                <Input
                  id="issue-date"
                  type="date"
                  value={createData.issueDate}
                  onChange={(e) => setCreateData({ ...createData, issueDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date *</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={createData.dueDate}
                  onChange={(e) => setCreateData({ ...createData, dueDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Invoice</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          {(['ALL', InvoiceStatus.ISSUED, InvoiceStatus.PAID, InvoiceStatus.OVERDUE] as const).map(status => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      {error && (
        <div className="flex items-center justify-center h-24">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}
      <Card className="hover:shadow-premium-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-ocean-500" />
            Invoice List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accountLoading || loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Loading invoices...</p>
            </div>
          ) : !selectedCashAccountId ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Please select a cash account to view invoices</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No invoices found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${invoice.status === 'PAID' ? 'bg-emerald-100' : invoice.status === 'OVERDUE' ? 'bg-red-100' : 'bg-amber-100'}`}>
                      {invoice.status === 'PAID' ? (
                        <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-slate-900">
                          {invoice.invoiceNumber || `Invoice #${invoice.id}`}
                        </p>
                        <Badge variant={getStatusVariant(invoice.status)} className="gap-1">
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Due: {formatRelativeDate(invoice.dueDate)}</span>
                        <span>Issued: {formatDate(invoice.issueDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-lg font-semibold ${invoice.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {formatCurrency(invoice.amount)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(invoice.id)}
                        disabled={deleteId === invoice.id}
                        title="Delete invoice"
                      >
                        <Trash2 className={`w-4 h-4 ${deleteId === invoice.id ? 'animate-spin' : 'text-red-600'}`} />
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
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <span>
          <strong>Mark as Paid</strong> and <strong>Edit</strong> features are not available in the current backend version.
        </span>
      </div>
    </div>
  )
}
