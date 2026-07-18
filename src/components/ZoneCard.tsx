import * as React from "react";
import { Zone, getZoneColor } from "@/lib/zoneData";
import { Card } from "./ui/card";

export interface ZoneCardProps {
  zone: Zone;
  onClick?: () => void;
}

const ZoneCardComponent = ({ zone, onClick }: ZoneCardProps) => {
  const colorKey = getZoneColor(zone.occupancyPercent);

  // Map state color key to designated design system variables
  // Green -> primary, Amber -> tertiary, Red -> error
  const borderStyles = {
    primary: "border-primary/30 bg-primary-container/10",
    tertiary: "border-tertiary/30 bg-tertiary-container/5",
    error: "border-error/50 bg-error-container/10 animate-pulse-slow",
  }[colorKey] || "border-outline-variant/30";

  const textStyles = {
    primary: "text-primary",
    tertiary: "text-tertiary",
    error: "text-error",
  }[colorKey] || "text-on-surface";

  const badgeStyles = {
    primary: "bg-primary-container text-primary",
    tertiary: "bg-tertiary/20 text-tertiary",
    error: "bg-error text-on-error",
  }[colorKey] || "bg-surface-variant text-on-surface";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      data-testid={`zone-card-${zone.zoneId}`}
      className={`p-4 relative transition-all duration-200 border rounded-xl ${borderStyles} ${
        onClick ? "cursor-pointer hover:border-tertiary/50 active:scale-[0.98]" : ""
      }`}
    >
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <span className={`font-data-mono text-data-mono uppercase tracking-wider block mb-1 ${textStyles}`}>
            {zone.zoneId} • {zone.gate}
          </span>
          <h3 className="font-label-bold text-label-bold text-on-surface">
            {zone.name}
          </h3>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded font-label-bold text-[10px] uppercase tracking-wider ${badgeStyles}`}>
          {zone.status}
        </span>
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-data-mono text-data-mono text-on-surface-variant">OCCUPANCY</span>
          <span className={`font-label-bold text-label-bold mt-0.5 ${textStyles}`}>
            {zone.occupancyPercent}% CAP
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-24 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${{
              primary: "bg-primary",
              tertiary: "bg-tertiary",
              error: "bg-error",
            }[colorKey] || "bg-on-surface"}`}
            style={{ width: `${Math.min(zone.occupancyPercent, 100)}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

ZoneCardComponent.displayName = "ZoneCard";

export const ZoneCard = React.memo(ZoneCardComponent);
