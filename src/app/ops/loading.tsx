import React from "react";

export default function OpsLoading() {
  return (
    <div className="flex-1 p-container-padding max-w-[1200px] mx-auto space-y-stack-gap pt-8 pb-32">
      {/* Header section skeleton */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-grid-gutter gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-surface-container-highest animate-pulse rounded" />
          <div className="h-4 w-80 bg-surface-container-highest/60 animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-surface-container-highest animate-pulse rounded-lg" />
          <div className="h-10 w-32 bg-surface-container-highest animate-pulse rounded-lg" />
        </div>
      </div>

      {/* Bento Layout skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-grid-gutter">
        {/* Table skeleton */}
        <div className="bg-[#1A1C1E] border border-outline-variant/30 rounded-xl p-4 lg:col-span-2 min-h-[300px] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="h-6 w-36 bg-surface-container-highest animate-pulse rounded" />
            <div className="h-6 w-6 bg-surface-container-highest animate-pulse rounded-full" />
          </div>
          <div className="space-y-3 flex-1">
            <div className="h-8 bg-surface-container-highest/40 animate-pulse rounded" />
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-10 bg-surface-container-highest/20 animate-pulse rounded" />
            ))}
          </div>
        </div>

        {/* Alerts feed skeleton */}
        <div className="bg-[#1A1C1E] border border-outline-variant/30 rounded-xl p-4 min-h-[300px] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="h-6 w-24 bg-surface-container-highest animate-pulse rounded" />
            <div className="h-6 w-6 bg-surface-container-highest animate-pulse rounded-full" />
          </div>
          <div className="space-y-3 flex-1">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-16 bg-surface-container-highest/20 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Incident log list skeleton */}
      <div className="bg-[#1A1C1E] border border-outline-variant/30 rounded-xl p-4 mt-6 flex flex-col gap-4">
        <div className="h-6 w-32 bg-surface-container-highest animate-pulse rounded" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-12 bg-surface-container-highest/20 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
