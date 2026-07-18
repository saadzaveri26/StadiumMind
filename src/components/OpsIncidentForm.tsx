import * as React from "react";
import { Zone } from "@/lib/hooks/useZones";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

export interface OpsIncidentFormProps {
  zones: Zone[];
  onSubmit: (zoneId: string, description: string, severity: "LOW" | "MEDIUM" | "HIGH") => Promise<void>;
  onCancel: () => void;
}

const OpsIncidentFormComponent = ({
  zones,
  onSubmit,
  onCancel,
}: OpsIncidentFormProps) => {
  const [formZoneId, setFormZoneId] = React.useState("");
  const [formDesc, setFormDesc] = React.useState("");
  const [formSeverity, setFormSeverity] = React.useState<"LOW" | "MEDIUM" | "HIGH">("LOW");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [logging, setLogging] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formZoneId || !formDesc) {
      setFormError("All fields are required");
      return;
    }
    setLogging(true);
    setFormError(null);

    try {
      await onSubmit(formZoneId, formDesc, formSeverity);
      setFormZoneId("");
      setFormDesc("");
      setFormSeverity("LOW");
    } catch (err: unknown) {
      setFormError((err as Error).message || "Failed to log incident");
    } finally {
      setLogging(false);
    }
  };

  return (
    <Card className="p-4 border border-outline-variant bg-surface-container-low max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            onClick={onCancel}
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
  );
};

OpsIncidentFormComponent.displayName = "OpsIncidentForm";

export const OpsIncidentForm = React.memo(OpsIncidentFormComponent);
