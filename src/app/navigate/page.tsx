"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useZones, Zone } from "@/lib/hooks/useZones";
import { translations } from "@/lib/translations";
import { ZoneCard } from "@/components/ZoneCard";
import { RouteCard } from "@/components/RouteCard";
import { Button } from "@/components/ui/button";

export default function NavigatePage() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en!;
  
  const { zones, loading } = useZones();
  
  const [startZone, setStartZone] = useState<string>("");
  const [endZone, setEndZone] = useState<string>("");
  
  const [routeData, setRouteData] = useState<{
    steps: string[];
    estTime: string;
    destinationName: string;
  } | null>(null);
  
  const [calculating, setCalculating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto seed telemetry helper
  const handleSeedTelemetry = async () => {
    try {
      const res = await fetch("/api/zones/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to initialize telemetry");
      }
    } catch {
      setErrorMsg("Failed to initialize telemetry");
    }
  };

  const handleFindWay = async () => {
    if (!startZone || !endZone) {
      setErrorMsg("Please select both start and end zones");
      return;
    }
    if (startZone === endZone) {
      setErrorMsg("Start and end zones must be different");
      return;
    }

    setCalculating(true);
    setErrorMsg(null);
    setRouteData(null);

    try {
      const res = await fetch("/api/navigate/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startZoneId: startZone,
          endZoneId: endZone,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to calculate route");
      }

      const data = await res.json();
      setRouteData({
        steps: data.steps,
        estTime: data.estTime,
        destinationName: data.destinationName,
      });
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to calculate route");
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="flex-1 px-container-padding max-w-[1200px] mx-auto w-full flex flex-col pt-8 pb-32">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-grid-gutter mt-2 gap-4">
        <div>
          <h1 className="font-headline-lg-mobile text-2xl md:text-3xl text-on-surface font-extrabold tracking-tight">
            Live Zone Map
          </h1>
          <p className="font-data-mono text-xs text-on-surface-variant mt-1 uppercase tracking-wider">
            STADIUM METRIC MONITOR
          </p>
        </div>
        <div className="flex gap-2">
          {zones.length === 0 && !loading && (
            <Button variant="secondary" onClick={handleSeedTelemetry} className="h-touch-target-min">
              Initialize Telemetry
            </Button>
          )}
          <button className="flex items-center gap-1 text-tertiary bg-tertiary-container/10 px-3 py-1.5 rounded-full border border-tertiary-container/30 font-data-mono text-xs">
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            <span>LIVE</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[30vh] gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary-container border-t-tertiary animate-spin" />
          <span className="font-data-mono text-xs text-on-surface-variant">LOADING TEL...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-gap mb-grid-gutter">
          {zones.map((zone) => (
            <ZoneCard
              key={zone.zoneId}
              zone={zone}
              onClick={() => {
                if (!startZone) {
                  setStartZone(zone.zoneId);
                } else if (startZone && !endZone && startZone !== zone.zoneId) {
                  setEndZone(zone.zoneId);
                } else {
                  setStartZone(zone.zoneId);
                  setEndZone("");
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Select Start/End form if not clicked */}
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
          onClick={handleFindWay}
          disabled={calculating || zones.length === 0}
          className="w-full h-[56px] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(233,195,73,0.2)]"
        >
          <span className="material-symbols-outlined">explore</span>
          {calculating ? "Calculating Route..." : t.findWay}
        </Button>
      </div>

      {/* Floating Route Suggestion Card */}
      {routeData && (
        <div className="fixed bottom-[80px] md:bottom-6 left-0 w-full px-container-padding z-40 pointer-events-none max-w-xl mx-auto right-0">
          <RouteCard
            steps={routeData.steps}
            estTime={routeData.estTime}
            destinationName={routeData.destinationName}
            onClose={() => setRouteData(null)}
          />
        </div>
      )}
    </div>
  );
}
