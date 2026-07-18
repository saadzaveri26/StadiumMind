import React from "react";

export default function AssistantLoading() {
  return (
    <div className="flex-1 flex flex-col pt-4 max-w-3xl mx-auto w-full relative h-[calc(100vh-72px)] overflow-hidden">
      {/* Suggestion chips skeleton */}
      <div className="w-full py-3 px-container-padding flex gap-3 shrink-0 border-b border-outline-variant/20 bg-background/90 backdrop-blur-sm sticky top-0 z-20">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-8 w-28 bg-surface-container-highest animate-pulse rounded-full" />
        ))}
      </div>

      {/* Chat messages skeleton */}
      <div className="flex-1 overflow-y-auto px-container-padding py-6 flex flex-col gap-6 no-scrollbar">
        {/* Bot message bubble skeleton */}
        <div className="flex w-full max-w-[85%] gap-3 items-end mr-auto">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest animate-pulse shrink-0" />
          <div className="flex flex-col gap-2 w-full">
            <div className="rounded-2xl p-4 bg-surface-container-low border border-outline-variant/30 rounded-bl-sm space-y-2">
              <div className="h-3 w-40 bg-surface-container-highest animate-pulse rounded" />
              <div className="h-3 w-64 bg-surface-container-highest animate-pulse rounded" />
              <div className="h-3 w-20 bg-surface-container-highest animate-pulse rounded" />
            </div>
          </div>
        </div>

        {/* User message bubble skeleton */}
        <div className="flex w-full max-w-[85%] gap-3 items-end ml-auto justify-end">
          <div className="flex flex-col gap-2 w-full">
            <div className="rounded-2xl p-4 bg-primary-container border border-primary/20 rounded-br-sm space-y-2 ml-auto w-fit min-w-[150px]">
              <div className="h-3 w-28 bg-primary/20 animate-pulse rounded" />
            </div>
          </div>
        </div>

        {/* Bot message bubble skeleton */}
        <div className="flex w-full max-w-[85%] gap-3 items-end mr-auto">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest animate-pulse shrink-0" />
          <div className="flex flex-col gap-2 w-full">
            <div className="rounded-2xl p-4 bg-surface-container-low border border-outline-variant/30 rounded-bl-sm space-y-2">
              <div className="h-3 w-56 bg-surface-container-highest animate-pulse rounded" />
              <div className="h-3 w-48 bg-surface-container-highest animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Input area skeleton */}
      <div className="px-container-padding py-4 bg-background border-t border-outline-variant/30 flex items-center gap-3 shrink-0 z-20">
        <div className="flex-1 bg-surface-container-low rounded-[24px] border border-outline-variant/50 h-14" />
        <div className="w-14 h-14 bg-surface-container-highest animate-pulse rounded-full" />
      </div>
    </div>
  );
}
