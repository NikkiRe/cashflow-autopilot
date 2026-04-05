import React, { useState, useRef, useEffect } from 'react'
import { Menu, Bell, Settings, User, LogOut, ChevronDown, Clock } from 'lucide-react'

type ActivePanel = 'notifications' | 'settings' | 'profile' | null

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const [liveTime, setLiveTime] = useState(() => new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = window.setInterval(() => setLiveTime(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePanel(null)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActivePanel(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel(activePanel === panel ? null : panel)
  }

  return (
    <header
      className="sticky top-0 z-30 w-full transition-shadow duration-500"
      style={{
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(24px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset',
      }}
    >
      <div className="flex items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-base font-bold leading-tight tracking-tight text-slate-900">
              Liquidity Decision Engine
            </h1>
            <p className="text-xs font-medium text-slate-400">Real-time cashflow intelligence</p>
          </div>
        </div>

        <div ref={containerRef} className="relative flex items-center gap-1.5">
          <div
            className="mr-1 hidden items-center gap-2 border-r border-slate-200/90 pr-4 md:flex"
            title="Session clock (local)"
          >
            <Clock className="h-3.5 w-3.5 text-blue-400/90" aria-hidden />
            <time
              dateTime={liveTime.toISOString()}
              className="text-[11px] font-semibold tabular-nums tracking-tight text-slate-500"
            >
              {liveTime.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </time>
          </div>
          <div className="relative">
            <button
              onClick={() => togglePanel('notifications')}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all duration-300 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span
                className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                style={{ background: '#FF3EAB', boxShadow: '0 0 6px rgba(255,62,171,0.6)' }}
              />
            </button>
            {activePanel === 'notifications' && (
              <div
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl p-4 z-50 animate-slide-up"
                style={{
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                  <span className="badge-neon blue">0 new</span>
                </div>
                <div className="text-center py-6">
                  <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No new notifications</p>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => togglePanel('settings')}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all duration-300 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Settings"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
            {activePanel === 'settings' && (
              <div
                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl p-5 z-50 animate-slide-up"
                style={{
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <h3 className="font-semibold text-slate-900 mb-4">Preferences</h3>
                <div className="space-y-4">
                  {[
                    { key: 'compactMode', label: 'Compact Mode', check: () => localStorage.getItem('compactMode') === 'true' },
                    { key: 'animationsEnabled', label: 'Animations', check: () => localStorage.getItem('animationsEnabled') !== 'false' },
                  ].map(({ key, label, check }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 font-medium">{label}</span>
                      <button
                        onClick={() => {
                          const current = check()
                          localStorage.setItem(key, String(!current))
                          window.location.reload()
                        }}
                        className="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
                        style={{
                          background: check()
                            ? 'linear-gradient(135deg, #0080FF, #00D4FF)'
                            : '#e2e8f0',
                          boxShadow: check() ? '0 2px 8px rgba(0,128,255,0.3)' : 'none',
                        }}
                      >
                        <div
                          className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 shadow-sm"
                          style={{ transform: check() ? 'translateX(22px)' : 'translateX(2px)' }}
                        />
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-slate-400 pt-1 border-t border-slate-100">
                    Changes apply on page reload
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200 mx-1" />

          <div className="relative">
            <button
              onClick={() => togglePanel('profile')}
              className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition-all duration-300 hover:bg-slate-100"
              aria-label="Profile"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, #0080FF 0%, #00D4FF 100%)',
                  boxShadow: '0 2px 8px rgba(0,128,255,0.3)',
                }}
              >
                D
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {activePanel === 'profile' && (
              <div
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl overflow-hidden z-50 animate-slide-up"
                style={{
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  className="px-4 py-4"
                  style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{
                        background: 'linear-gradient(135deg, #0080FF 0%, #00D4FF 100%)',
                        boxShadow: '0 4px 12px rgba(0,128,255,0.35)',
                      }}
                    >
                      D
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Demo User</p>
                      <p className="text-xs text-slate-500">demo@cashflow.app</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2.5">
                    <User className="w-4 h-4 text-slate-400" />
                    Account Settings
                  </button>
                  <button
                    onClick={() => alert('Demo mode — no authentication configured')}
                    className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2.5"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
