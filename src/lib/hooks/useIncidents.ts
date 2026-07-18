import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";

export interface Incident {
  id: string;
  zoneId: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  reportedAt: string;
  resolvedAt: string | null;
}

/**
 * React hook that establishes a real-time Firestore listener for incidents and provides logging functionality.
 * Automatically cleans up on unmount.
 * @returns The array of incidents, loading state, and logIncident function.
 */
export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const q = query(collection(db, "incidents"), orderBy("reportedAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Incident[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            zoneId: data.zoneId || "",
            description: data.description || "",
            severity: data.severity || "LOW",
            reportedAt: data.reportedAt || new Date().toISOString(),
            resolvedAt: data.resolvedAt || null,
          });
        });
        setIncidents(list);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * Logs a new incident via the backend API route.
   * Calls the protected API route /api/incidents/log with the user's ID token.
   * @param zoneId - The ID of the zone where the incident occurred.
   * @param description - Descriptive logs.
   * @param severity - Severity level: "LOW" | "MEDIUM" | "HIGH".
   */
  const logIncident = async (
    zoneId: string,
    description: string,
    severity: "LOW" | "MEDIUM" | "HIGH"
  ): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to log incidents");
    }
    const token = await user.getIdToken();
    const response = await fetch("/api/incidents/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ zoneId, description, severity }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to log incident");
    }
  };

  return { incidents, loading, logIncident };
}
