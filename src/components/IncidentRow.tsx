import * as React from "react";
import { Incident } from "@/lib/hooks/useIncidents";

export interface IncidentRowProps {
  incident: Incident;
  onToggleStatus?: (id: string, isResolved: boolean) => void;
}

const IncidentRowComponent = ({ incident, onToggleStatus }: IncidentRowProps) => {
  const isResolved = !!incident.resolvedAt;

  const handleToggle = () => {
    if (onToggleStatus) {
      onToggleStatus(incident.id, !isResolved);
    }
  };

  const severityColor = {
    HIGH: "text-error border-error/30 bg-error/10",
    MEDIUM: "text-tertiary border-tertiary/30 bg-tertiary/10",
    LOW: "text-primary border-primary/30 bg-primary/10",
  }[incident.severity] || "text-on-surface border-outline-variant bg-surface-variant";

  // Parse time
  const formattedTime = React.useMemo(() => {
    try {
      const date = new Date(incident.reportedAt);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "--:--";
    }
  }, [incident.reportedAt]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors border border-outline-variant/20 gap-3">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        <span className="font-data-mono text-data-mono text-on-surface-variant w-14 shrink-0">
          {formattedTime}
        </span>

        {/* Resolved/Active pill */}
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded font-label-bold text-[9px] w-20 justify-center uppercase tracking-wider border ${
            isResolved
              ? "bg-surface-variant text-on-surface-variant border-outline-variant"
              : "bg-primary-container text-primary border-primary/30"
          }`}
        >
          {isResolved ? "RESOLVED" : "ACTIVE"}
        </span>

        {/* Severity badge */}
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-data-mono text-[9px] uppercase tracking-wider border ${severityColor}`}>
          {incident.severity}
        </span>

        <span className="font-body-md text-sm text-on-surface flex-1 min-w-[200px]">
          {incident.description} <span className="text-xs text-on-surface-variant font-data-mono">[{incident.zoneId}]</span>
        </span>
      </div>

      <div className="flex items-center gap-4 justify-between sm:justify-end shrink-0">
        <span className="font-data-mono text-data-mono text-tertiary text-xs">
          #{incident.id.slice(0, 8)}
        </span>

        {/* Toggle Switch */}
        {onToggleStatus && (
          <button
            onClick={handleToggle}
            role="switch"
            aria-checked={isResolved}
            aria-label={`Toggle incident status for #${incident.id.slice(0, 8)}`}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isResolved ? "bg-primary" : "bg-outline-variant"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                isResolved ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
};

IncidentRowComponent.displayName = "IncidentRow";

export const IncidentRow = React.memo(IncidentRowComponent);
