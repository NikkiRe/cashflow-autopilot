import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-gradient-to-r from-slate-100 via-slate-200/70 to-slate-100 bg-[length:200%_100%] animate-shimmer',
        className,
      )}
    />
  )
}

export function SkeletonMetricCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-100/90 bg-white p-5 space-y-4">
          <div className="flex items-start justify-between">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3.5 w-20" />
          </div>
          <div className="pt-3 border-t border-slate-100">
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="h-52 w-full rounded-xl" />
    </div>
  )
}

export function SkeletonListCard() {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
      <SkeletonMetricCards />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SkeletonChart />
        </div>
        <div className="space-y-4">
          <SkeletonListCard />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonListCard />
        <SkeletonListCard />
      </div>
    </div>
  )
}

export function ForecastSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-32" />
          </div>
        ))}
      </div>
      <SkeletonChart />
    </div>
  )
}
