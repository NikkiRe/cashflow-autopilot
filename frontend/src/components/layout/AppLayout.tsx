import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAccount } from '@/contexts/AccountContext'
import { AmbientBackdrop } from './AmbientBackdrop'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { presentationStrip } = useAccount()
  const location = useLocation()

  return (
    <div
      className="relative flex h-screen overflow-hidden bg-grid"
      style={{ backgroundColor: '#f1f5f9' }}
    >
      <AmbientBackdrop />
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        {presentationStrip && (
          <div
            className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-200/80 px-5 py-2.5 text-xs animate-slide-down sm:text-sm backdrop-blur-md"
            style={{
              background: 'linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(240,249,255,0.95) 50%, rgba(255,255,255,0.9) 100%)',
            }}
            role="status"
          >
            <span className="flex items-center gap-2 text-slate-700">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-blue-500" aria-hidden />
              <span className="font-display font-semibold text-slate-900">Presentation build</span>
            </span>
            <span className="max-w-3xl text-slate-600">{presentationStrip.disclaimer}</span>
            <span className="font-medium text-slate-500">{presentationStrip.currencyLabel}</span>
            {presentationStrip.sampleDatasetSeededThisStartup && (
              <span className="font-medium text-emerald-700">Sample data loaded on startup</span>
            )}
          </div>
        )}
        <main className="flex-1 overflow-y-auto overscroll-y-contain scroll-smooth p-5 lg:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-[1680px]"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
