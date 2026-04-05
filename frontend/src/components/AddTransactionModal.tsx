import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Plus, ArrowUp, ArrowDown } from 'lucide-react'

type TransactionType = 'IN' | 'OUT'

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { amount: number; description: string; type: TransactionType; date: string }) => void
}

export function AddTransactionModal({ isOpen, onClose, onSubmit }: AddTransactionModalProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<TransactionType>('IN')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description) return

    onSubmit({
      amount: Number(amount),
      description,
      type,
      date,
    })

    setAmount('')
    setDescription('')
    setType('IN')
    setDate(new Date().toISOString().split('T')[0])
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Add Transaction</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label>Transaction Type</Label>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setType('IN')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      type === 'IN'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <ArrowUp className="w-5 h-5" />
                    <span className="font-medium">Income</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('OUT')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      type === 'OUT'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <ArrowDown className="w-5 h-5" />
                    <span className="font-medium">Expense</span>
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  step={0.01}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-lg"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Client payment, Rent..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={`flex-1 gap-2 ${
                    type === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
