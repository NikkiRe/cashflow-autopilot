import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAV } from '@/config/appNavigation'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-md transition-opacity duration-300 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-slate-100/90 bg-white/95 backdrop-blur-xl transition-transform duration-300 ease-out-expo',
          'lg:static lg:z-0 lg:translate-x-0 lg:shadow-[4px_0_48px_-16px_rgba(15,23,42,0.07)]',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div
              className="motion-safe:animate-logo-breathe flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #0080FF 0%, #00D4FF 100%)',
                boxShadow: '0 4px 14px rgba(0, 128, 255, 0.4)',
              }}
            >
              <Zap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-display text-base font-bold tracking-tight text-slate-900">Cashflow</span>
              <span
                className="block text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: '#0080FF', letterSpacing: '0.12em' }}
              >
                Autopilot
              </span>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divider-neon mx-5 mb-3" />

        <p className="px-5 mb-2 text-[10px] font-semibold tracking-widest uppercase text-slate-400">
          Navigation
        </p>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {APP_NAV.map((item) => {
            const Icon = item.icon
            const isActive =
              item.path === '/' ? location.pathname === '/' : location.pathname === item.path

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && onToggle()}
                className={cn('nav-item group', isActive && 'active')}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-300 ease-out-expo group-hover:scale-105',
                    isActive
                      ? 'bg-blue-500 text-white shadow-[0_2px_8px_rgba(0,128,255,0.35)]'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                </div>
                <span className={cn(isActive ? 'text-blue-700 font-semibold' : '')}>{item.label}</span>
                {isActive && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"
                    style={{ boxShadow: '0 0 6px rgba(0, 128, 255, 0.6)' }}
                  />
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-2 p-4">
          <div
            className="relative overflow-hidden rounded-2xl p-4 ring-1 ring-blue-500/[0.08] transition-[box-shadow,ring-color] duration-500 hover:ring-blue-400/20"
            style={{
              background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%)',
              border: '1px solid rgba(0, 128, 255, 0.1)',
            }}
          >
            <div
              className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #00D4FF, transparent)' }}
            />
            <p className="text-xs font-semibold text-blue-700 mb-0.5">Decision Engine</p>
            <p className="text-[10px] text-blue-400 font-medium">v1.0 · Premium</p>
          </div>
        </div>
      </aside>
    </>
  )
}
