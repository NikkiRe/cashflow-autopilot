import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`
  if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`
  return formatDate(d)
}

export function calculateTrend(current: number, previous: number): {
  value: number
  isPositive: boolean
  label: string
} {
  if (previous === 0) {
    return {
      value: current > 0 ? 100 : 0,
      isPositive: current > 0,
      label: 'New',
    }
  }

  const value = ((current - previous) / Math.abs(previous)) * 100
  return {
    value: Math.abs(value),
    isPositive: value >= 0,
    label: value >= 0 ? 'increased' : 'decreased',
  }
}
