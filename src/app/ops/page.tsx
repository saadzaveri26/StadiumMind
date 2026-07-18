"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useZones } from "@/lib/hooks/useZones";
import { useIncidents, Incident } from "@/lib/hooks/useIncidents";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/context/LanguageContext";
import { AlertCard } from "@/components/AlertCard";
import { IncidentRow } from "@/components/IncidentRow";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Alert {
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  message: string;
  zoneId?: string;
  timestamp: string;
}

export default function OpsDashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en!;
  
  const { user, loading: authLoading, isStaff } = useAuthContext();
  
  const { zones, loading: zonesLoading } = useZones();
  const { incidents, loading: incidentsLoading, logIncident } = useIncidents();

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      severity: "HIGH",
      title: "Crowd Surge Detected",
      message: "Camera 42 detects abnormal density movement towards North Concourse exits.",
      zoneId: "Z-104",
      timestamp: "1M AGO",
    },
    {
      severity: "MEDIUM",
      title: "Temp Anomaly",
      message: "HVAC Unit 3 in VIP Suite Level showing elevated operating temperatures.",
      zoneId: "Z-212",
      timestamp: "12M AGO",
    },
  ]);

  const [generatingAlerts, setGeneratingAlerts] = useState(false);
  
  // Incident Form state
  const [showLogForm, setShowLogForm] = useState(false);
  const [formZoneId, setFormZoneId] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formSeverity, setFormSeverity] = useState<"LOW" | "MEDIUM" | "HIGH">("LOW");
  const [formError, setFormError] = useState<string | null>(null);
  const [logging, setLogging] = useState(false);

  // Authentication check redirection
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/");
      } else if (!isStaff) {
        // Not a staff user, redirect
        router.replace("/");
      }
    }
  }, [user, authLoading, isStaff, router]);

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary-container border-t-tertiary animate-spin" />
        <span className="font-data-mono text-xs text-on-surface-variant">VERIFYING OPERATOR CREDS...</span>
      </div>
    );
  }

  // Double check if redirect is happening
  if (!user || !isStaff) {
    return null;
  }

  const handleToggleIncidentStatus = async (id: string, isResolved: boolean) => {
    try {
      const docRef = doc(db, "incidents", id);
      await updateDoc(docRef, {
        resolvedAt: isResolved ? new Date().toISOString() : null,
      });
    } catch {
      alert("Failed to toggle incident status");
    }
  };

  const handleGenerateAlerts = async () => {
    setGeneratingAlerts(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/ops/alerts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to generate alerts");

      const data = await res.json();
      const parsedAlerts = (data.alerts || []).map((a: Alert) => ({
        ...a,
        timestamp: "JUST NOW",
      }));
      setAlerts(parsedAlerts);
    } catch {
      // Fallback
    } finally {
      setGeneratingAlerts(false);
    }
  };

  const handleSubmitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formZoneId || !formDesc) {
      setFormError("All fields are required");
      return;
    }
    setLogging(true);
    setFormError(null);

    try {
      await logIncident(formZoneId, formDesc, formSeverity);
      setFormZoneId("");
      setFormDesc("");
      setFormSeverity("LOW");
      setShowLogForm(false);
    } catch (err: unknown) {
      setFormError((err as Error).message || "Failed to log incident");
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="flex-1 p-container-padding max-w-[1200px] mx-auto space-y-stack-gap pt-8 pb-32">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-grid-gutter gap-4">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-2xl md:text-3xl text-on-surface font-extrabold tracking-tight">
            {t.incidentLog} Dashboard
          </h1>
          <p className="font-data-mono text-xs text-on-surface-variant mt-1 uppercase tracking-wider">
            SYSTEM STATUS: NOMINAL | TOURNAMENT NODE MONITOR
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleGenerateAlerts}
            disabled={generatingAlerts}
            className="flex items-center gap-2 h-touch-target-min font-label-bold text-xs"
          >
            <span className="material-symbols-outlined">psychology</span>
            {generatingAlerts ? "Analyzing..." : "Generate AI Alerts"}
          </Button>
          <Button
            variant="default"
            onClick={() => setShowLogForm(!showLogForm)}
            className="flex items-center gap-2 h-touch-target-min font-label-bold text-xs"
          >
            <span className="material-symbols-outlined">add_alert</span>
            Report Incident
          </Button>
        </div>
      </div>

      {/* Report Incident Modal/Collapse Form */}
      {showLogForm && (
        <Card className="p-4 border border-outline-variant bg-surface-container-low max-w-lg">
          <form onSubmit={handleSubmitIncident} className="space-y-4">
            <h3 className="font-label-bold text-sm text-on-surface uppercase tracking-wider">
              Log Operational Threat
            </h3>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="incident-zone-select" className="text-xs text-on-surface-variant font-data-mono uppercase">Zone ID</label>
              <select
                id="incident-zone-select"
                name="incident-zone-select"
                value={formZoneId}
                onChange={(e) => setFormZoneId(e.target.value)}
                className="bg-background text-on-surface border border-outline-variant rounded-lg p-2.5 text-sm h-touch-target-min"
              >
                <option value="">Select affected zone...</option>
                {zones.map((z) => (
                  <option key={z.zoneId} value={z.zoneId}>
                    {z.zoneId} — {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="incident-description" className="text-xs text-on-surface-variant font-data-mono uppercase">Description</label>
              <textarea
                id="incident-description"
                name="incident-description"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Log details of operational incident..."
                className="bg-background text-on-surface border border-outline-variant rounded-lg p-2.5 text-sm min-h-[80px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label id="incident-severity" className="text-xs text-on-surface-variant font-data-mono uppercase">Severity</label>
              <div className="flex gap-2" role="group" aria-labelledby="incident-severity">
                {(["LOW", "MEDIUM", "HIGH"] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    aria-pressed={formSeverity === sev}
                    onClick={() => setFormSeverity(sev)}
                    className={`flex-1 py-2 text-xs font-label-bold rounded-lg border transition-all cursor-pointer ${
                      formSeverity === sev
                        ? {
                            LOW: "bg-primary-container text-primary border-primary/40",
                            MEDIUM: "bg-tertiary/20 text-tertiary border-tertiary/40",
                            HIGH: "bg-error/20 text-error border-error/40",
                          }[sev]
                        : "bg-background text-on-surface-variant border-outline-variant hover:text-on-surface"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {formError && (
              <p className="text-xs text-error font-data-mono">{formError}</p>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowLogForm(false)}
                className="h-touch-target-min px-4"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                type="submit"
                disabled={logging}
                className="h-touch-target-min px-4"
              >
                {logging ? "Logging..." : "Submit Incident"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-grid-gutter">
        {/* Zone Occupancy Table */}
        <section className="bg-[#1A1C1E] border border-outline-variant/30 rounded-xl p-4 lg:col-span-2 flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline-lg-mobile text-lg font-bold text-on-surface uppercase tracking-tight">
              {t.zoneOccupancy}
            </h3>
            <span className="material-symbols-outlined text-on-surface-variant text-[24px]">groups</span>
          </div>

          {zonesLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-primary-container border-t-tertiary animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/50">
                    <th className="font-data-mono text-xs text-on-surface-variant py-3 px-2">{t.zoneId}</th>
                    <th className="font-data-mono text-xs text-on-surface-variant py-3 px-2">{t.location}</th>
                    <th className="font-data-mono text-xs text-on-surface-variant py-3 px-2">STATUS</th>
                    <th className="font-data-mono text-xs text-on-surface-variant py-3 px-2 text-right">{t.capacity}</th>
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

        {/* AI Alert Feed wrapped in aria-live="polite" */}
        <section className="bg-[#1A1C1E] border border-outline-variant/30 rounded-xl p-4 flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline-lg-mobile text-lg font-bold text-on-surface uppercase tracking-tight">
              {t.aiAlerts}
            </h3>
            <span className="material-symbols-outlined text-tertiary text-[24px]">smart_toy</span>
          </div>

          <div
            aria-live="polite"
            className="space-y-3 flex-grow overflow-y-auto pr-1 no-scrollbar"
          >
            {alerts.map((alert, idx) => (
              <AlertCard
                key={idx}
                severity={alert.severity}
                title={alert.title}
                message={alert.message}
                zoneId={alert.zoneId}
                timestamp={alert.timestamp}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Incident Log list */}
      <section className="bg-[#1A1C1E] border border-outline-variant/30 rounded-xl p-4 mt-6">
        <div className="flex justify-between items-center mb-4 border-b border-outline-variant/30 pb-2">
          <h3 className="font-headline-lg-mobile text-lg font-bold text-on-surface uppercase tracking-tight">
            {t.incidentLog}
          </h3>
        </div>

        {incidentsLoading ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-primary-container border-t-tertiary animate-spin" />
          </div>
        ) : (
          <div className="space-y-2 max-h-[350px] overflow-y-auto no-scrollbar">
            {incidents.length === 0 ? (
              <p className="text-xs text-on-surface-variant font-data-mono py-4 text-center">
                NO ACTIVE SECURITY EVENTS REPORTED
              </p>
            ) : (
              incidents.map((incident) => (
                <IncidentRow
                  key={incident.id}
                  incident={incident}
                  onToggleStatus={handleToggleIncidentStatus}
                />
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
