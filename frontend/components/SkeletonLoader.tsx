'use client';

import React from 'react';

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`} />
  );
}

export function KPIGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 animate-pulse">
          <div className="w-11 h-11 bg-slate-200 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-6 bg-slate-200 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-none animate-pulse">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className={`h-4 bg-slate-200 rounded ${
                  c === 0 ? 'w-1/3' : c === cols - 1 ? 'w-16 ml-auto' : 'w-1/6'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded w-16" />
            <div className="h-4 bg-slate-200 rounded-full w-20" />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-5/6" />
            <div className="h-3 bg-slate-200 rounded w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartGridSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-pulse">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded-full w-20" />
        </div>
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-pulse">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-4 bg-slate-200 rounded-full w-16" />
        </div>
        <div className="h-64 bg-slate-100 rounded-full mx-auto w-56" />
      </div>
    </div>
  );
}
