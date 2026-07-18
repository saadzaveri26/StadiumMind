import React from "react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-4">
      {/* Dynamic spinner styled after design system */}
      <div className="w-12 h-12 rounded-full border-4 border-primary-container border-t-tertiary animate-spin" />
      <span className="font-data-mono text-data-mono text-tertiary uppercase tracking-widest animate-pulse">
        Synchronizing venue telemetry...
      </span>
    </div>
  );
}
