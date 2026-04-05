import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  TrendingUp,
  Layers,
  FileText,
  Calendar,
  ArrowLeftRight,
  Zap,
  Settings,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { Dashboard } from '@/pages/Dashboard'
import { Forecast } from '@/pages/Forecast'
import { Scenarios } from '@/pages/Scenarios'
import { Invoices } from '@/pages/Invoices'
import { Obligations } from '@/pages/Obligations'
import { Transactions } from '@/pages/Transactions'
import { Factoring } from '@/pages/Factoring'
import { Admin } from '@/pages/Admin'

export interface AppNavItem {
  path: string
  segment: string
  label: string
  icon: LucideIcon
  Page: ComponentType
}

export const APP_NAV: AppNavItem[] = [
  { path: '/', segment: '', label: 'Dashboard', icon: LayoutDashboard, Page: Dashboard },
  { path: '/forecast', segment: 'forecast', label: 'Forecast', icon: TrendingUp, Page: Forecast },
  { path: '/scenarios', segment: 'scenarios', label: 'Scenarios', icon: Layers, Page: Scenarios },
  { path: '/invoices', segment: 'invoices', label: 'Invoices', icon: FileText, Page: Invoices },
  { path: '/obligations', segment: 'obligations', label: 'Obligations', icon: Calendar, Page: Obligations },
  { path: '/transactions', segment: 'transactions', label: 'Transactions', icon: ArrowLeftRight, Page: Transactions },
  { path: '/factoring', segment: 'factoring', label: 'Factoring', icon: Zap, Page: Factoring },
  { path: '/admin', segment: 'admin', label: 'Admin', icon: Settings, Page: Admin },
]
