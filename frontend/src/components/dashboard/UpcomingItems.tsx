import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { formatDate, formatRelativeDate, formatCurrency } from '@/lib/utils'

interface UpcomingItem {
  id: number
  type: 'invoice' | 'obligation'
  description: string
  amount: number
  date: string
  status?: 'PENDING' | 'PAID' | 'OVERDUE'
}

interface UpcomingItemsProps {
  items: UpcomingItem[]
  title: string
  emptyMessage?: string
}

export function UpcomingItems({ items, title, emptyMessage = 'No items to display' }: UpcomingItemsProps) {
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'PAID':
        return 'success'
      case 'OVERDUE':
        return 'danger'
      case 'PENDING':
      default:
        return 'warning'
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-premium-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg ${item.type === 'invoice' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {item.type === 'invoice' ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-500">
                      {formatRelativeDate(item.date)}
                    </p>
                    {item.status && (
                      <Badge variant={getStatusVariant(item.status)}>
                        {item.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className={`text-sm font-semibold ${item.type === 'invoice' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {item.type === 'invoice' ? '+' : '-'}{formatCurrency(item.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
