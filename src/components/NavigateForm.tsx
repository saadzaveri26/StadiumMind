import * as React from "react";
import { Zone } from "@/lib/hooks/useZones";
import { Button } from "./ui/button";

export interface NavigateFormProps {
  zones: Zone[];
  startZone: string;
  endZone: string;
  setStartZone: (val: string) => void;
  setEndZone: (val: string) => void;
  onSubmit: () => void;
  calculating: boolean;
  errorMsg: string | null;
  translations: {
    findWay: string;
  };
}

const NavigateFormComponent = ({
  zones,
  startZone,
  endZone,
  setStartZone,
  setEndZone,
  onSubmit,
  calculating,
  errorMsg,
  translations,
}: NavigateFormProps) => {
  return (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 mt-4 space-y-4">
      <h3 className="font-label-bold text-sm text-on-surface uppercase tracking-wider">
        Pathfinding Parameters
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="start-zone-select" className="text-xs text-on-surface-variant font-data-mono uppercase">Start Zone</label>
          <select
            id="start-zone-select"
            name="start-zone-select"
            value={startZone}
            onChange={(e) => setStartZone(e.target.value)}
            className="bg-background text-on-surface border border-outline-variant rounded-lg p-2.5 h-touch-target-min text-sm"
          >
            <option value="">Select starting location...</option>
            {zones.map((z) => (
              <option key={z.zoneId} value={z.zoneId}>
                {z.zoneId} — {z.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="end-zone-select" className="text-xs text-on-surface-variant font-data-mono uppercase">End Zone</label>
          <select
            id="end-zone-select"
            name="end-zone-select"
            value={endZone}
            onChange={(e) => setEndZone(e.target.value)}
            className="bg-background text-on-surface border border-outline-variant rounded-lg p-2.5 h-touch-target-min text-sm"
          >
            <option value="">Select destination...</option>
            {zones.map((z) => (
              <option key={z.zoneId} value={z.zoneId}>
                {z.zoneId} — {z.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMsg && (
        <p className="text-xs text-error font-data-mono tracking-wide">{errorMsg}</p>
      )}

      <Button
        variant="default"
        onClick={onSubmit}
        disabled={calculating || zones.length === 0}
        className="w-full h-[56px] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(233,195,73,0.2)]"
      >
        <span className="material-symbols-outlined">explore</span>
        {calculating ? "Calculating Route..." : translations.findWay}
      </Button>
    </div>
  );
};

NavigateFormComponent.displayName = "NavigateForm";

export const NavigateForm = React.memo(NavigateFormComponent);
