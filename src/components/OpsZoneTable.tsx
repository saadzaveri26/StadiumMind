import * as React from "react";
import { Zone } from "@/lib/hooks/useZones";

export interface OpsZoneTableProps {
  zones: Zone[];
  loading: boolean;
  translations: {
    zoneOccupancy: string;
    zoneId: string;
    location: string;
    capacity: string;
  };
}

const OpsZoneTableComponent = ({
  zones,
  loading,
  translations,
}: OpsZoneTableProps) => {
  return (
    <section className="bg-[#1A1C1E] border border-outline-variant/30 rounded-xl p-4 lg:col-span-2 flex flex-col min-h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline-lg-mobile text-lg font-bold text-on-surface uppercase tracking-tight">
          {translations.zoneOccupancy}
        </h3>
        <span className="material-symbols-outlined text-on-surface-variant text-[24px]">groups</span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-primary-container border-t-tertiary animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/50">
                <th className="font-data-mono text-xs text-on-surface-variant py-3 px-2">{translations.zoneId}</th>
                <th className="font-data-mono text-xs text-on-surface-variant py-3 px-2">{translations.location}</th>
                <th className="font-data-mono text-xs text-on-surface-variant py-3 px-2">STATUS</th>
                <th className="font-data-mono text-xs text-on-surface-variant py-3 px-2 text-right">{translations.capacity}</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-sm">
              {zones.map((zone) => {
                const colorClass = {
                  primary: "text-primary bg-primary-container/20 border-primary/30",
                  tertiary: "text-tertiary bg-tertiary/10 border-tertiary/30",
                  error: "text-error bg-error/10 border-error/30 animate-pulse",
                }[
                  zone.status === "NOMINAL" ? "primary" : zone.status === "WARNING" ? "tertiary" : "error"
                ] || "";

                return (
                  <tr key={zone.zoneId} className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-2 font-data-mono text-tertiary font-bold">{zone.zoneId}</td>
                    <td className="py-3 px-2 text-on-surface">{zone.name}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded font-label-bold text-[9px] border uppercase ${colorClass}`}>
                        {zone.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-data-mono font-bold text-on-surface">
                      {zone.occupancyPercent}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

OpsZoneTableComponent.displayName = "OpsZoneTable";

export const OpsZoneTable = React.memo(OpsZoneTableComponent);
