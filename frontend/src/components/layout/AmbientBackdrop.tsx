import React from 'react'

export function AmbientBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden motion-reduce:hidden"
      aria-hidden
    >
      <div className="absolute -top-40 -right-40 h-[min(520px,55vw)] w-[min(520px,55vw)] rounded-full bg-cyan-400/[0.18] blur-[100px] animate-ambient-1" />
      <div className="absolute top-[28%] -left-32 h-[min(440px,50vw)] w-[min(440px,50vw)] rounded-full bg-blue-500/[0.14] blur-[90px] animate-ambient-2" />
      <div className="absolute bottom-[-10%] right-[18%] h-[min(400px,45vw)] w-[min(400px,45vw)] rounded-full bg-violet-500/[0.12] blur-[85px] animate-ambient-3" />
      <div className="absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full bg-emerald-400/[0.06] blur-[70px] animate-ambient-2" />
    </div>
  )
}
