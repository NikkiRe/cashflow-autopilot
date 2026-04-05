import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { useAccount } from '@/contexts/AccountContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  CompanyDTO,
  CashAccountDTO,
  InvoiceDTO,
  ObligationDTO,
  BankTransactionDTO,
  InvoiceStatus,
  RecurrenceType,
  TransactionDirection,
} from '@/types'
import { Plus, Trash2, Edit, PlusCircle, Building2, CreditCard, FileText, DollarSign, ArrowRight } from 'lucide-react'

type EntityType = 'companies' | 'cash-accounts' | 'invoices' | 'obligations' | 'transactions'

export function Admin() {
  const { companies, cashAccounts, inFallbackMode } = useAccount()

  const [activeTab, setActiveTab] = useState<EntityType>('companies')
  const [loading, setLoading] = useState(false)

  const [invoices, setInvoices] = useState<InvoiceDTO[]>([])
  const [obligations, setObligations] = useState<ObligationDTO[]>([])
  const [transactions, setTransactions] = useState<BankTransactionDTO[]>([])

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        if (activeTab === 'invoices') {
          if (cashAccounts.length > 0) {
            const data = await api.getInvoicesByCashAccount(cashAccounts[0].id)
            setInvoices(data)
          }
        } else if (activeTab === 'obligations') {
          if (cashAccounts.length > 0) {
            const data = await api.getObligationsByCashAccount(cashAccounts[0].id)
            setObligations(data)
          }
        } else if (activeTab === 'transactions') {
          if (cashAccounts.length > 0) {
            const data = await api.getBankTransactionsByCashAccount(cashAccounts[0].id)
            setTransactions(data)
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [activeTab, cashAccounts])

  const handleCreate = async () => {
    if (inFallbackMode) {
      alert('Cannot create in demo mode. Backend is unavailable.')
      return
    }

    setLoading(true)
    try {
      if (activeTab === 'companies') {
        await api.createCompany(formData)
      } else if (activeTab === 'cash-accounts') {
        await api.createCashAccount(formData)
      } else if (activeTab === 'invoices') {
        await api.createInvoice(formData)
      } else if (activeTab === 'obligations') {
        await api.createObligation(formData)
      } else if (activeTab === 'transactions') {
        await api.createBankTransaction(formData)
      }

      setShowForm(false)
      setFormData({})
      window.location.reload()
    } catch (err) {
      console.error('Failed to create:', err)
      alert('Failed to create. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, entityType: EntityType) => {
    if (inFallbackMode) {
      alert('Cannot delete in demo mode.')
      return
    }

    if (!confirm('Are you sure you want to delete this item?')) return

    setLoading(true)
    try {
      if (entityType === 'companies') {
        await api.deleteCompany(id)
      } else if (entityType === 'cash-accounts') {
        await api.deleteCashAccount(id)
      } else if (entityType === 'invoices') {
        await api.deleteInvoice(id)
      } else if (entityType === 'obligations') {
        await api.deleteObligation(id)
      } else if (entityType === 'transactions') {
        await api.deleteBankTransaction(id)
      }
      window.location.reload()
    } catch (err) {
      console.error('Failed to delete:', err)
      alert('Failed to delete. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderForm = () => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create New {activeTab.slice(0, -1)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeTab === 'companies' && (
              <>
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Acme Corp"
                  />
                </div>
                <div>
                  <Label>Tax ID</Label>
                  <Input
                    value={formData.taxId || ''}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="e.g., 123456789"
                  />
                </div>
              </>
            )}

            {activeTab === 'cash-accounts' && (
              <>
                <div>
                  <Label>Cash Account Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Main Operating Account"
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input
                    value={formData.currency || ''}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="e.g., USD"
                  />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input
                    value={formData.accountNumber || ''}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="e.g., 1234567890"
                  />
                </div>
              </>
            )}

            {activeTab === 'invoices' && (
              <>
                <div>
                  <Label>Invoice Number</Label>
                  <Input
                    value={formData.invoiceNumber || ''}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    placeholder="e.g., INV-2024-001"
                  />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input
                    value={formData.currency || ''}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="e.g., USD"
                  />
                </div>
                <div>
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={formData.issueDate || ''}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <select
                    value={formData.status || InvoiceStatus.ISSUED}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value={InvoiceStatus.ISSUED}>Issued</option>
                    <option value={InvoiceStatus.PAID}>Paid</option>
                    <option value={InvoiceStatus.OVERDUE}>Overdue</option>
                    <option value={InvoiceStatus.CANCELLED}>Cancelled</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === 'obligations' && (
              <>
                <div>
                  <Label>Obligation Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Office Rent"
                  />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input
                    value={formData.currency || ''}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="e.g., USD"
                  />
                </div>
                <div>
                  <Label>Next Due Date</Label>
                  <Input
                    type="date"
                    value={formData.nextDueDate || ''}
                    onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Recurrence</Label>
                  <select
                    value={formData.recurrence || RecurrenceType.NONE}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value={RecurrenceType.NONE}>One-time</option>
                    <option value={RecurrenceType.WEEKLY}>Weekly</option>
                    <option value={RecurrenceType.MONTHLY}>Monthly</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === 'transactions' && (
              <>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input
                    value={formData.currency || ''}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="e.g., USD"
                  />
                </div>
                <div>
                  <Label>Direction</Label>
                  <select
                    value={formData.direction || TransactionDirection.IN}
                    onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value={TransactionDirection.IN}>Income</option>
                    <option value={TransactionDirection.OUT}>Expense</option>
                  </select>
                </div>
                <div>
                  <Label>Booked Date</Label>
                  <Input
                    type="date"
                    value={formData.bookedAt || ''}
                    onChange={(e) => setFormData({ ...formData, bookedAt: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Client payment"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                Create
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderList = () => {
    if (activeTab === 'companies') {
      return (
        <div className="space-y-3">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-semibold text-slate-900">{company.name}</p>
                      <p className="text-sm text-slate-500">Tax ID: {company.taxId || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(company)
                        setShowForm(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(company.id, 'companies')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {companies.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No companies found
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'cash-accounts') {
      return (
        <div className="space-y-3">
          {cashAccounts.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-semibold text-slate-900">{account.name}</p>
                      <p className="text-sm text-slate-500">{account.currency} • {account.accountNumber || 'No number'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(account)
                        setShowForm(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(account.id, 'cash-accounts')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {cashAccounts.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No cash accounts found
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'invoices') {
      return (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-semibold text-slate-900">{invoice.invoiceNumber || `Invoice #${invoice.id}`}</p>
                      <p className="text-sm text-slate-500">
                        Due: {formatDate(invoice.dueDate)} • {formatCurrency(invoice.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(invoice)
                        setShowForm(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(invoice.id, 'invoices')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {invoices.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No invoices found
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'obligations') {
      return (
        <div className="space-y-3">
          {obligations.map((obligation) => (
            <Card key={obligation.id} className="hover:shadow-md transition-shadow border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="font-semibold text-slate-900">{obligation.name}</p>
                      <p className="text-sm text-slate-500">
                        Due: {formatDate(obligation.nextDueDate)} • {formatCurrency(obligation.amount)} • {obligation.recurrence}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(obligation)
                        setShowForm(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(obligation.id, 'obligations')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {obligations.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No obligations found
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'transactions') {
      return (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className={`w-5 h-5 ${transaction.direction === TransactionDirection.IN ? 'text-emerald-400' : 'text-red-400'}`} />
                    <div>
                      <p className="font-semibold text-slate-900">{transaction.description || 'No description'}</p>
                      <p className="text-sm text-slate-500">
                        {formatDate(transaction.bookedAt)} • {transaction.direction === TransactionDirection.IN ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(transaction)
                        setShowForm(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(transaction.id, 'transactions')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No transactions found
            </div>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-500 mt-1">Manage all your data</p>
        </div>
        {inFallbackMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            <p className="text-sm text-amber-800">
              <strong>Demo Mode:</strong> Backend unavailable
            </p>
          </div>
        )}
      </div>
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'companies', label: 'Companies', icon: Building2 },
          { id: 'cash-accounts', label: 'Cash Accounts', icon: CreditCard },
          { id: 'invoices', label: 'Invoices', icon: FileText },
          { id: 'obligations', label: 'Obligations', icon: DollarSign },
          { id: 'transactions', label: 'Transactions', icon: DollarSign },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as EntityType)
              setShowForm(false)
              setFormData({})
            }}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-ocean-500 text-ocean-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
      {!showForm && (
        <div className="flex justify-start">
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Add New {activeTab.slice(0, -1)}
          </Button>
        </div>
      )}
      {showForm && renderForm()}
      {renderList()}
    </div>
  )
}
