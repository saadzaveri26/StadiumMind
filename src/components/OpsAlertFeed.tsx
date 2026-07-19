import * as React from "react";
import { AlertCard } from "./AlertCard";

export interface Alert {
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  message: string;
  zoneId?: string;
  timestamp: string;
}

export interface OpsAlertFeedProps {
  alerts: Alert[];
  translations: {
    aiAlerts: string;
  };
  lastUpdated?: string | null;
}

const OpsAlertFeedComponent = ({
  alerts,
  translations,
  lastUpdated,
}: OpsAlertFeedProps) => {
  return (
    <section className="bg-[#1A1C1E] border border-outline-variant/30 rounded-xl p-4 flex flex-col min-h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline-lg-mobile text-lg font-bold text-on-surface uppercase tracking-tight">
          {translations.aiAlerts}
        </h3>
        <span className="material-symbols-outlined text-tertiary text-[24px]">smart_toy</span>
      </div>

      {lastUpdated && (
        <p className="font-data-mono text-[10px] text-on-surface-variant mb-3 uppercase tracking-wider">
          Last updated: {lastUpdated}
        </p>
      )}

      <div
        aria-live="polite"
        className="space-y-3 flex-grow overflow-y-auto pr-1 no-scrollbar"
      >
        {alerts.map((alert) => (
          <AlertCard
            key={`${alert.severity}-${alert.title}-${alert.zoneId || "global"}`}
            severity={alert.severity}
            title={alert.title}
            message={alert.message}
            zoneId={alert.zoneId}
            timestamp={alert.timestamp}
          />
        ))}
      </div>
    </section>
  );
};

OpsAlertFeedComponent.displayName = "OpsAlertFeed";

export const OpsAlertFeed = React.memo(OpsAlertFeedComponent);
