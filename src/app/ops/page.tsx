"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useZones } from "@/lib/hooks/useZones";
import { useIncidents } from "@/lib/hooks/useIncidents";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/context/LanguageContext";
import { IncidentRow } from "@/components/IncidentRow";
import { Button } from "@/components/ui/button";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { OpsZoneTable } from "@/components/OpsZoneTable";
import { OpsAlertFeed, Alert } from "@/components/OpsAlertFeed";
import { OpsIncidentForm } from "@/components/OpsIncidentForm";

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
  const [showLogForm, setShowLogForm] = useState(false);

  // Authentication check redirection
  useEffect(() => {
    if (!authLoading) {
      if (!user || !isStaff) {
        router.replace("/");
      }
    }
  }, [user, authLoading, isStaff, router]);

  const handleToggleIncidentStatus = useCallback(async (id: string, isResolved: boolean) => {
    try {
      const docRef = doc(db, "incidents", id);
      await updateDoc(docRef, {
        resolvedAt: isResolved ? new Date().toISOString() : null,
      });
    } catch {
      alert("Failed to toggle incident status");
    }
  }, []);

  const handleGenerateAlerts = useCallback(async () => {
    if (!user) return;
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
  }, [user]);

  const handleSubmitIncident = useCallback(async (
    zoneId: string,
    description: string,
    severity: "LOW" | "MEDIUM" | "HIGH"
  ) => {
    await logIncident(zoneId, description, severity);
    setShowLogForm(false);
  }, [logIncident]);

  const handleToggleForm = useCallback(() => {
    setShowLogForm((prev) => !prev);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowLogForm(false);
  }, []);

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
            onClick={handleToggleForm}
            className="flex items-center gap-2 h-touch-target-min font-label-bold text-xs"
          >
            <span className="material-symbols-outlined">add_alert</span>
            Report Incident
          </Button>
        </div>
      </div>

      {/* Report Incident Modal/Collapse Form */}
      {showLogForm && (
        <OpsIncidentForm
          zones={zones}
          onSubmit={handleSubmitIncident}
          onCancel={handleCancelForm}
        />
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-grid-gutter">
        <OpsZoneTable
          zones={zones}
          loading={zonesLoading}
          translations={t}
        />

        <OpsAlertFeed
          alerts={alerts}
          translations={t}
        />
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
