import React from "react";

export default function NavigateLoading() {
  return (
    <div className="flex-1 px-container-padding max-w-[1200px] mx-auto w-full flex flex-col pt-8 pb-32">
      {/* Header section skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-grid-gutter mt-2 gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-surface-container-highest animate-pulse rounded" />
          <div className="h-4 w-36 bg-surface-container-highest/60 animate-pulse rounded" />
        </div>
        <div className="h-10 w-24 bg-surface-container-highest animate-pulse rounded-full" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-gap mb-grid-gutter">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 border border-outline-variant/20 rounded-xl bg-surface-container-low min-h-[140px] flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-surface-container-highest animate-pulse rounded" />
                <div className="h-5 w-32 bg-surface-container-highest animate-pulse rounded" />
              </div>
              <div className="h-5 w-16 bg-surface-container-highest animate-pulse rounded" />
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="space-y-1">
                <div className="h-2.5 w-12 bg-surface-container-highest animate-pulse rounded" />
                <div className="h-4 w-20 bg-surface-container-highest animate-pulse rounded" />
              </div>
              <div className="h-2 w-24 bg-surface-container-highest animate-pulse rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Form skeleton */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 mt-4 space-y-4">
        <div className="h-4 w-36 bg-surface-container-highest animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-14 bg-surface-container-highest animate-pulse rounded-lg" />
          <div className="h-14 bg-surface-container-highest animate-pulse rounded-lg" />
        </div>
        <div className="h-14 bg-surface-container-highest animate-pulse rounded-lg" />
      </div>
    </div>
  );
}
