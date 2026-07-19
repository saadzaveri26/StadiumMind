"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useZones } from "@/lib/hooks/useZones";
import { translations } from "@/lib/translations";
import { ZoneCard } from "@/components/ZoneCard";
import { RouteCard } from "@/components/RouteCard";
import { NavigateForm } from "@/components/NavigateForm";
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

  const handleSeedTelemetry = React.useCallback(async () => {
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
  }, []);

  const handleFindWay = React.useCallback(async () => {
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
  }, [startZone, endZone]);

  const handleZoneClick = React.useCallback((zoneId: string) => {
    setStartZone((prevStart) => {
      if (!prevStart) {
        return zoneId;
      }
      if (prevStart === zoneId) {
        setEndZone("");
        return "";
      }
      setEndZone((prevEnd) => {
        if (!prevEnd && prevStart !== zoneId) {
          return zoneId;
        }
        return "";
      });
      return prevStart;
    });
  }, []);

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
              onClick={() => handleZoneClick(zone.zoneId)}
            />
          ))}
        </div>
      )}

      {/* Select Start/End form component */}
      <NavigateForm
        zones={zones}
        startZone={startZone}
        endZone={endZone}
        setStartZone={setStartZone}
        setEndZone={setEndZone}
        onSubmit={handleFindWay}
        calculating={calculating}
        errorMsg={errorMsg}
        translations={t}
      />

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
